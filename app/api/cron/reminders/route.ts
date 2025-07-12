import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification, createActivityReminderPayload } from '@/lib/web-push-utils';

/**
 * GET /api/cron/reminders - Daily cron job to send reminder notifications
 * This endpoint should be called by Vercel Cron daily at 6 AM
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      console.error('Cron job: Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Cron job: Starting daily reminder check at', new Date().toISOString());

    // Get today's date (reminder date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('Cron job: Checking reminders for date:', today.toISOString());

    // Find all activities with reminder dates for today that are still pending
    const activitiesWithReminders = await prisma.activity.findMany({
      where: {
        reminderDate: {
          gte: today,
          lt: tomorrow
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
        },
        farm: {
          include: {
            owner: {
              include: {
                pushSubscriptions: {
                  where: {
                    isActive: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log(`Cron job: Found ${activitiesWithReminders.length} activities with reminders for today`);

    let notificationsSent = 0;
    let notificationsFailed = 0;
    const errors: any[] = [];

    // Process each activity with reminders
    for (const activity of activitiesWithReminders) {
      try {
        const { farm, animal } = activity;
        
        console.log(`Cron job: Processing reminder for activity ${activity.id}: ${activity.title} for ${animal.name}`);

        // Create notification payload
        const notificationPayload = createActivityReminderPayload({
          id: activity.id,
          title: activity.title,
          animal: {
            name: animal.name,
            animalId: animal.animalId
          }
        });

        // Send push notifications to all active subscriptions for the farm owner
        const pushSubscriptions = farm.owner.pushSubscriptions;
        
        if (pushSubscriptions.length === 0) {
          console.log(`Cron job: No active push subscriptions for farm owner ${farm.owner.id}`);
          continue;
        }

        console.log(`Cron job: Sending notification to ${pushSubscriptions.length} subscriptions`);

        let sentToUser = 0;
        for (const subscription of pushSubscriptions) {
          const result = await sendPushNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dhKey,
                auth: subscription.authKey
              }
            },
            notificationPayload
          );

          if (result.success) {
            sentToUser++;
            
            // Update subscription last used time
            await prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { lastUsedAt: new Date() }
            });
          } else {
            console.error(`Cron job: Failed to send notification to subscription ${subscription.id}:`, result.error);
            errors.push({
              activityId: activity.id,
              subscriptionId: subscription.id,
              error: result.error
            });
            
            // If the subscription is invalid, deactivate it
            if (result.error?.statusCode === 410) {
              console.log(`Cron job: Deactivating invalid subscription ${subscription.id}`);
              await prisma.pushSubscription.update({
                where: { id: subscription.id },
                data: { isActive: false }
              });
            }
          }
        }

        if (sentToUser > 0) {
          notificationsSent++;
          console.log(`Cron job: Successfully sent notification for activity ${activity.id} to ${sentToUser} devices`);
        } else {
          notificationsFailed++;
          console.log(`Cron job: Failed to send notification for activity ${activity.id}`);
        }

        // Create a notification record in the database for tracking
        await prisma.notification.create({
          data: {
            userId: farm.ownerId,
            farmId: farm.id,
            activityId: activity.id,
            notificationType: 'REMINDER',
            title: 'ฟาร์มแจ้งเตือน',
            message: `${animal.name}: ${activity.title}`,
            pushSent: sentToUser > 0,
            pushSentAt: sentToUser > 0 ? new Date() : null
          }
        });

      } catch (error) {
        console.error(`Cron job: Error processing activity ${activity.id}:`, error);
        notificationsFailed++;
        errors.push({
          activityId: activity.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      totalActivities: activitiesWithReminders.length,
      notificationsSent,
      notificationsFailed,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('Cron job: Completed daily reminder check', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Cron job: Unexpected error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/reminders - Manual trigger for testing (dev only)
 */
export async function POST(request: NextRequest) {
  // Only allow manual triggers in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Manual triggers not allowed in production' },
      { status: 403 }
    );
  }

  // Call the GET handler for testing
  return GET(request);
}