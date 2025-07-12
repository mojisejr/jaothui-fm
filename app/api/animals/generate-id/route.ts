import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateAnimalId } from '@/lib/animal-id'
import { AnimalType } from '@prisma/client'
import { z } from 'zod'

const generateIdSchema = z.object({
  animalType: z.enum(['BUFFALO', 'CHICKEN', 'COW', 'PIG', 'HORSE'])
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = generateIdSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid animal type' 
      }, { status: 400 })
    }

    const { animalType } = validationResult.data

    // Get user's farm
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId },
      include: {
        ownedFarms: { select: { id: true } }
      }
    })

    if (!profile || profile.ownedFarms.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No farm found for user' 
      }, { status: 404 })
    }

    const farmId = profile.ownedFarms[0].id

    // Generate animal ID
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
    const generatedId = generateAnimalId(animalType, existingIds, today)

    return NextResponse.json({ 
      success: true, 
      animalId: generatedId 
    })
  } catch (error) {
    console.error('Generate ID Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}