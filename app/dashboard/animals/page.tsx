'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { AnimalWithFarm, ApiResponse, PaginatedResponse } from '@/lib/types'
import { AnimalType } from '@prisma/client'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AnimalsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'animals' | 'reminders'>('animals')
  const [animals, setAnimals] = useState<AnimalWithFarm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    fetchAnimals()
  }, [])

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

  const getAnimalImage = (type: AnimalType) => {
    // Return a placeholder for now - in production this would use the actual imageUrl
    return '/buffalo_profile.jpg'
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'ไม่ระบุ'
    return format(new Date(date), 'dd/MM/yyyy')
  }

  const pendingReminders = animals.filter(animal => 
    animal.activities.some(activity => activity.reminderDate && activity.status === 'PENDING')
  )

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
      <div className="bg-white p-5 min-h-screen">
        {activeTab === 'animals' && (
          <div className="space-y-4">
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
                    <img
                      src={animal.imageUrl || getAnimalImage(animal.animalType)}
                      alt={`${getAnimalTypeDisplay(animal.animalType)} ${animal.name}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/buffalo_profile.jpg'
                      }}
                    />
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
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">กำลังโหลด...</div>
              </div>
            ) : pendingReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                ไม่มีรายการแจ้งเตือน
              </div>
            ) : (
              pendingReminders.map((animal) => (
                <div key={animal.id} className="space-y-2">
                  {animal.activities
                    .filter(activity => activity.reminderDate && activity.status === 'PENDING')
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="bg-[#f9f9f9] rounded-[15px] p-4 border-l-4 border-[#f39c12]"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {activity.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              สัตว์: {animal.name} ({animal.animalId})
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              วันที่แจ้งเตือน: {formatDate(activity.reminderDate)}
                            </div>
                            {activity.description && (
                              <div className="text-sm text-gray-600 mt-1">
                                {activity.description}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-[#f39c12] font-medium">
                            รอดำเนินการ
                          </div>
                        </div>
                      </div>
                    ))
                  }
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