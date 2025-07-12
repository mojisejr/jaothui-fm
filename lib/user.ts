import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getOrCreateProfile() {
  const user = await currentUser()
  
  if (!user) {
    return null
  }

  // Try to find existing profile
  let profile = await prisma.profile.findUnique({
    where: { clerkUserId: user.id },
    include: {
      ownedFarms: {
        include: {
          members: true,
          animals: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  })

  // If profile exists, return it (complete or incomplete)
  if (profile) {
    return profile
  }

  // If no profile exists, try to create one (fallback for webhook failure)
  // Only create if we have complete data, otherwise let the profile completion flow handle it
  const primaryPhone = user.phoneNumbers?.find(phone => phone.id === user.primaryPhoneNumberId)
  const phoneNumber = primaryPhone?.phoneNumber

  if (!phoneNumber || !user.firstName || !user.lastName) {
    // Profile is incomplete, return null to trigger profile completion flow
    return null
  }

  try {
    profile = await prisma.profile.create({
      data: {
        clerkUserId: user.id,
        phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.imageUrl || null,
      },
      include: {
        ownedFarms: {
          include: {
            members: true,
            animals: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

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
    }

    return profile
  } catch (error) {
    console.error('Failed to create profile:', error)
    // If profile creation fails, return null to trigger profile completion flow
    return null
  }
}

export async function checkProfileCompleteness(clerkUserId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
      },
    })

    if (!profile) {
      return { complete: false, profile: null }
    }

    const isComplete = !!(
      profile.firstName && 
      profile.lastName && 
      profile.phoneNumber
    )

    return {
      complete: isComplete,
      profile: isComplete ? profile : null,
    }
  } catch (error) {
    console.error('Error checking profile completeness:', error)
    return { complete: false, profile: null }
  }
}