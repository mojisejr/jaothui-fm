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

      // Check if we have complete user data
      const hasCompleteData = phoneNumber && first_name && last_name

      if (!hasCompleteData) {
        console.log('Incomplete user data in webhook, user will need to complete profile:', {
          clerkUserId,
          hasPhoneNumber: !!phoneNumber,
          hasFirstName: !!first_name,
          hasLastName: !!last_name,
        })
        
        // Don't create profile yet - let the profile completion flow handle it
        // Just acknowledge the webhook
        return NextResponse.json({ 
          received: true, 
          message: 'User will complete profile on next login' 
        })
      }

      try {
        // Create profile with complete data
        const profile = await prisma.profile.create({
          data: {
            clerkUserId,
            phoneNumber,
            firstName: first_name,
            lastName: last_name,
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
      } catch (profileError) {
        console.error('Failed to create profile in webhook:', profileError)
        
        // Don't fail the webhook - the profile completion flow will handle it
        return NextResponse.json({ 
          received: true, 
          message: 'Profile creation deferred to completion flow' 
        })
      }
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