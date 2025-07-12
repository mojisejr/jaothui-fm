import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { validatePushSubscription, sendPushNotification, createSystemNotificationPayload } from '@/lib/web-push-utils';
import { z } from 'zod';

// Validation schema for push subscription
const subscriptionSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh key is required'),
    auth: z.string().min(1, 'auth key is required')
  })
});

// Validation schema for test notification
const testNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required')
});

/**
 * GET /api/notifications - Get user's notifications
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get user's farms
    const farms = await prisma.farm.findMany({
      where: { ownerId: profile.id }
    });

    if (farms.length === 0) {
      return NextResponse.json({ notifications: [] });
    }

    const farmIds = farms.map(farm => farm.id);

    // Get upcoming activities with reminder dates (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingActivities = await prisma.activity.findMany({
      where: {
        farmId: { in: farmIds },
        reminderDate: {
          gte: new Date(),
          lte: sevenDaysFromNow
        },
        status: 'PENDING'
      },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            animalId: true,
            animalType: true
          }
        }
      },
      orderBy: {
        reminderDate: 'asc'
      }
    });

    // Transform activities into notifications format
    const notifications = upcomingActivities.map(activity => ({
      id: activity.id,
      title: activity.title,
      message: `${activity.animal.name}: ${activity.title}`,
      activityDate: activity.activityDate,
      reminderDate: activity.reminderDate,
      status: activity.status,
      animal: activity.animal,
      isRead: false, // For future implementation
      type: 'reminder' as const
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications - Subscribe to push notifications or send test notification
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, subscription, testNotification } = body;

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (action === 'subscribe') {
      // Validate subscription data
      const validatedSubscription = subscriptionSchema.parse(subscription);

      if (!validatePushSubscription(validatedSubscription)) {
        return NextResponse.json(
          { error: 'Invalid subscription format' },
          { status: 400 }
        );
      }

      // Save or update push subscription in database
      await prisma.pushSubscription.upsert({
        where: {
          userId_endpoint: {
            userId: profile.id,
            endpoint: validatedSubscription.endpoint
          }
        },
        update: {
          p256dhKey: validatedSubscription.keys.p256dh,
          authKey: validatedSubscription.keys.auth,
          isActive: true,
          lastUsedAt: new Date()
        },
        create: {
          userId: profile.id,
          endpoint: validatedSubscription.endpoint,
          p256dhKey: validatedSubscription.keys.p256dh,
          authKey: validatedSubscription.keys.auth,
          isActive: true
        }
      });

      // Send welcome notification
      const welcomePayload = createSystemNotificationPayload(
        'ยินดีต้อนรับ!',
        'คุณได้เปิดใช้งานการแจ้งเตือนสำหรับฟาร์มแล้ว'
      );

      await sendPushNotification(validatedSubscription, welcomePayload);

      return NextResponse.json({ 
        success: true,
        message: 'Push notification subscription successful'
      });
    } else if (action === 'test') {
      // Send test notification
      const validatedTest = testNotificationSchema.parse(testNotification);

      // Get user's active push subscriptions
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          userId: profile.id,
          isActive: true
        }
      });

      if (subscriptions.length === 0) {
        return NextResponse.json(
          { error: 'No active push subscriptions found' },
          { status: 404 }
        );
      }

      const testPayload = createSystemNotificationPayload(
        validatedTest.title,
        validatedTest.message
      );

      let successCount = 0;
      const errors: any[] = [];

      for (const subscription of subscriptions) {
        const result = await sendPushNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey
            }
          },
          testPayload
        );

        if (result.success) {
          successCount++;
        } else {
          errors.push(result.error);
        }
      }

      return NextResponse.json({
        success: true,
        sent: successCount,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "subscribe" or "test"' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications - Unsubscribe from push notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (endpoint) {
      // Deactivate specific subscription
      await prisma.pushSubscription.updateMany({
        where: {
          userId: profile.id,
          endpoint: endpoint
        },
        data: {
          isActive: false
        }
      });
    } else {
      // Deactivate all subscriptions for the user
      await prisma.pushSubscription.updateMany({
        where: {
          userId: profile.id
        },
        data: {
          isActive: false
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Push notification subscription removed'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}