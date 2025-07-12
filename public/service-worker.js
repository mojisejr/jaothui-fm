// Farm Management System - Service Worker for Push Notifications

const CACHE_NAME = 'farm-management-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/jaothui-logo.png'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  console.log('Service Worker: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activate event');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the service worker takes control immediately
  self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push event received', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('Service Worker: Push data:', data);

    const options = {
      body: data.body,
      icon: data.icon || '/jaothui-logo.png',
      badge: '/jaothui-logo.png',
      tag: data.tag || 'farm-reminder',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'ดูรายละเอียด',
          icon: '/jaothui-logo.png'
        },
        {
          action: 'complete',
          title: 'ทำเสร็จแล้ว',
          icon: '/jaothui-logo.png'
        }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200], // Vibration pattern for mobile
      silent: false
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event - handle user interaction with notifications
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notification click event', event);
  
  event.notification.close();

  if (event.action === 'view') {
    // Navigate to activity detail page
    const url = event.notification.data.url || '/dashboard';
    event.waitUntil(
      clients.openWindow(url)
    );
  } else if (event.action === 'complete') {
    // Mark activity as completed via API
    const activityId = event.notification.data.activityId;
    if (activityId) {
      event.waitUntil(
        fetch(`/api/activities/${activityId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'COMPLETED' })
        }).then(() => {
          console.log('Service Worker: Activity marked as completed');
        }).catch(error => {
          console.error('Service Worker: Error completing activity:', error);
        })
      );
    }
  } else {
    // Default click action - open the app
    const url = event.notification.data.url || '/dashboard';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Background sync event - handle offline actions (future enhancement)
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Background sync event', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      console.log('Service Worker: Performing background sync')
    );
  }
});

// Message event - handle messages from the main thread
self.addEventListener('message', function(event) {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Error handling
self.addEventListener('error', function(event) {
  console.error('Service Worker: Error event', event);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('Service Worker: Unhandled promise rejection', event);
});