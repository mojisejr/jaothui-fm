'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AnimalWithFarm, ApiResponse } from '@/lib/types'
import { AnimalType, Sex } from '@prisma/client'
import { format } from 'date-fns'
import { Search, Calendar, Hash, Heart, Users, Palette, Trophy, Ruler, ChevronLeft, Plus, Activity } from 'lucide-react'
import Link from 'next/link'
import ActivityForm, { ActivityFormData } from '@/components/forms/activity-form'

export default function AnimalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [animal, setAnimal] = useState<AnimalWithFarm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'PED' | 'ART'>('PED')
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false)

  const fetchAnimal = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/animals/${params.id}`)
      const data: ApiResponse<AnimalWithFarm> = await response.json()
      
      if (data.success && data.data) {
        setAnimal(data.data)
      } else {
        setError(data.error || 'Failed to fetch animal details')
      }
    } catch (err) {
      setError('Failed to fetch animal details')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchAnimal()
    }
  }, [params.id, fetchAnimal])

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

  const getSexDisplay = (sex: Sex | null) => {
    if (!sex) return 'ไม่ระบุ'
    return sex === 'MALE' ? 'ตัวผู้' : 'ตัวเมีย'
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'ไม่ระบุ'
    return format(new Date(date), 'dd-MM-yyyy')
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

  const getIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'buffalo': <Users className="w-5 h-5 text-[#f39c12]" />,
      'id_card': <Hash className="w-5 h-5 text-[#f39c12]" />,
      'calendar': <Calendar className="w-5 h-5 text-[#f39c12]" />,
      'gender': <Heart className="w-5 h-5 text-[#f39c12]" />,
      'color': <Palette className="w-5 h-5 text-[#f39c12]" />,
      'height': <Ruler className="w-5 h-5 text-[#f39c12]" />,
      'trophy': <Trophy className="w-5 h-5 text-[#f39c12]" />
    }
    return iconMap[type] || <Hash className="w-5 h-5 text-[#f39c12]" />
  }

  const handleActivitySubmit = async (data: ActivityFormData) => {
    if (!animal) return
    
    try {
      setIsSubmittingActivity(true)
      
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setShowActivityForm(false)
        // Success is handled by the ActivityForm component
        console.log('Activity created successfully')
      } else {
        // Provide detailed error message
        let errorMessage = 'ไม่สามารถบันทึกกิจกรรมได้'
        
        if (result.error) {
          // Handle specific validation errors
          if (result.error.includes('Invalid date format')) {
            errorMessage = 'รูปแบบวันที่ไม่ถูกต้อง กรุณาตรวจสอบวันที่กิจกรรมและวันที่แจ้งเตือน'
          } else if (result.error.includes('Animal not found')) {
            errorMessage = 'ไม่พบข้อมูลสัตว์ที่ระบุ'
          } else if (result.error.includes('Unauthorized')) {
            errorMessage = 'ไม่มีสิทธิ์ในการเข้าถึงข้อมูล'
          } else {
            errorMessage = result.error
          }
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error creating activity:', error)
      
      // Re-throw to be handled by the ActivityForm component
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง')
      }
    } finally {
      setIsSubmittingActivity(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    )
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div>{error || 'ไม่พบข้อมูลสัตว์'}</div>
          <button
            onClick={() => router.push('/dashboard/animals')}
            className="mt-4 bg-[#f39c12] text-white px-6 py-2 rounded-[25px] hover:bg-[#e67e22] transition-colors"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header with Tabs */}
      <div className="bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('PED')}
              className={`px-6 py-2 rounded-[25px] font-medium transition-colors ${
                activeTab === 'PED'
                  ? 'bg-[#f39c12] text-white'
                  : 'bg-[#e0e0e0] text-[#666666]'
              }`}
            >
              PED
            </button>
            <button
              onClick={() => setActiveTab('ART')}
              className={`px-6 py-2 rounded-[25px] font-medium transition-colors ${
                activeTab === 'ART'
                  ? 'bg-[#f39c12] text-white'
                  : 'bg-[#e0e0e0] text-[#666666]'
              }`}
            >
              ART
            </button>
          </div>
          <button className="p-2">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Animal Image */}
        <div className="bg-white rounded-[15px] p-3">
          <div className="w-full h-64 bg-gray-200 rounded-[15px] overflow-hidden flex items-center justify-center">
            {animal.imageUrl ? (
              <img
                src={animal.imageUrl}
                alt={`${getAnimalTypeDisplay(animal.animalType)} ${animal.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-[#f5f5f5] rounded-[15px] flex flex-col items-center justify-center">
                        <span class="text-6xl mb-4">${getAnimalTypeIcon(animal.animalType)}</span>
                        <span class="text-xl font-bold text-gray-700">${animal.name}</span>
                        <span class="text-sm text-gray-500 mt-2">${getAnimalTypeDisplay(animal.animalType)}</span>
                      </div>
                    `
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-[#f5f5f5] rounded-[15px] flex flex-col items-center justify-center">
                <span className="text-6xl mb-4">{getAnimalTypeIcon(animal.animalType)}</span>
                <span className="text-xl font-bold text-gray-700">{animal.name}</span>
                <span className="text-sm text-gray-500 mt-2">{getAnimalTypeDisplay(animal.animalType)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-white rounded-[15px] p-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">information</h2>
          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center space-x-3">
              {getIcon('buffalo')}
              <div className="flex-1">
                <div className="text-sm text-gray-600">Name of {getAnimalTypeDisplay(animal.animalType)}</div>
                <div className="text-base font-bold text-gray-900">{animal.name}</div>
              </div>
            </div>

            {/* Animal ID */}
            <div className="flex items-center space-x-3">
              {getIcon('id_card')}
              <div className="flex-1">
                <div className="text-sm text-gray-600">Signature id</div>
                <div className="text-base text-gray-900">{animal.animalId}</div>
              </div>
            </div>

            {/* Birth Date */}
            <div className="flex items-center space-x-3">
              {getIcon('calendar')}
              <div className="flex-1">
                <div className="text-sm text-gray-600">Birthday date</div>
                <div className="text-base text-gray-900">{formatDate(animal.birthDate)}</div>
              </div>
            </div>

            {/* Sex */}
            <div className="flex items-center space-x-3">
              {getIcon('gender')}
              <div className="flex-1">
                <div className="text-sm text-gray-600">{getAnimalTypeDisplay(animal.animalType)} sex</div>
                <div className="text-base text-gray-900">{getSexDisplay(animal.sex)}</div>
              </div>
            </div>

            {/* Mother Name */}
            {animal.motherName && (
              <div className="flex items-center space-x-3">
                {getIcon('id_card')}
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Mother id</div>
                  <div className="text-base text-gray-900">{animal.motherName}</div>
                </div>
              </div>
            )}

            {/* Father Name */}
            {animal.fatherName && (
              <div className="flex items-center space-x-3">
                {getIcon('id_card')}
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Father id</div>
                  <div className="text-base text-gray-900">{animal.fatherName}</div>
                </div>
              </div>
            )}

            {/* Height */}
            {animal.heightCm && (
              <div className="flex items-center space-x-3">
                {getIcon('height')}
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Stature</div>
                  <div className="text-base text-gray-900">{animal.heightCm} cm</div>
                </div>
              </div>
            )}

            {/* Weight */}
            {animal.weightKg && (
              <div className="flex items-center space-x-3">
                {getIcon('height')}
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Weight</div>
                  <div className="text-base text-gray-900">{animal.weightKg} kg</div>
                </div>
              </div>
            )}

            {/* Color */}
            {animal.color && (
              <div className="flex items-center space-x-3">
                {getIcon('color')}
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Colour</div>
                  <div className="text-base text-gray-900">{animal.color}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 px-2">
          {/* Add Activity Button */}
          <button 
            onClick={() => setShowActivityForm(true)}
            className="w-full bg-[#2ecc71] text-white py-4 rounded-[25px] font-bold text-base hover:bg-[#27ae60] transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มกิจกรรม</span>
          </button>

          {/* Update Button */}
          <button 
            onClick={() => router.push(`/dashboard/animals/${animal.id}/edit`)}
            className="w-full bg-[#f39c12] text-white py-4 rounded-[25px] font-bold text-base hover:bg-[#e67e22] transition-colors"
          >
            อัปเดตข้อมูล{getAnimalTypeDisplay(animal.animalType)}
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex space-x-4 px-2 pb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-[#e0e0e0] text-[#666666] py-4 rounded-[25px] font-medium text-sm hover:bg-[#d0d0d0] transition-colors"
          >
            กลับสู่หน้าหลัก
          </button>
          <button
            onClick={() => router.push('/dashboard/animals')}
            className="flex-1 bg-[#f39c12] text-white py-4 rounded-[25px] font-medium text-sm hover:bg-[#e67e22] transition-colors"
          >
            กลับไปรายการ{getAnimalTypeDisplay(animal.animalType)}
          </button>
        </div>
      </div>

      {/* Activity Form Modal */}
      {showActivityForm && animal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <ActivityForm
              animalId={animal.id}
              farmId={animal.farmId}
              onSubmit={handleActivitySubmit}
              onCancel={() => setShowActivityForm(false)}
              isSubmitting={isSubmittingActivity}
            />
          </div>
        </div>
      )}
    </div>
  )
}