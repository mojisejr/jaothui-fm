import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createFarmSchema } from '@/lib/validations'
import { ApiResponse, FarmWithAnimals } from '@/lib/types'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId },
      include: {
        ownedFarms: {
          include: {
            animals: {
              select: { 
                id: true, 
                animalId: true,
                name: true, 
                animalType: true,
                status: true,
                createdAt: true
              },
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true
                  }
                }
              }
            },
            _count: {
              select: {
                animals: true,
                activities: true
              }
            }
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 })
    }

    // Transform the data to match our types
    const farms: FarmWithAnimals[] = profile.ownedFarms.map(farm => ({
      ...farm,
      owner: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl
      },
      animals: farm.animals.map(animal => ({
        id: animal.id,
        animalId: animal.animalId,
        animalType: animal.animalType,
        name: animal.name,
        sex: null,
        birthDate: null,
        color: null,
        weightKg: null,
        heightCm: null,
        imageUrl: null,
        status: animal.status,
        createdAt: animal.createdAt,
        updatedAt: animal.createdAt
      })),
      members: farm.members
    }))

    return NextResponse.json<ApiResponse<FarmWithAnimals[]>>({ 
      success: true, 
      data: farms 
    })
  } catch (error) {
    console.error('Farm API GET Error:', error)
    return NextResponse.json<ApiResponse>({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = createFarmSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Invalid input data',
        message: validationResult.error.errors[0].message 
      }, { status: 400 })
    }

    const { farmName, province } = validationResult.data

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId }
    })

    if (!profile) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 })
    }

    // Create farm
    const farm = await prisma.farm.create({
      data: {
        ownerId: profile.id,
        farmName,
        province,
        farmCode: `FM${Date.now()}`
      },
      include: {
        animals: {
          select: { 
            id: true, 
            animalId: true,
            name: true, 
            animalType: true,
            status: true,
            createdAt: true
          },
          where: { status: 'ACTIVE' }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            }
          }
        },
        _count: {
          select: {
            animals: true,
            activities: true
          }
        }
      }
    })

    // Create farm membership for owner
    await prisma.farmMember.create({
      data: {
        farmId: farm.id,
        userId: profile.id,
        role: 'OWNER'
      }
    })

    // Transform the data to match our types
    const farmWithAnimals: FarmWithAnimals = {
      ...farm,
      owner: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl
      },
      animals: farm.animals.map(animal => ({
        id: animal.id,
        animalId: animal.animalId,
        animalType: animal.animalType,
        name: animal.name,
        sex: null,
        birthDate: null,
        color: null,
        weightKg: null,
        heightCm: null,
        imageUrl: null,
        status: animal.status,
        createdAt: animal.createdAt,
        updatedAt: animal.createdAt
      })),
      members: farm.members
    }

    console.log('Farm created successfully:', { 
      farmId: farm.id, 
      ownerId: profile.id,
      farmName 
    })

    return NextResponse.json<ApiResponse<FarmWithAnimals>>({ 
      success: true, 
      data: farmWithAnimals 
    }, { status: 201 })
  } catch (error) {
    console.error('Create Farm Error:', error)
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Farm code already exists' 
      }, { status: 409 })
    }
    
    return NextResponse.json<ApiResponse>({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}