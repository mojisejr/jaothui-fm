import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
})

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input data
    const validationResult = profileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { firstName, lastName, phoneNumber } = validationResult.data

    // Check if phone number is already taken by another user
    const existingProfile = await prisma.profile.findUnique({
      where: { phoneNumber },
    })

    if (existingProfile && existingProfile.clerkUserId !== user.id) {
      return NextResponse.json(
        { error: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' },
        { status: 409 }
      )
    }

    // Try to find existing profile for this user
    let profile = await prisma.profile.findUnique({
      where: { clerkUserId: user.id },
      include: {
        ownedFarms: {
          include: {
            members: true,
          },
        },
      },
    })

    if (profile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { clerkUserId: user.id },
        data: {
          firstName,
          lastName,
          phoneNumber,
          avatarUrl: user.imageUrl || null,
        },
        include: {
          ownedFarms: {
            include: {
              members: true,
            },
          },
        },
      })
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          clerkUserId: user.id,
          firstName,
          lastName,
          phoneNumber,
          avatarUrl: user.imageUrl || null,
        },
        include: {
          ownedFarms: {
            include: {
              members: true,
            },
          },
        },
      })
    }

    // Auto-create farm if none exists
    if (profile.ownedFarms.length === 0) {
      const farm = await prisma.farm.create({
        data: {
          ownerId: profile.id,
          farmName: 'ฟาร์มของฉัน',
          province: 'ไม่ระบุ',
          farmCode: `FM${Date.now()}`,
        },
      })

      // Create farm membership
      await prisma.farmMember.create({
        data: {
          farmId: farm.id,
          userId: profile.id,
          role: 'OWNER',
        },
      })

      console.log('Profile completion: farm created', { 
        profileId: profile.id, 
        farmId: farm.id 
      })
    }

    console.log('Profile completion successful:', { 
      profileId: profile.id, 
      clerkUserId: user.id 
    })

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
      },
    })
  } catch (error) {
    console.error('Profile completion error:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if profile is complete
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ complete: false, profile: null })
    }

    const isComplete = !!(
      profile.firstName && 
      profile.lastName && 
      profile.phoneNumber
    )

    return NextResponse.json({
      complete: isComplete,
      profile: isComplete ? profile : null,
    })
  } catch (error) {
    console.error('Profile check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}