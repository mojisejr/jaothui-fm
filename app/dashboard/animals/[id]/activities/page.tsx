'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, Filter, Search, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ActivityHistoryCard } from '@/components/ui/activity-history-card'
import { Activity, ActivityStatus, AnimalType } from '@prisma/client'
import { formatActivityDateDisplay } from '@/lib/activity-utils'
import { AnimalWithFarm, ApiResponse } from '@/lib/types'

interface ActivityWithRelations extends Activity {
  animal: {
    id: string
    name: string
    animalId: string
    animalType: string
  }
  farm: {
    id: string
    farmName: string
  }
  creator: {
    id: string
    firstName: string
    lastName: string
  }
  completer?: {
    id: string
    firstName: string
    lastName: string
  } | null
}

interface ActivityListResponse {
  success: boolean
  data: {
    data: ActivityWithRelations[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

export default function AnimalActivitiesPage() {
  const router = useRouter()
  const params = useParams()
  const animalId = params.id as string

  const [animal, setAnimal] = useState<AnimalWithFarm | null>(null)
  const [animalLoading, setAnimalLoading] = useState(true)
  
  const [activities, setActivities] = useState<ActivityWithRelations[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFilters] = useState({
    status: '' as ActivityStatus | '',
    search: '',
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Fetch animal details
  const fetchAnimal = async () => {
    try {
      setAnimalLoading(true)
      const response = await fetch(`/api/animals/${animalId}`)
      const data: ApiResponse<AnimalWithFarm> = await response.json()
      
      if (data.success && data.data) {
        setAnimal(data.data)
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลสัตว์ได้')
        router.push('/dashboard/animals')
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสัตว์')
      router.push('/dashboard/animals')
    } finally {
      setAnimalLoading(false)
    }
  }

  // Fetch activities from API (animal-specific)
  const fetchActivities = async (page = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const queryParams = new URLSearchParams({
        animalId: animalId,
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: 'activityDate',
        sortOrder: 'desc'
      })

      // Add filters
      if (filters.status) {
        queryParams.append('status', filters.status)
      }
      if (filters.dateFrom) {
        queryParams.append('dateFrom', filters.dateFrom)
      }
      if (filters.dateTo) {
        queryParams.append('dateTo', filters.dateTo)
      }

      const response = await fetch(`/api/activities?${queryParams}`)
      const data: ActivityListResponse = await response.json()

      if (data.success) {
        if (isLoadMore) {
          setActivities(prev => [...prev, ...data.data.data])
        } else {
          setActivities(data.data.data)
        }
        setPagination(data.data.pagination)
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลกิจกรรมได้')
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Filter activities by search term (client-side for better UX)
  const applySearchFilter = () => {
    if (!filters.search.trim()) {
      setFilteredActivities(activities)
      return
    }

    const searchTerm = filters.search.toLowerCase()
    const filtered = activities.filter(activity => 
      activity.title.toLowerCase().includes(searchTerm) ||
      activity.description?.toLowerCase().includes(searchTerm)
    )
    setFilteredActivities(filtered)
  }

  // Load animal and activities when component mounts
  useEffect(() => {
    if (animalId) {
      fetchAnimal()
    }
  }, [animalId])

  // Load activities when animal loads or filters change
  useEffect(() => {
    if (animalId) {
      fetchActivities(1, false)
    }
  }, [animalId, filters.status, filters.dateFrom, filters.dateTo])

  // Apply search filter when activities or search term changes
  useEffect(() => {
    applySearchFilter()
  }, [activities, filters.search])

  // Handle activity card click
  const handleActivityClick = (activityId: string) => {
    router.push(`/dashboard/activities/${activityId}`)
  }

  // Handle load more
  const handleLoadMore = () => {
    if (pagination.hasNext && !loadingMore) {
      fetchActivities(pagination.page + 1, true)
    }
  }

  // Handle filter changes
  const handleFilterChange = (filterKey: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    })
    setShowFilters(false)
  }

  // Get animal type display
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

  if (animalLoading) {
    return (
      <div className="min-h-screen bg-[#4a4a4a] flex items-center justify-center">
        <div className="text-white">กำลังโหลด...</div>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-[#4a4a4a] flex items-center justify-center">
        <div className="text-white text-center">
          <div>ไม่พบข้อมูลสัตว์</div>
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
    <div className="min-h-screen bg-[#4a4a4a]">
      <div className="max-w-[400px] mx-auto bg-white">
        {/* Header */}
        <div className="bg-[#4a4a4a] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/dashboard/animals/${animalId}`)}
              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">กิจกรรมทั้งหมดของ {animal.name}</h1>
              <p className="text-sm text-gray-300">{getAnimalTypeDisplay(animal.animalType)} • {animal.animalId}</p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Single Tab Layout (No Reminder Tab) */}
        <div className="bg-[#f39c12] text-white py-3 px-4 text-center font-medium rounded-tl-[15px] rounded-tr-[15px]">
          กิจกรรมทั้งหมด
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="ค้นหากิจกรรม..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[15px] bg-white focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[15px] bg-white focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
              >
                <option value="">ทุกสถานะ</option>
                <option value="PENDING">รอดำเนินการ</option>
                <option value="COMPLETED">เสร็จสิ้น</option>
                <option value="CANCELLED">ยกเลิก</option>
                <option value="OVERDUE">เลยกำหนด</option>
              </select>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="วันที่เริ่ม"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-[15px] bg-white focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
                />
                <input
                  type="date"
                  placeholder="วันที่สิ้นสุด"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-[15px] bg-white focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
                />
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full py-2 px-4 text-gray-600 border border-gray-300 rounded-[15px] hover:bg-gray-100 transition-colors"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        )}

        {/* Activity List */}
        <div className="p-5 pb-32">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f39c12]"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">ไม่มีกิจกรรมสำหรับ {animal.name}</div>
              <div className="text-sm">ลองเปลี่ยนตัวกรองหรือเพิ่มกิจกรรมใหม่</div>
            </div>
          ) : (
            <>
              {filteredActivities.map((activity) => (
                <ActivityHistoryCard
                  key={activity.id}
                  activity={activity}
                  onClick={handleActivityClick}
                />
              ))}

              {/* Load More Button */}
              {pagination.hasNext && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="py-2 px-6 bg-[#f39c12] text-white rounded-[25px] font-medium hover:bg-[#e67e22] transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
                  </button>
                </div>
              )}

              {/* Activity Count */}
              <div className="text-center mt-4 text-sm text-gray-500">
                แสดง {filteredActivities.length} จาก {pagination.total} กิจกรรม
              </div>
            </>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[400px]">
          <div className="p-5 bg-white border-t">
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/dashboard/animals/${animalId}`)}
                className="flex-1 py-3 px-4 bg-[#e0e0e0] text-[#666666] rounded-[25px] font-medium text-center hover:bg-[#d0d0d0] transition-colors"
              >
                กลับไปหน้าสัตว์
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 px-4 bg-[#f39c12] text-white rounded-[25px] font-medium text-center hover:bg-[#e67e22] transition-colors"
              >
                หน้าหลัก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}