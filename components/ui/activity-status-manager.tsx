'use client'

import { useState } from 'react'
import { Check, X, Clock, RotateCcw, AlertCircle, Calendar } from 'lucide-react'
import { getActivityStatusDisplay, getActivityStatusColor, formatActivityDateDisplay } from '@/lib/activity-utils'

interface ActivityStatusManagerProps {
  activityId: string
  currentStatus: string
  activityDate: string
  reminderDate?: string | null
  onStatusUpdate: (activityId: string, newStatus: string, reminderDate?: string) => Promise<void>
  isUpdating?: boolean
}

export default function ActivityStatusManager({
  activityId,
  currentStatus,
  activityDate,
  reminderDate,
  onStatusUpdate,
  isUpdating = false
}: ActivityStatusManagerProps) {
  const [showPostponeModal, setShowPostponeModal] = useState(false)
  const [newReminderDate, setNewReminderDate] = useState('')

  const handleStatusChange = async (newStatus: string) => {
    if (isUpdating) return
    
    try {
      await onStatusUpdate(activityId, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handlePostpone = async () => {
    if (!newReminderDate) return
    
    try {
      await onStatusUpdate(activityId, 'PENDING', newReminderDate)
      setShowPostponeModal(false)
      setNewReminderDate('')
    } catch (error) {
      console.error('Error postponing reminder:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'COMPLETED':
        return <Check className="w-4 h-4" />
      case 'CANCELLED':
        return <X className="w-4 h-4" />
      case 'OVERDUE':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const canComplete = currentStatus === 'PENDING' || currentStatus === 'OVERDUE'
  const canCancel = currentStatus === 'PENDING' || currentStatus === 'OVERDUE'
  const canPostpone = (currentStatus === 'PENDING' || currentStatus === 'OVERDUE') && reminderDate

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-3">
      {/* Current Status Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: getActivityStatusColor(currentStatus) + '20' }}
          >
            <div style={{ color: getActivityStatusColor(currentStatus) }}>
              {getStatusIcon(currentStatus)}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {getActivityStatusDisplay(currentStatus)}
            </div>
            <div className="text-sm text-gray-500">
              วันที่: {formatActivityDateDisplay(activityDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Status Action Buttons */}
      {(canComplete || canCancel || canPostpone) && (
        <div className="flex flex-wrap gap-2">
          {canComplete && (
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isUpdating}
              className="flex items-center space-x-2 px-3 py-2 bg-[#2ecc71] text-white rounded-[15px] text-sm font-medium hover:bg-[#27ae60] transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>เสร็จสิ้น</span>
            </button>
          )}
          
          {canCancel && (
            <button
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={isUpdating}
              className="flex items-center space-x-2 px-3 py-2 bg-[#e74c3c] text-white rounded-[15px] text-sm font-medium hover:bg-[#c0392b] transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>ยกเลิก</span>
            </button>
          )}
          
          {canPostpone && (
            <button
              onClick={() => setShowPostponeModal(true)}
              disabled={isUpdating}
              className="flex items-center space-x-2 px-3 py-2 bg-[#f39c12] text-white rounded-[15px] text-sm font-medium hover:bg-[#e67e22] transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>เลื่อนเวลา</span>
            </button>
          )}
        </div>
      )}

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
    </div>
  )
}