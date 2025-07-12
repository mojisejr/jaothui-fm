'use client'

import { ActivityStatus } from '@prisma/client'
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react'
import { getActivityStatusDisplay } from '@/lib/activity-utils'

interface ActivityStatusSelectorProps {
  value: ActivityStatus
  onChange: (status: ActivityStatus) => void
  disabled?: boolean
  className?: string
}

export function ActivityStatusSelector({ 
  value, 
  onChange, 
  disabled = false, 
  className = '' 
}: ActivityStatusSelectorProps) {
  const statusOptions: { value: ActivityStatus; icon: React.ReactNode; color: string }[] = [
    {
      value: 'PENDING' as ActivityStatus,
      icon: <Clock className="w-4 h-4" />,
      color: 'text-blue-600'
    },
    {
      value: 'COMPLETED' as ActivityStatus,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600'
    },
    {
      value: 'CANCELLED' as ActivityStatus,
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-red-600'
    }
  ]

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        สถานะกิจกรรม
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as ActivityStatus)}
          disabled={disabled}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[15px] bg-[#f5f5f5] focus:ring-2 focus:ring-[#f39c12] focus:border-transparent appearance-none"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {getActivityStatusDisplay(option.value)}
            </option>
          ))}
        </select>
        
        {/* Status Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className={statusOptions.find(opt => opt.value === value)?.color || 'text-gray-400'}>
            {statusOptions.find(opt => opt.value === value)?.icon || <Clock className="w-4 h-4" />}
          </span>
        </div>
        
        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Status Description */}
      <div className="text-xs text-gray-600 mt-1">
        {value === 'PENDING' && 'กิจกรรมกำลังรอดำเนินการ'}
        {value === 'COMPLETED' && 'กิจกรรมเสร็จสิ้นแล้ว'}
        {value === 'CANCELLED' && 'กิจกรรมถูกยกเลิก'}
      </div>
    </div>
  )
}

export default ActivityStatusSelector