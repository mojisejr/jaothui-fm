'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Clock, FileText, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { 
  saveActivityType, 
  getActivityTypeSuggestions, 
  getPopularActivityTypes,
  formatActivityDate 
} from '@/lib/activity-utils'

// Form validation schema
const activityFormSchema = z.object({
  title: z.string()
    .min(1, 'กรุณาระบุชื่อกิจกรรม')
    .max(200, 'ชื่อกิจกรรมต้องไม่เกิน 200 ตัวอักษร'),
  description: z.string()
    .max(1000, 'รายละเอียดต้องไม่เกิน 1000 ตัวอักษร')
    .optional(),
  activityDate: z.string()
    .min(1, 'กรุณาระบุวันที่กิจกรรม'),
  reminderDate: z.preprocess(
    (value) => {
      // Convert empty string to undefined
      if (typeof value === 'string' && value.trim() === '') {
        return undefined
      }
      return value
    },
    z.string().optional()
  ),
  animalId: z.string()
    .min(1, 'กรุณาระบุสัตว์'),
  farmId: z.string()
    .min(1, 'กรุณาระบุฟาร์ม')
}).refine(
  (data) => {
    if (data.reminderDate && data.activityDate) {
      const activityDate = new Date(data.activityDate)
      const reminderDate = new Date(data.reminderDate)
      return reminderDate <= activityDate
    }
    return true
  },
  {
    message: 'วันที่แจ้งเตือนต้องไม่เกินวันที่กิจกรรม',
    path: ['reminderDate']
  }
)

export type ActivityFormData = z.infer<typeof activityFormSchema>

interface ActivityFormProps {
  animalId: string
  farmId: string
  onSubmit: (data: ActivityFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export default function ActivityForm({
  animalId,
  farmId,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ActivityFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const suggestionRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      animalId,
      farmId,
      activityDate: formatActivityDate(new Date().toISOString()),
      title: '',
      description: '',
      reminderDate: ''
    }
  })

  const titleValue = watch('title')
  const reminderDateValue = watch('reminderDate')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('title', value)

    if (value.length > 0) {
      const titleSuggestions = getActivityTypeSuggestions(value)
      const popularTypes = getPopularActivityTypes()
      
      const combined = [...titleSuggestions, ...popularTypes]
        .filter((item, index, arr) => arr.indexOf(item) === index)
        .slice(0, 5)
        
      setSuggestions(combined)
      setShowSuggestions(combined.length > 0)
    } else {
      const popularTypes = getPopularActivityTypes().slice(0, 5)
      setSuggestions(popularTypes)
      setShowSuggestions(popularTypes.length > 0)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setValue('title', suggestion)
    setShowSuggestions(false)
  }

  const handleFormSubmit = async (data: ActivityFormData) => {
    try {
      // Save activity type to localStorage
      if (data.title.trim()) {
        saveActivityType(data.title.trim())
      }
      
      await onSubmit(data)
      reset()
      toast.success('บันทึกกิจกรรมเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error submitting activity:', error)
      
      // Show user-friendly error message
      if (error instanceof Error) {
        toast.error(`ไม่สามารถบันทึกกิจกรรมได้: ${error.message}`)
      } else {
        toast.error('ไม่สามารถบันทึกกิจกรรมได้ กรุณาลองใหม่อีกครั้ง')
      }
    }
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-[15px] p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">เพิ่มกิจกรรมใหม่</h2>
        <button
          onClick={handleCancel}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Activity Title */}
        <div className="space-y-2 relative">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            ชื่อกิจกรรม *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="title"
              type="text"
              {...register('title')}
              onChange={handleTitleChange}
              onFocus={() => {
                const popularTypes = getPopularActivityTypes().slice(0, 5)
                setSuggestions(popularTypes)
                setShowSuggestions(popularTypes.length > 0)
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow clicking
                setTimeout(() => setShowSuggestions(false), 200)
              }}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[15px] bg-[#f5f5f5] focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
              placeholder="เช่น ตรวจสุขภาพ, ให้อาหาร, ฉีดยา"
            />
          </div>
          {errors.title && (
            <div className="flex items-center space-x-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.title.message}</span>
            </div>
          )}
          
          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionRef}
              className="absolute z-10 w-full bg-white border border-gray-200 rounded-[15px] shadow-lg mt-1 max-h-40 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-[#f9f9f9] transition-colors first:rounded-t-[15px] last:rounded-b-[15px]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Activity Date */}
        <div className="space-y-2">
          <label htmlFor="activityDate" className="block text-sm font-medium text-gray-700">
            วันที่กิจกรรม *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="activityDate"
              type="date"
              {...register('activityDate')}
              min={today}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[15px] bg-[#f5f5f5] focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
            />
          </div>
          {errors.activityDate && (
            <div className="flex items-center space-x-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.activityDate.message}</span>
            </div>
          )}
        </div>

        {/* Reminder Date */}
        <div className="space-y-2">
          <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700">
            วันที่แจ้งเตือน (ไม่บังคับ)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="reminderDate"
              type="date"
              {...register('reminderDate')}
              min={today}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[15px] bg-[#f5f5f5] focus:ring-2 focus:ring-[#f39c12] focus:border-transparent"
            />
          </div>
          {errors.reminderDate && (
            <div className="flex items-center space-x-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.reminderDate.message}</span>
            </div>
          )}
          {reminderDateValue && (
            <p className="text-sm text-gray-600">
              จะได้รับการแจ้งเตือนเวลา 06:00 น. ในวันที่ {new Date(reminderDateValue).toLocaleDateString('th-TH')}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            รายละเอียดกิจกรรม (ไม่บังคับ)
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-[15px] bg-[#f5f5f5] focus:ring-2 focus:ring-[#f39c12] focus:border-transparent resize-none"
            placeholder="ระบุรายละเอียดเพิ่มเติม..."
          />
          {errors.description && (
            <div className="flex items-center space-x-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.description.message}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-[25px] text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 bg-[#f39c12] text-white rounded-[25px] font-medium hover:bg-[#e67e22] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม'}
          </button>
        </div>
      </form>
    </div>
  )
}