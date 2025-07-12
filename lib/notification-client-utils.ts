'use client'

/**
 * Client-side utilities for managing push notifications
 */

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Check if push notifications are supported in the current browser
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  return await Notification.requestPermission();
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser');
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('Service Worker registered successfully:', registration);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  const registration = await registerServiceWorker();
  
  // Check if already subscribed
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return existingSubscription.toJSON() as PushSubscription;
  }

  // Subscribe to push notifications
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error('VAPID public key not configured');
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey
  });

  return subscription.toJSON() as PushSubscription;
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const success = await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications:', success);
      return success;
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription ? (subscription.toJSON() as PushSubscription) : null;
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
}

/**
 * Send subscription to server
 */
export async function sendSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'subscribe',
        subscription
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending subscription to server:', error);
    return false;
  }
}

/**
 * Remove subscription from server
 */
export async function removeSubscriptionFromServer(endpoint: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/notifications?endpoint=${encodeURIComponent(endpoint)}`, {
      method: 'DELETE'
    });

    return response.ok;
  } catch (error) {
    console.error('Error removing subscription from server:', error);
    return false;
  }
}

/**
 * Send test notification
 */
export async function sendTestNotification(title: string, message: string): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'test',
        testNotification: { title, message }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

/**
 * Show local notification (fallback for testing)
 */
export function showLocalNotification(title: string, message: string, options?: NotificationOptions): Notification | null {
  if (!isPushNotificationSupported() || getNotificationPermission() !== 'granted') {
    return null;
  }

  const defaultOptions: NotificationOptions = {
    body: message,
    icon: '/jaothui-logo.png',
    badge: '/jaothui-logo.png',
    tag: 'local-notification',
    requireInteraction: false,
    ...options
  };

  return new Notification(title, defaultOptions);
}