'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MoreVertical, 
  Eye, 
  Check, 
  X, 
  RotateCcw, 
  Calendar 
} from 'lucide-react'
import { toast } from 'sonner'

interface ReminderActionMenuProps {
  activityId: string
  currentStatus: string
  activityDate: string
  reminderDate?: string | null
  onStatusUpdate: (activityId: string, newStatus: string, reminderDate?: string) => Promise<void>
  isUpdating?: boolean
  returnTo?: string
}

export default function ReminderActionMenu({
  activityId,
  currentStatus,
  activityDate,
  reminderDate,
  onStatusUpdate,
  isUpdating = false,
  returnTo = 'animals'
}: ReminderActionMenuProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showPostponeModal, setShowPostponeModal] = useState(false)
  const [newReminderDate, setNewReminderDate] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isMenuOpen])

  // Menu item click handlers
  const handleViewDetails = () => {
    setIsMenuOpen(false)
    router.push(`/dashboard/activities/${activityId}?returnTo=${returnTo}`)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (isUpdating) return
    
    setIsMenuOpen(false)
    
    try {
      await onStatusUpdate(activityId, newStatus)
      toast.success(
        newStatus === 'COMPLETED' 
          ? 'กิจกรรมเสร็จสิ้นแล้ว' 
          : 'ยกเลิกกิจกรรมแล้ว'
      )
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
    }
  }

  const handleOpenPostponeModal = () => {
    setIsMenuOpen(false)
    setShowPostponeModal(true)
    setNewReminderDate('')
  }

  const handlePostpone = async () => {
    if (!newReminderDate) {
      toast.error('กรุณาเลือกวันที่แจ้งเตือนใหม่')
      return
    }
    
    try {
      await onStatusUpdate(activityId, 'PENDING', newReminderDate)
      setShowPostponeModal(false)
      setNewReminderDate('')
      toast.success('เลื่อนเวลาแจ้งเตือนเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error postponing reminder:', error)
      toast.error('เกิดข้อผิดพลาดในการเลื่อนเวลา')
    }
  }

  // Check permissions
  const canComplete = currentStatus === 'PENDING' || currentStatus === 'OVERDUE'
  const canCancel = currentStatus === 'PENDING' || currentStatus === 'OVERDUE'
  const canPostpone = (currentStatus === 'PENDING' || currentStatus === 'OVERDUE') && reminderDate

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* 3-dots menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          disabled={isUpdating}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 touch-none"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>

        {/* Dropdown menu */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-[15px] shadow-lg border border-gray-200 py-2 z-50">
            {/* View Details */}
            <button
              onClick={handleViewDetails}
              className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ minHeight: '44px' }}
            >
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">ดูรายละเอียด</span>
            </button>

            {/* Complete */}
            {canComplete && (
              <button
                onClick={() => handleStatusChange('COMPLETED')}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ minHeight: '44px' }}
              >
                <Check className="w-4 h-4 text-[#2ecc71]" />
                <span className="text-sm font-medium">เสร็จสิ้น</span>
              </button>
            )}

            {/* Postpone */}
            {canPostpone && (
              <button
                onClick={handleOpenPostponeModal}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ minHeight: '44px' }}
              >
                <RotateCcw className="w-4 h-4 text-[#f39c12]" />
                <span className="text-sm font-medium">เลื่อนเวลา</span>
              </button>
            )}

            {/* Cancel */}
            {canCancel && (
              <button
                onClick={() => handleStatusChange('CANCELLED')}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ minHeight: '44px' }}
              >
                <X className="w-4 h-4 text-[#e74c3c]" />
                <span className="text-sm font-medium">ยกเลิก</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Postpone Modal */}
      {showPostponeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[15px] p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">เลื่อนเวลาแจ้งเตือน</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="newReminderDate" className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่แจ้งเตือนใหม่
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newReminderDate"
                    type="date"
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    min={today}
                    max={activityDate}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[15px] bg-[#f5f5f5] focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  เลื่อนการแจ้งเตือนไปยังวันที่ใหม่ (ก่อนวันที่กิจกรรม)
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPostponeModal(false)
                    setNewReminderDate('')
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-[15px] text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handlePostpone}
                  disabled={!newReminderDate || isUpdating}
                  className="flex-1 py-2 px-4 bg-[#f39c12] text-white rounded-[15px] font-medium hover:bg-[#e67e22] transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'กำลังบันทึก...' : 'เลื่อนเวลา'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}