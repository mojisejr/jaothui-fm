'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimalType, Sex } from '@prisma/client'
import { AnimalWithFarm } from '@/lib/types'
import { generateAnimalId } from '@/lib/animal-id'
import { Calendar, Hash, Palette, Ruler, Weight, User, Users, Heart, Camera } from 'lucide-react'

// Form validation schema
const animalFormSchema = z.object({
  animalType: z.enum(['BUFFALO', 'CHICKEN', 'COW', 'PIG', 'HORSE']),
  name: z.string()
    .min(1, 'กรุณาระบุชื่อสัตว์')
    .max(100, 'ชื่อสัตว์ต้องไม่เกิน 100 ตัวอักษร'),
  animalId: z.string()
    .min(6, 'รหัสสัตว์ต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(50, 'รหัสสัตว์ต้องไม่เกิน 50 ตัวอักษร')
    .trim(),
  sex: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.enum(['MALE', 'FEMALE']).optional()
  ),
  birthDate: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  ),
  color: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().max(50, 'สีต้องไม่เกิน 50 ตัวอักษร').optional()
  ),
  weightKg: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().positive('น้ำหนักต้องมากกว่า 0').optional()
  ),
  heightCm: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().positive('ความสูงต้องมากกว่า 0').optional()
  ),
  motherName: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().max(100, 'ชื่อแม่ต้องไม่เกิน 100 ตัวอักษร').optional()
  ),
  fatherName: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().max(100, 'ชื่อพ่อต้องไม่เกิน 100 ตัวอักษร').optional()
  ),
  imageUrl: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : val,
    z.string().url('กรุณาใส่ URL รูปภาพที่ถูกต้อง (เช่น https://example.com/image.jpg)').optional()
  ),
  farmId: z.string().optional() // Optional for form, will be added by parent component
})

export type AnimalFormData = z.infer<typeof animalFormSchema>

interface AnimalFormProps {
  initialData?: AnimalWithFarm
  mode: 'create' | 'edit'
  onSubmit: (data: AnimalFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export default function AnimalForm({ 
  initialData, 
  mode, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: AnimalFormProps) {
  const [isGeneratingId, setIsGeneratingId] = useState(false)
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false)
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<{
    exists: boolean
    message: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<AnimalFormData>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: initialData ? {
      animalType: initialData.animalType,
      name: initialData.name,
      animalId: initialData.animalId,
      sex: initialData.sex || undefined,
      birthDate: initialData.birthDate ? new Date(initialData.birthDate).toISOString().slice(0, 10) : undefined,
      color: initialData.color || undefined,
      weightKg: initialData.weightKg || undefined,
      heightCm: initialData.heightCm || undefined,
      motherName: initialData.motherName || undefined,
      fatherName: initialData.fatherName || undefined,
      imageUrl: initialData.imageUrl || undefined
    } : {
      animalType: 'BUFFALO',
      name: '',
      animalId: '',
      sex: undefined,
      birthDate: undefined,
      color: undefined,
      weightKg: undefined,
      heightCm: undefined,
      motherName: undefined,
      fatherName: undefined,
      imageUrl: undefined
    }
  })

  const selectedAnimalType = watch('animalType')
  const currentAnimalId = watch('animalId')
  const farmId = watch('farmId')

  // Generate animal ID when animal type changes (only for create mode)
  const handleGenerateId = useCallback(async () => {
    if (mode === 'edit') return
    
    setIsGeneratingId(true)
    try {
      const response = await fetch('/api/animals/generate-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ animalType: selectedAnimalType })
      })
      
      if (response.ok) {
        const data = await response.json()
        setValue('animalId', data.animalId)
      }
    } catch (error) {
      console.error('Error generating animal ID:', error)
    } finally {
      setIsGeneratingId(false)
    }
  }, [mode, selectedAnimalType, setValue])

  // Check for duplicate animal ID
  const checkDuplicate = useCallback(async (animalId: string) => {
    if (!animalId || !farmId || animalId.length < 6) {
      setDuplicateCheckResult(null)
      return
    }

    setIsDuplicateChecking(true)
    try {
      const response = await fetch('/api/animals/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          animalId, 
          farmId,
          excludeAnimalId: mode === 'edit' ? initialData?.id : undefined
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setDuplicateCheckResult(result)
      }
    } catch (error) {
      console.error('Error checking duplicate:', error)
    } finally {
      setIsDuplicateChecking(false)
    }
  }, [farmId, mode, initialData?.id])

  // Auto-generate ID only when animal type changes and ID is empty initially
  useEffect(() => {
    if (mode === 'create' && selectedAnimalType && currentAnimalId === '') {
      handleGenerateId()
    }
  }, [selectedAnimalType, mode, handleGenerateId])

  // Check duplicate when animal ID changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentAnimalId && currentAnimalId !== initialData?.animalId) {
        checkDuplicate(currentAnimalId)
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(timeoutId)
  }, [currentAnimalId, checkDuplicate, initialData?.animalId])

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

  const handleFormSubmit = async (data: AnimalFormData) => {
    // Prevent submission if duplicate exists
    if (duplicateCheckResult?.exists) {
      return
    }
    
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-md mx-auto bg-white">
        {/* Header */}
        <div className="bg-[#4a4a4a] text-white p-4 text-center">
          <h1 className="text-lg font-medium">
            {mode === 'create' ? 'เพิ่มสัตว์ใหม่' : 'แก้ไขข้อมูลสัตว์'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 space-y-4">
          {/* Animal Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Users className="inline w-4 h-4 mr-1" />
              ประเภทสัตว์ *
            </label>
            <select
              {...register('animalType')}
              className="w-full px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
              disabled={mode === 'edit'}
            >
              <option value="BUFFALO">กระบือ</option>
              <option value="CHICKEN">ไก่</option>
              <option value="COW">วัว</option>
              <option value="PIG">หมู</option>
              <option value="HORSE">ม้า</option>
            </select>
            {errors.animalType && (
              <p className="text-red-500 text-sm">{errors.animalType.message}</p>
            )}
          </div>

          {/* Animal ID */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Hash className="inline w-4 h-4 mr-1" />
              รหัสสัตว์ *
            </label>
            <div className="flex space-x-2">
              <input
                {...register('animalId')}
                type="text"
                className="flex-1 px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
                placeholder="รหัสสัตว์ (อย่างน้อย 6 ตัวอักษร)"
                disabled={mode === 'edit'}
              />
              {mode === 'create' && (
                <button
                  type="button"
                  onClick={handleGenerateId}
                  disabled={isGeneratingId}
                  className="px-4 py-2 bg-[#f39c12] text-white rounded-[15px] hover:bg-[#e67e22] disabled:bg-gray-400 transition-colors"
                >
                  {isGeneratingId ? '...' : 'สร้าง'}
                </button>
              )}
            </div>
            {errors.animalId && (
              <p className="text-red-500 text-sm">{errors.animalId.message}</p>
            )}
            {/* Duplicate check indicator */}
            {isDuplicateChecking && (
              <p className="text-gray-500 text-sm">กำลังตรวจสอบรหัสสัตว์...</p>
            )}
            {duplicateCheckResult && !isDuplicateChecking && (
              <p className={`text-sm ${duplicateCheckResult.exists ? 'text-red-500' : 'text-green-600'}`}>
                {duplicateCheckResult.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <User className="inline w-4 h-4 mr-1" />
              ชื่อ{getAnimalTypeDisplay(selectedAnimalType)} *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
              placeholder={`ชื่อ${getAnimalTypeDisplay(selectedAnimalType)}`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Heart className="inline w-4 h-4 mr-1" />
              เพศ
            </label>
            <select
              {...register('sex')}
              className="w-full px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
            >
              <option value="">ไม่ระบุ</option>
              <option value="MALE">ตัวผู้</option>
              <option value="FEMALE">ตัวเมีย</option>
            </select>
            {errors.sex && (
              <p className="text-red-500 text-sm">{errors.sex.message}</p>
            )}
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="inline w-4 h-4 mr-1" />
              วันเกิด
            </label>
            <input
              {...register('birthDate')}
              type="date"
              className="w-full px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
            />
            {errors.birthDate && (
              <p className="text-red-500 text-sm">{errors.birthDate.message}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Palette className="inline w-4 h-4 mr-1" />
              สี
            </label>
            <input
              {...register('color')}
              type="text"
              className="w-full px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
              placeholder="สีของสัตว์"
            />
            {errors.color && (
              <p className="text-red-500 text-sm">{errors.color.message}</p>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Weight className="inline w-4 h-4 mr-1" />
              น้ำหนัก (กิโลกรัม)
            </label>
            <input
              {...register('weightKg', { 
                setValueAs: (value) => value === '' ? undefined : parseFloat(value) || undefined
              })}
              type="number"
              className="w-full px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
              placeholder="น้ำหนัก"
            />
            {errors.weightKg && (
              <p className="text-red-500 text-sm">{errors.weightKg.message}</p>
            )}
          </div>

          {/* Height */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Ruler className="inline w-4 h-4 mr-1" />
              ความสูง (เซนติเมตร)
            </label>
            <input
              {...register('heightCm', { 
                setValueAs: (value) => value === '' ? undefined : parseFloat(value) || undefined
              })}
              type="number"
              className="w-full px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
              placeholder="ความสูง"
            />
            {errors.heightCm && (
              <p className="text-red-500 text-sm">{errors.heightCm.message}</p>
            )}
          </div>

          {/* Mother Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <User className="inline w-4 h-4 mr-1" />
              ชื่อแม่
            </label>
            <input
              {...register('motherName')}
              type="text"
              className="w-full px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
              placeholder="ชื่อแม่"
            />
            {errors.motherName && (
              <p className="text-red-500 text-sm">{errors.motherName.message}</p>
            )}
          </div>

          {/* Father Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <User className="inline w-4 h-4 mr-1" />
              ชื่อพ่อ
            </label>
            <input
              {...register('fatherName')}
              type="text"
              className="w-full px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
              placeholder="ชื่อพ่อ"
            />
            {errors.fatherName && (
              <p className="text-red-500 text-sm">{errors.fatherName.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Camera className="inline w-4 h-4 mr-1" />
              URL รูปภาพ
            </label>
            <input
              {...register('imageUrl')}
              type="url"
              className="w-full px-3 py-2 bg-[#f5f5f5] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#f39c12]"
              placeholder="https://example.com/image.jpg (ไม่บังคับ)"
            />
            {errors.imageUrl && (
              <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-[#e0e0e0] text-[#666666] rounded-[25px] font-medium hover:bg-[#d0d0d0] transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || duplicateCheckResult?.exists || isDuplicateChecking}
              className="flex-1 px-4 py-3 bg-[#f39c12] text-white rounded-[25px] font-medium hover:bg-[#e67e22] disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? 'กำลังบันทึก...' : (mode === 'create' ? 'เพิ่มสัตว์' : 'บันทึกการแก้ไข')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}