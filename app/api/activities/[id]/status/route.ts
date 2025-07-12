import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateProfile } from '@/lib/user'
import { ApiResponse } from '@/lib/types'
import { ActivityStatus } from '@prisma/client'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'OVERDUE']),
  reminderDate: z.string().optional() // For postponing reminders
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await getOrCreateProfile()
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status, reminderDate } = updateStatusSchema.parse(body)

    // Check if activity exists and belongs to user
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: params.id,
        farm: {
          ownerId: profile.id
        }
      }
    })

    if (!existingActivity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = { status }
    
    // Handle status-specific logic
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
      updateData.completedBy = profile.id
    } else if (status === 'CANCELLED') {
      updateData.completedAt = new Date()
      updateData.completedBy = profile.id
    } else if (status === 'PENDING') {
      // Reset completion fields if reverting to pending
      updateData.completedAt = null
      updateData.completedBy = null
    }

    // Update activity
    const updatedActivity = await prisma.activity.update({
      where: { id: params.id },
      data: updateData,
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            animalId: true,
            animalType: true
          }
        },
        farm: {
          select: {
            id: true,
            farmName: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        completer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Handle reminder date changes (for postponing)
    if (reminderDate && status === 'PENDING') {
      // Update reminder date
      await prisma.activityReminder.updateMany({
        where: { activityId: params.id },
        data: {
          reminderDate: new Date(reminderDate),
          notificationSent: false,
          sentAt: null
        }
      })
    }

    // If activity is completed or cancelled, remove future reminders
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      await prisma.activityReminder.deleteMany({
        where: { 
          activityId: params.id,
          reminderDate: {
            gte: new Date()
          }
        }
      })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: updatedActivity,
      message: `Activity status updated to ${status.toLowerCase()}`
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating activity status:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}