'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Edit
} from 'lucide-react'
import { toast } from 'sonner'
import { Activity, ActivityStatus } from '@prisma/client'
import { 
  getActivityTypeIcon, 
  getActivityStatusDisplay, 
  getActivityStatusBadgeClass,
  formatActivityDateDisplay 
} from '@/lib/activity-utils'
import { ActivityStatusSelector } from '@/components/ui/activity-status-selector'

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

interface ActivityDetailResponse {
  success: boolean
  data: ActivityWithRelations
}

export default function ActivityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const activityId = params.id as string

  const [activity, setActivity] = useState<ActivityWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    activityDate: '',
    reminderDate: '',
    status: 'PENDING' as ActivityStatus
  })

  // Fetch activity details
  const fetchActivity = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/activities/${activityId}`)
      const data: ActivityDetailResponse = await response.json()

      if (data.success && data.data) {
        setActivity(data.data)
        setEditData({
          title: data.data.title,
          description: data.data.description || '',
          activityDate: data.data.activityDate.toString().split('T')[0],
          reminderDate: data.data.reminderDate ? data.data.reminderDate.toString().split('T')[0] : '',
          status: data.data.status
        })
      } else {
        toast.error('ไม่พบข้อมูลกิจกรรม')
        router.push('/dashboard/activities')
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      router.push('/dashboard/activities')
    } finally {
      setLoading(false)
    }
  }

  // Update activity status
  const updateActivityStatus = async (newStatus: ActivityStatus, reminderDate?: string) => {
    try {
      setIsUpdatingStatus(true)
      
      const updateData: any = { status: newStatus }
      if (reminderDate && newStatus === 'PENDING') {
        updateData.reminderDate = reminderDate
      }

      const response = await fetch(`/api/activities/${activityId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (data.success) {
        setActivity(prev => prev ? { ...prev, status: newStatus } : null)
        toast.success(getStatusUpdateMessage(newStatus))
        
        // Refresh activity data to get updated completion fields
        await fetchActivity()
      } else {
        toast.error('ไม่สามารถอัปเดตสถานะได้')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Update activity details
  const updateActivity = async () => {
    try {
      setIsUpdatingStatus(true)
      
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editData.title,
          description: editData.description || undefined,
          activityDate: editData.activityDate,
          reminderDate: editData.reminderDate || undefined,
          status: editData.status
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('อัปเดตข้อมูลกิจกรรมเรียบร้อยแล้ว')
        setIsEditing(false)
        await fetchActivity()
      } else {
        toast.error('ไม่สามารถอัปเดตข้อมูลได้')
      }
    } catch (error) {
      console.error('Error updating activity:', error)
      toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getStatusUpdateMessage = (status: ActivityStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'ทำกิจกรรมเสร็จสิ้นแล้ว'
      case 'CANCELLED':
        return 'ยกเลิกกิจกรรมแล้ว'
      case 'PENDING':
        return 'เปลี่ยนสถานะเป็นรอดำเนินการแล้ว'
      default:
        return 'อัปเดตสถานะเรียบร้อยแล้ว'
    }
  }

  useEffect(() => {
    if (activityId) {
      fetchActivity()
    }
  }, [activityId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f39c12]"></div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">ไม่พบข้อมูลกิจกรรม</div>
          <button
            onClick={() => router.push('/dashboard/activities')}
            className="py-2 px-4 bg-[#f39c12] text-white rounded-[25px] hover:bg-[#e67e22] transition-colors"
          >
            กลับไปยังรายการกิจกรรม
          </button>
        </div>
      </div>
    )
  }

  const activityIcon = getActivityTypeIcon(activity.title)
  const statusDisplay = getActivityStatusDisplay(activity.status)
  const statusBadgeClass = getActivityStatusBadgeClass(activity.status)

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[400px] mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/dashboard/activities')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">รายละเอียดกิจกรรม</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Activity Icon */}
        <div className="p-4 text-center">
          <div className="w-20 h-20 bg-[#f9f9f9] rounded-full flex items-center justify-center mx-auto mb-3 border">
            <span className="text-3xl" role="img" aria-label={`${activity.title} icon`}>
              {activityIcon}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
        </div>

        {/* Information Section */}
        <div className="m-3">
          <div className="bg-white rounded-[15px] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลกิจกรรม</h3>
            
            <div className="space-y-4">
              {/* Activity Title */}
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-700">ชื่อกิจกรรม</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-900">{activity.title}</div>
                  )}
                </div>
              </div>

              {/* Animal Info */}
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-700">สัตว์</div>
                  <div className="text-gray-900">
                    {activity.animal.name} ({activity.animal.animalId})
                  </div>
                </div>
              </div>

              {/* Activity Date */}
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-700">วันที่กิจกรรม</div>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.activityDate}
                      onChange={(e) => setEditData(prev => ({ ...prev, activityDate: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-900">{formatActivityDateDisplay(activity.activityDate)}</div>
                  )}
                </div>
              </div>

              {/* Reminder Date */}
              {(activity.reminderDate || isEditing) && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">วันที่แจ้งเตือน</div>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.reminderDate}
                        onChange={(e) => setEditData(prev => ({ ...prev, reminderDate: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
                      />
                    ) : (
                      <div className="text-gray-900">
                        {activity.reminderDate ? formatActivityDateDisplay(activity.reminderDate) : 'ไม่มีการแจ้งเตือน'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-700">สถานะ</div>
                  {isEditing ? (
                    <ActivityStatusSelector
                      value={editData.status}
                      onChange={(status) => setEditData(prev => ({ ...prev, status }))}
                      className="mt-1"
                    />
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass}`}>
                      {statusDisplay}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-700">รายละเอียด</div>
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-[#f39c12] focus:border-transparent resize-none"
                      placeholder="รายละเอียดกิจกรรม..."
                    />
                  ) : (
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {activity.description || 'ไม่มีรายละเอียด'}
                    </div>
                  )}
                </div>
              </div>

              {/* Creator & Completer Info */}
              <div className="border-t pt-4 mt-4 space-y-3">
                <div>
                  <div className="font-medium text-gray-700">ผู้สร้าง</div>
                  <div className="text-gray-900">
                    {activity.creator.firstName} {activity.creator.lastName}
                  </div>
                </div>
                
                {activity.completer && (
                  <div>
                    <div className="font-medium text-gray-700">
                      {activity.status === 'COMPLETED' ? 'ผู้ทำเสร็จ' : 'ผู้ยกเลิก'}
                    </div>
                    <div className="text-gray-900">
                      {activity.completer.firstName} {activity.completer.lastName}
                    </div>
                    {activity.completedAt && (
                      <div className="text-sm text-gray-500">
                        เมื่อ {formatActivityDateDisplay(activity.completedAt)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-3">
          {isEditing ? (
            <>
              <button
                onClick={updateActivity}
                disabled={isUpdatingStatus}
                className="w-full py-3 px-4 bg-[#f39c12] text-white rounded-[25px] font-medium hover:bg-[#e67e22] transition-colors disabled:opacity-50"
              >
                {isUpdatingStatus ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isUpdatingStatus}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-[25px] font-medium hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
            </>
          ) : (
            <>
              {/* Status Management Buttons */}
              {activity.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateActivityStatus('COMPLETED')}
                    disabled={isUpdatingStatus}
                    className="py-3 px-4 bg-green-600 text-white rounded-[25px] font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>เสร็จสิ้น</span>
                  </button>
                  <button
                    onClick={() => updateActivityStatus('CANCELLED')}
                    disabled={isUpdatingStatus}
                    className="py-3 px-4 bg-red-600 text-white rounded-[25px] font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>ยกเลิก</span>
                  </button>
                </div>
              )}

              {(activity.status === 'COMPLETED' || activity.status === 'CANCELLED') && (
                <button
                  onClick={() => updateActivityStatus('PENDING')}
                  disabled={isUpdatingStatus}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-[25px] font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>กลับเป็นรอดำเนินการ</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="p-4 border-t">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/dashboard/activities')}
              className="py-3 px-4 border border-gray-300 text-gray-700 rounded-[25px] font-medium hover:bg-gray-50 transition-colors"
            >
              กลับไปรายการ
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="py-3 px-4 bg-[#f39c12] text-white rounded-[25px] font-medium hover:bg-[#e67e22] transition-colors"
            >
              หน้าหลัก
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}