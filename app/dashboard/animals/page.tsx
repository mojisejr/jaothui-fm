'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { AnimalWithFarm, ApiResponse, PaginatedResponse } from '@/lib/types'
import { AnimalType } from '@prisma/client'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ActivityStatusManager from '@/components/ui/activity-status-manager'
import { ActivityWithRelations } from '@/app/api/activities/route'
import { isReminderOverdue, formatActivityDateDisplay } from '@/lib/activity-utils'

export default function AnimalsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'animals' | 'reminders'>('animals')
  const [animals, setAnimals] = useState<AnimalWithFarm[]>([])
  const [reminders, setReminders] = useState<ActivityWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchAnimals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/animals')
      const data: ApiResponse<PaginatedResponse<AnimalWithFarm>> = await response.json()
      
      if (data.success && data.data) {
        setAnimals(data.data.data)
      } else {
        setError(data.error || 'Failed to fetch animals')
      }
    } catch (err) {
      setError('Failed to fetch animals')
    } finally {
      setLoading(false)
    }
  }

  const fetchReminders = async () => {
    try {
      const queryParams = new URLSearchParams({
        hasReminder: 'true',
        sortBy: 'reminderDate', 
        sortOrder: 'asc'
      })
      
      const response = await fetch(`/api/activities?${queryParams}`)
      const data: ApiResponse<PaginatedResponse<ActivityWithRelations>> = await response.json()
      
      if (data.success && data.data) {
        // Sort reminders: overdue first, then by date
        const sortedReminders = data.data.data.sort((a, b) => {
          const aOverdue = a.reminderDate && isReminderOverdue(a.reminderDate)
          const bOverdue = b.reminderDate && isReminderOverdue(b.reminderDate)
          
          if (aOverdue && !bOverdue) return -1
          if (!aOverdue && bOverdue) return 1
          
          if (a.reminderDate && b.reminderDate) {
            return new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime()
          }
          
          return 0
        })
        
        setReminders(sortedReminders)
      } else {
        console.error('Failed to fetch reminders:', data.error)
      }
    } catch (err) {
      console.error('Failed to fetch reminders:', err)
    }
  }

  useEffect(() => {
    fetchAnimals()
  }, [])

  useEffect(() => {
    if (activeTab === 'reminders') {
      fetchReminders()
    }
  }, [activeTab])

  const handleStatusUpdate = async (activityId: string, newStatus: string, reminderDate?: string) => {
    try {
      setUpdatingStatus(activityId)
      
      const response = await fetch(`/api/activities/${activityId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reminderDate
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh reminders list
        await fetchReminders()
      } else {
        throw new Error(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getAnimalTypeDisplay = (type: AnimalType) => {
    const typeMap = {
      BUFFALO: 'กระบือ',
      CHICKEN: 'ไก่',
      COW: 'วัว',
      PIG: 'หมู',
      HORSE: 'ม้า'
    }
    return typeMap[type] || type
  }

  const getAnimalTypeIcon = (type: AnimalType) => {
    const typeMap = {
      BUFFALO: '🐃',
      CHICKEN: '🐔',
      COW: '🐄',
      PIG: '🐷',
      HORSE: '🐎'
    }
    return typeMap[type] || '🐾'
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'ไม่ระบุ'
    return format(new Date(date), 'dd/MM/yyyy')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Tab Navigation */}
      <div className="flex">
        <button
          onClick={() => setActiveTab('animals')}
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
            activeTab === 'animals'
              ? 'bg-white text-black rounded-t-[15px] border-b-2 border-transparent'
              : 'bg-[#cccccc] text-[#666666] rounded-t-[15px]'
          }`}
        >
          กระบือในฟาร์ม
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
            activeTab === 'reminders'
              ? 'bg-white text-black rounded-t-[15px] border-b-2 border-transparent'
              : 'bg-[#cccccc] text-[#666666] rounded-t-[15px]'
          }`}
        >
          รายการแจ้งเตือน
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white p-5 min-h-screen pb-24">
        {activeTab === 'animals' && (
          <div className="space-y-4">
            {/* Add Animal Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => router.push('/dashboard/animals/add')}
                className="bg-[#f39c12] text-white px-6 py-2 rounded-[25px] font-medium hover:bg-[#e67e22] transition-colors"
              >
                + เพิ่มสัตว์ใหม่
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">กำลังโหลด...</div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : animals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                ไม่พบสัตว์ในฟาร์ม
              </div>
            ) : (
              animals.map((animal) => (
                <div
                  key={animal.id}
                  onClick={() => router.push(`/dashboard/animals/${animal.id}`)}
                  className="bg-[#f9f9f9] rounded-[15px] p-4 flex items-center space-x-4 cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                >
                  {/* Animal Image */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {animal.imageUrl ? (
                      <img
                        src={animal.imageUrl}
                        alt={`${getAnimalTypeDisplay(animal.animalType)} ${animal.name}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full bg-[#f5f5f5] rounded-lg flex flex-col items-center justify-center text-xs text-gray-600">
                                <span class="text-lg mb-1">${getAnimalTypeIcon(animal.animalType)}</span>
                                <span class="text-center font-medium">${animal.name}</span>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#f5f5f5] rounded-lg flex flex-col items-center justify-center text-xs text-gray-600">
                        <span className="text-lg mb-1">{getAnimalTypeIcon(animal.animalType)}</span>
                        <span className="text-center font-medium">{animal.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Animal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      ชื่อ{getAnimalTypeDisplay(animal.animalType)}: {animal.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      วันเกิด: {formatDate(animal.birthDate)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      หมายเลข: {animal.animalId}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-4">
            {reminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                ไม่มีรายการแจ้งเตือน
              </div>
            ) : (
              reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`bg-[#f9f9f9] rounded-[15px] p-4 border-l-4 ${
                    reminder.reminderDate && isReminderOverdue(reminder.reminderDate)
                      ? 'border-[#e74c3c]'
                      : 'border-[#f39c12]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Reminder Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {reminder.title}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          สัตว์: {reminder.animal.name} ({reminder.animal.animalId})
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          วันที่แจ้งเตือน: {reminder.reminderDate ? formatActivityDateDisplay(reminder.reminderDate) : 'ไม่ระบุ'}
                        </div>
                        {reminder.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {reminder.description}
                          </div>
                        )}
                      </div>
                      {reminder.reminderDate && isReminderOverdue(reminder.reminderDate) && (
                        <div className="text-xs text-[#e74c3c] font-medium bg-[#e74c3c] bg-opacity-10 px-2 py-1 rounded-full">
                          เกินกำหนด
                        </div>
                      )}
                    </div>

                    {/* Status Management */}
                    <ActivityStatusManager
                      activityId={reminder.id}
                      currentStatus={reminder.status}
                      activityDate={reminder.activityDate.toString()}
                      reminderDate={reminder.reminderDate?.toString()}
                      onStatusUpdate={handleStatusUpdate}
                      isUpdating={updatingStatus === reminder.id}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <Link
          href="/dashboard"
          className="bg-[#f39c12] text-white px-8 py-4 rounded-[25px] font-bold text-base shadow-lg hover:bg-[#e67e22] transition-colors"
        >
          หน้าหลัก
        </Link>
      </div>
    </div>
  )
}