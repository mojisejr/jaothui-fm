import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

interface CheckDuplicateRequest {
  animalId: string
  farmId?: string
  excludeAnimalId?: string // For edit mode to exclude current animal
}

interface CheckDuplicateResponse {
  exists: boolean
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { exists: false, message: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { animalId, farmId, excludeAnimalId }: CheckDuplicateRequest = await request.json()

    if (!animalId || !farmId) {
      return NextResponse.json(
        { exists: false, message: 'Animal ID and Farm ID are required' }, 
        { status: 400 }
      )
    }

    // Get user's profile and verify farm access
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId },
      include: { ownedFarms: { where: { id: farmId } } }
    })

    if (!profile || profile.ownedFarms.length === 0) {
      return NextResponse.json(
        { exists: false, message: 'Access denied to this farm' }, 
        { status: 403 }
      )
    }

    // Check if animal ID exists (excluding current animal in edit mode)
    const whereClause: any = {
      farmId_animalId: { farmId, animalId }
    }

    if (excludeAnimalId) {
      whereClause.NOT = { id: excludeAnimalId }
    }

    const existingAnimal = await prisma.animal.findFirst({
      where: whereClause
    })

    const response: CheckDuplicateResponse = {
      exists: !!existingAnimal,
      message: existingAnimal ? 'รหัสสัตว์นี้มีอยู่แล้วในฟาร์ม' : 'รหัสสัตว์พร้อมใช้งาน'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error checking duplicate animal ID:', error)
    return NextResponse.json(
      { exists: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' }, 
      { status: 500 }
    )
  }
}