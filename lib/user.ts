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

  // If no profile exists, create one (fallback for webhook failure)
  if (!profile) {
    const primaryPhone = user.phoneNumbers?.find(phone => phone.id === user.primaryPhoneNumberId)
    const phoneNumber = primaryPhone?.phoneNumber

    if (!phoneNumber) {
      throw new Error('Phone number is required')
    }

    profile = await prisma.profile.create({
      data: {
        clerkUserId: user.id,
        phoneNumber,
        firstName: user.firstName || 'User',
        lastName: user.lastName || '',
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
  }

  return profile
}