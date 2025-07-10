import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createAnimalSchema, animalFiltersSchema } from '@/lib/validations'
import { generateAnimalId, validateAnimalId } from '@/lib/animal-id'
import { ApiResponse, AnimalWithFarm, PaginatedResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validationResult = animalFiltersSchema.safeParse(params)
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Invalid query parameters',
        message: validationResult.error.errors[0].message 
      }, { status: 400 })
    }

    const {
      farmId,
      animalType,
      status = 'ACTIVE',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = validationResult.data

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

    // Build where clause
    const whereClause: any = {
      farm: {
        id: { in: accessibleFarmIds }
      }
    }

    if (farmId) {
      whereClause.farmId = farmId
    }
    if (animalType) {
      whereClause.animalType = animalType
    }
    if (status) {
      whereClause.status = status
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { animalId: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const take = limit

    // Get animals with count
    const [animals, totalCount] = await Promise.all([
      prisma.animal.findMany({
        where: whereClause,
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
            orderBy: { activityDate: 'asc' },
            take: 5
          },
          _count: {
            select: { activities: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take
      }),
      prisma.animal.count({ where: whereClause })
    ])

    // Transform animals to match our types
    const animalData: AnimalWithFarm[] = animals.map(animal => ({
      ...animal,
      farm: {
        id: animal.farm.id,
        farmName: animal.farm.farmName,
        province: animal.farm.province,
        farmCode: animal.farm.farmCode,
        createdAt: animal.farm.createdAt,
        updatedAt: animal.farm.updatedAt,
        animalCount: 0 // Will be calculated if needed
      },
      activities: animal.activities
    }))

    // Build pagination response
    const totalPages = Math.ceil(totalCount / limit)
    const paginatedResponse: PaginatedResponse<AnimalWithFarm> = {
      data: animalData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }

    return NextResponse.json<ApiResponse<PaginatedResponse<AnimalWithFarm>>>({ 
      success: true, 
      data: paginatedResponse 
    })
  } catch (error) {
    console.error('Animals GET Error:', error)
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
    const validationResult = createAnimalSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Invalid input data',
        message: validationResult.error.errors.map(e => e.message).join(', ')
      }, { status: 400 })
    }

    const { 
      farmId, 
      animalType, 
      name, 
      animalId: providedAnimalId,
      ...rest 
    } = validationResult.data

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId },
      include: {
        ownedFarms: { select: { id: true } },
        farmMemberships: { 
          select: { farmId: true },
          where: { role: 'OWNER' }
        }
      }
    })

    if (!profile) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 })
    }

    // Check if user has access to this farm
    const hasAccess = profile.ownedFarms.some(farm => farm.id === farmId) ||
                     profile.farmMemberships.some(membership => membership.farmId === farmId)
    
    if (!hasAccess) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Access denied to this farm' 
      }, { status: 403 })
    }

    // Handle animal ID generation or validation
    let finalAnimalId: string
    
    if (providedAnimalId) {
      // Validate provided animal ID
      const validation = validateAnimalId(providedAnimalId, animalType)
      if (!validation.isValid) {
        return NextResponse.json<ApiResponse>({ 
          success: false, 
          error: validation.error 
        }, { status: 400 })
      }
      
      // Check if animal ID already exists in this farm
      const existingAnimal = await prisma.animal.findUnique({
        where: { farmId_animalId: { farmId, animalId: providedAnimalId } }
      })
      
      if (existingAnimal) {
        return NextResponse.json<ApiResponse>({ 
          success: false, 
          error: 'Animal ID already exists in this farm' 
        }, { status: 409 })
      }
      
      finalAnimalId = providedAnimalId
    } else {
      // Auto-generate animal ID
      const today = new Date()
      const typeCode = {
        BUFFALO: 'BF',
        CHICKEN: 'CK',
        COW: 'CW',
        PIG: 'PG',
        HORSE: 'HR'
      }[animalType]
      
      const datePart = today.toISOString().slice(0, 10).replace(/-/g, '')
      const prefix = `${typeCode}${datePart}`
      
      // Get existing IDs for this farm, type, and date
      const existingAnimals = await prisma.animal.findMany({
        where: {
          farmId,
          animalId: { startsWith: prefix }
        },
        select: { animalId: true },
        orderBy: { animalId: 'desc' }
      })
      
      const existingIds = existingAnimals.map(animal => animal.animalId)
      finalAnimalId = generateAnimalId(animalType, existingIds, today)
    }

    // Process optional date fields
    const processedData = {
      ...rest,
      birthDate: rest.birthDate ? new Date(rest.birthDate) : null
    }

    // Create animal
    const animal = await prisma.animal.create({
      data: {
        farmId,
        animalId: finalAnimalId,
        animalType,
        name,
        ...processedData
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
          }
        },
        _count: {
          select: { activities: true }
        }
      }
    })

    // Transform to match our types
    const animalWithFarm: AnimalWithFarm = {
      ...animal,
      farm: {
        ...animal.farm,
        animalCount: 0 // Will be calculated if needed
      },
      activities: animal.activities
    }

    console.log('Animal created successfully:', { 
      animalId: animal.id, 
      farmId: animal.farmId,
      animalCode: animal.animalId,
      animalType: animal.animalType,
      name: animal.name
    })

    return NextResponse.json<ApiResponse<AnimalWithFarm>>({ 
      success: true, 
      data: animalWithFarm 
    }, { status: 201 })
  } catch (error) {
    console.error('Create Animal Error:', error)
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Animal ID already exists in this farm' 
      }, { status: 409 })
    }
    
    return NextResponse.json<ApiResponse>({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}