import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse, AnimalWithFarm } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const animalId = params.id

    // Get user profile to verify access
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId },
      include: {
        ownedFarms: { select: { id: true } },
        farmMemberships: { select: { farmId: true } }
      }
    })

    if (!profile) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 })
    }

    // Get accessible farm IDs
    const accessibleFarmIds = [
      ...profile.ownedFarms.map(farm => farm.id),
      ...profile.farmMemberships.map(membership => membership.farmId)
    ]

    // Get animal with verification that user has access
    const animal = await prisma.animal.findFirst({
      where: {
        id: animalId,
        farm: {
          id: { in: accessibleFarmIds }
        }
      },
      include: {
        farm: { 
          select: { 
            id: true,
            farmName: true, 
            province: true,
            farmCode: true,
            createdAt: true,
            updatedAt: true
          } 
        },
        activities: {
          where: { status: 'PENDING' },
          select: { 
            id: true, 
            title: true, 
            description: true,
            activityDate: true,
            reminderDate: true,
            status: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { activityDate: 'asc' }
        },
        _count: {
          select: { activities: true }
        }
      }
    })

    if (!animal) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Animal not found or access denied' 
      }, { status: 404 })
    }

    // Transform to match our types
    const animalWithFarm: AnimalWithFarm = {
      ...animal,
      farm: {
        ...animal.farm,
        animalCount: 0 // Will be calculated if needed
      },
      activities: animal.activities
    }

    return NextResponse.json<ApiResponse<AnimalWithFarm>>({ 
      success: true, 
      data: animalWithFarm 
    })
  } catch (error) {
    console.error('Animal GET Error:', error)
    return NextResponse.json<ApiResponse>({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}