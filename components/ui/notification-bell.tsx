'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Calendar, Clock, User } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'

interface NotificationItem {
  id: string
  title: string
  message: string
  activityDate: string
  reminderDate: string | null
  status: string
  animal: {
    id: string
    name: string
    animalId: string
    animalType: string
  }
  isRead: boolean
  type: 'reminder' | 'system'
}

interface NotificationResponse {
  notifications: NotificationItem[]
}

export function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)

  // Check if push notifications are supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true)
      checkPushSubscription()
      registerServiceWorker()
    }
  }, [])

  // Register service worker
  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/service-worker.js')
        console.log('Service Worker registered:', registration)
        
        // Check if there's an update available
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found')
        })
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  // Check if user is already subscribed to push notifications
  const checkPushSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setPushSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking push subscription:', error)
    }
  }

  // Request push notification permission and subscribe
  const subscribeToPushNotifications = async () => {
    try {
      if (!pushSupported) {
        toast.error('เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือน')
        return
      }

      // Request notification permission
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        toast.error('จำเป็นต้องอนุญาตการแจ้งเตือนเพื่อใช้งานฟีเจอร์นี้')
        return
      }

      // Subscribe to push notifications
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Send subscription to server
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'subscribe',
          subscription: subscription.toJSON()
        })
      })

      if (response.ok) {
        setPushSubscribed(true)
        toast.success('เปิดใช้งานการแจ้งเตือนเรียบร้อยแล้ว')
      } else {
        toast.error('ไม่สามารถเปิดใช้งานการแจ้งเตือนได้')
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast.error('เกิดข้อผิดพลาดในการเปิดใช้งานการแจ้งเตือน')
    }
  }

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      
      if (response.ok) {
        const data: NotificationResponse = await response.json()
        setNotifications(data.notifications)
      } else {
        console.error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification: NotificationItem) => {
    // Navigate to activity detail page
    router.push(`/dashboard/activities/${notification.id}?returnTo=notification`)
    setIsOpen(false)
  }

  // Handle bell icon click
  const handleBellClick = () => {
    if (!isOpen && notifications.length === 0) {
      fetchNotifications()
    }
    setIsOpen(!isOpen)
  }

  // Get activity type icon
  const getActivityTypeIcon = (title: string) => {
    const iconMap: { [key: string]: string } = {
      'ตรวจสุขภาพ': '🏥',
      'ให้อาหาร': '🍽️',
      'ทำความสะอาด': '🧹',
      'ฉีดวัคซีน': '💉',
      'ตัดขน': '✂️',
      'อาบน้ำ': '🚿',
      'ออกกำลังกาย': '🏃',
      'ตรวจน้ำหนัก': '⚖️'
    }
    
    const lowerTitle = title.toLowerCase()
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerTitle.includes(key.toLowerCase())) {
        return icon
      }
    }
    return '📋'
  }

  // Format relative time
  const formatRelativeTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: th })
    } catch {
      return 'ไม่ทราบเวลา'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#f39c12] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-40px)] bg-white rounded-[15px] shadow-lg border z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">การแจ้งเตือน</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Push Notification Setup */}
            {pushSupported && !pushSubscribed && (
              <div className="p-4 border-b bg-[#f9f9f9]">
                <div className="text-sm text-gray-600 mb-2">
                  เปิดใช้งานการแจ้งเตือนเพื่อรับข้อมูลล่าสุด
                </div>
                <button
                  onClick={subscribeToPushNotifications}
                  className="w-full py-2 px-3 bg-[#f39c12] text-white rounded-[10px] text-sm font-medium hover:bg-[#e67e22] transition-colors"
                >
                  เปิดใช้งานการแจ้งเตือน
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f39c12] mx-auto"></div>
                  <div className="text-sm text-gray-500 mt-2">กำลังโหลด...</div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <div className="text-sm">ไม่มีการแจ้งเตือน</div>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full p-4 text-left hover:bg-[#f9f9f9] transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Activity Icon */}
                        <div className="w-10 h-10 bg-[#f5f5f5] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg" role="img">
                            {getActivityTypeIcon(notification.title)}
                          </span>
                        </div>

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.animal.name} ({notification.animal.animalId})
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-[#f39c12] rounded-full flex-shrink-0 ml-2 mt-1" />
                            )}
                          </div>

                          {/* Activity Date */}
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{formatRelativeTime(notification.activityDate)}</span>
                          </div>

                          {/* Reminder Date */}
                          {notification.reminderDate && (
                            <div className="flex items-center text-xs text-[#f39c12] mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>แจ้งเตือน: {formatRelativeTime(notification.reminderDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t">
                <button
                  onClick={() => {
                    router.push('/dashboard/activities')
                    setIsOpen(false)
                  }}
                  className="w-full py-2 px-3 text-[#f39c12] text-sm font-medium hover:bg-[#f9f9f9] rounded-[10px] transition-colors"
                >
                  ดูกิจกรรมทั้งหมด
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}