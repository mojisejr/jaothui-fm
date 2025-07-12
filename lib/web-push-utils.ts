import webpush from 'web-push';

// Configure VAPID details for web push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_EMAIL) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('Web Push: VAPID keys not configured. Push notifications will not work.');
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: {
    url?: string;
    activityId?: string;
    animalId?: string;
    [key: string]: any;
  };
  tag?: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Send a push notification to a specific subscription
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      throw new Error('VAPID keys not configured');
    }

    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
      {
        TTL: 86400, // 24 hours
        urgency: 'high',
        vapidDetails: {
          subject: `mailto:${process.env.VAPID_EMAIL}`,
          publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          privateKey: process.env.VAPID_PRIVATE_KEY
        }
      }
    );

    console.log('Push notification sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
}

/**
 * Send push notifications to multiple subscriptions
 */
export async function sendPushNotificationToMultiple(
  subscriptions: PushSubscriptionData[],
  payload: NotificationPayload
): Promise<{ success: number; failed: number; errors: any[] }> {
  let success = 0;
  let failed = 0;
  const errors: any[] = [];

  const promises = subscriptions.map(async (subscription) => {
    const result = await sendPushNotification(subscription, payload);
    if (result.success) {
      success++;
    } else {
      failed++;
      errors.push({
        subscription: subscription.endpoint,
        error: result.error
      });
    }
  });

  await Promise.all(promises);

  return { success, failed, errors };
}

/**
 * Validate a push subscription
 */
export function validatePushSubscription(subscription: any): subscription is PushSubscriptionData {
  return (
    subscription &&
    typeof subscription.endpoint === 'string' &&
    subscription.keys &&
    typeof subscription.keys.p256dh === 'string' &&
    typeof subscription.keys.auth === 'string'
  );
}

/**
 * Generate VAPID keys (for development setup)
 */
export function generateVapidKeys() {
  if (typeof window !== 'undefined') {
    console.warn('generateVapidKeys should only be called on the server');
    return null;
  }
  
  try {
    return webpush.generateVAPIDKeys();
  } catch (error) {
    console.error('Error generating VAPID keys:', error);
    return null;
  }
}

/**
 * Create notification payload for activity reminders
 */
export function createActivityReminderPayload(
  activity: {
    id: string;
    title: string;
    animal: {
      name: string;
      animalId: string;
    };
  }
): NotificationPayload {
  return {
    title: 'ฟาร์มแจ้งเตือน',
    body: `${activity.animal.name}: ${activity.title}`,
    icon: '/jaothui-logo.png',
    data: {
      url: `/dashboard/activities/${activity.id}?returnTo=notification`,
      activityId: activity.id,
      animalId: activity.animal.animalId
    },
    tag: `reminder-${activity.id}`
  };
}

/**
 * Create notification payload for system notifications
 */
export function createSystemNotificationPayload(
  title: string,
  message: string,
  url?: string
): NotificationPayload {
  return {
    title,
    body: message,
    icon: '/jaothui-logo.png',
    data: {
      url: url || '/dashboard'
    },
    tag: 'system-notification'
  };
}