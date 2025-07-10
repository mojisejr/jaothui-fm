import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    console.log('Clerk webhook received:', { type, userId: data?.id })

    if (type === 'user.created') {
      const { id: clerkUserId, phone_numbers, first_name, last_name, image_url } = data

      // Get primary phone number
      const primaryPhone = phone_numbers?.find((phone: any) => phone.id === data.primary_phone_number_id)
      const phoneNumber = primaryPhone?.phone_number

      if (!phoneNumber) {
        console.error('No phone number found for user:', clerkUserId)
        return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
      }

      // Create profile
      const profile = await prisma.profile.create({
        data: {
          clerkUserId,
          phoneNumber,
          firstName: first_name || 'User',
          lastName: last_name || '',
          avatarUrl: image_url || null,
        },
      })

      // Auto-create farm for new user
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

      console.log('User profile and farm created:', { profileId: profile.id, farmId: farm.id })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Clerk webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}