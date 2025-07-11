import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createActivitySchema, activityFiltersSchema } from '@/lib/validations'
import { getOrCreateProfile } from '@/lib/user'
import { ApiResponse, PaginatedResponse } from '@/lib/types'
import { Activity, ActivityStatus } from '@prisma/client'

// Extended Activity type with relations
export interface ActivityWithRelations extends Activity {
  animal: {
    id: string
    name: string
    animalId: string
    animalType: string
  }
  farm: {
    id: string
    farmName: string
  }
  creator: {
    id: string
    firstName: string
    lastName: string
  }
  completer?: {
    id: string
    firstName: string
    lastName: string
  } | null
}

export async function POST(request: NextRequest) {
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
    
    // Validate input
    const validatedData = createActivitySchema.parse(body)
    
    // Verify animal belongs to user's farm
    const animal = await prisma.animal.findFirst({
      where: {
        id: validatedData.animalId,
        farmId: validatedData.farmId,
        farm: {
          ownerId: profile.id
        }
      },
      include: {
        farm: true
      }
    })

    if (!animal) {
      return NextResponse.json(
        { success: false, error: 'Animal not found or unauthorized' },
        { status: 404 }
      )
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        ...validatedData,
        createdBy: profile.id,
        activityDate: new Date(validatedData.activityDate),
        reminderDate: validatedData.reminderDate ? new Date(validatedData.reminderDate) : null,
        status: validatedData.status || 'PENDING' // Use provided status or default to PENDING
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
        }
      }
    })

    // Create activity reminder if reminder date is provided
    if (validatedData.reminderDate) {
      await prisma.activityReminder.create({
        data: {
          activityId: activity.id,
          farmId: validatedData.farmId,
          reminderDate: new Date(validatedData.reminderDate),
          reminderTime: new Date('1970-01-01T06:00:00Z') // Default 6:00 AM
        }
      })
    }

    const response: ApiResponse<ActivityWithRelations> = {
      success: true,
      data: activity as ActivityWithRelations,
      message: 'Activity created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating activity:', error)
    
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

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams)
    
    // Validate and parse filters
    const filters = activityFiltersSchema.parse(queryParams)
    
    // Build where clause
    const whereClause: any = {
      farm: {
        ownerId: profile.id
      }
    }

    if (filters.farmId) {
      whereClause.farmId = filters.farmId
    }

    if (filters.animalId) {
      whereClause.animalId = filters.animalId
    }

    if (filters.status) {
      whereClause.status = filters.status
    }

    if (filters.dateFrom || filters.dateTo) {
      whereClause.activityDate = {}
      if (filters.dateFrom) {
        whereClause.activityDate.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        whereClause.activityDate.lte = new Date(filters.dateTo)
      }
    }

    if (filters.hasReminder !== undefined) {
      if (filters.hasReminder) {
        whereClause.reminderDate = { not: null }
      } else {
        whereClause.reminderDate = null
      }
    }

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const skip = (page - 1) * limit

    // Sorting
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'
    
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Get activities with relations
    const [activities, totalCount] = await Promise.all([
      prisma.activity.findMany({
        where: whereClause,
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
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.activity.count({
        where: whereClause
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    const response: ApiResponse<PaginatedResponse<ActivityWithRelations>> = {
      success: true,
      data: {
        data: activities as ActivityWithRelations[],
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching activities:', error)
    
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