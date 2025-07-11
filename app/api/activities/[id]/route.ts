import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { updateActivitySchema } from '@/lib/validations'
import { getOrCreateProfile } from '@/lib/user'
import { ApiResponse } from '@/lib/types'
import { ActivityWithRelations } from '../route'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await getOrCreateProfile(userId)
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    const activity = await prisma.activity.findFirst({
      where: {
        id: params.id,
        farm: {
          ownerId: profile.id
        }
      },
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

    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      )
    }

    const response: ApiResponse<ActivityWithRelations> = {
      success: true,
      data: activity as ActivityWithRelations
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching activity:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await getOrCreateProfile(userId)
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateActivitySchema.parse(body)
    
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
    const updateData: any = {}
    
    if (validatedData.title) {
      updateData.title = validatedData.title
    }
    
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description
    }
    
    if (validatedData.activityDate) {
      updateData.activityDate = new Date(validatedData.activityDate)
    }
    
    if (validatedData.reminderDate !== undefined) {
      updateData.reminderDate = validatedData.reminderDate ? new Date(validatedData.reminderDate) : null
    }
    
    if (validatedData.status) {
      updateData.status = validatedData.status
      
      // If status is being set to COMPLETED, record completion info
      if (validatedData.status === 'COMPLETED') {
        updateData.completedAt = new Date()
        updateData.completedBy = profile.id
      }
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

    // Handle reminder date changes
    if (validatedData.reminderDate !== undefined) {
      if (validatedData.reminderDate) {
        // Update or create reminder
        await prisma.activityReminder.upsert({
          where: { activityId: params.id },
          update: {
            reminderDate: new Date(validatedData.reminderDate),
            notificationSent: false,
            sentAt: null
          },
          create: {
            activityId: params.id,
            farmId: existingActivity.farmId,
            reminderDate: new Date(validatedData.reminderDate),
            reminderTime: new Date('1970-01-01T06:00:00Z')
          }
        })
      } else {
        // Remove reminder
        await prisma.activityReminder.deleteMany({
          where: { activityId: params.id }
        })
      }
    }

    const response: ApiResponse<ActivityWithRelations> = {
      success: true,
      data: updatedActivity as ActivityWithRelations,
      message: 'Activity updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating activity:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await getOrCreateProfile(userId)
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

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

    // Delete activity (reminders will be cascade deleted)
    await prisma.activity.delete({
      where: { id: params.id }
    })

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Activity deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting activity:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}