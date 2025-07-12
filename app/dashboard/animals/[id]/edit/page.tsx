'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AnimalForm, { AnimalFormData } from '@/components/forms/animal-form'
import { submitAnimalForm, getSuccessMessage, getErrorMessage } from '@/lib/form-utils'
import { AnimalWithFarm, ApiResponse } from '@/lib/types'
import { AnimalType } from '@prisma/client'

export default function EditAnimalPage() {
  const params = useParams()
  const router = useRouter()
  const [animal, setAnimal] = useState<AnimalWithFarm | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/animals/${params.id}`)
        const data: ApiResponse<AnimalWithFarm> = await response.json()
        
        if (data.success && data.data) {
          setAnimal(data.data)
        } else {
          setError(data.error || 'ไม่พบข้อมูลสัตว์')
        }
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAnimal()
    }
  }, [params.id])

  const handleSubmit = async (data: AnimalFormData) => {
    if (!animal) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitAnimalForm(data, 'edit', animal.id)

      if (result.success) {
        // Show success message and redirect
        const successMessage = getSuccessMessage('edit', data.animalType as AnimalType)
        
        // Redirect to animal detail page with success message
        router.push(`/dashboard/animals/${animal.id}?success=${encodeURIComponent(successMessage)}`)
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลสัตว์')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (animal) {
      router.push(`/dashboard/animals/${animal.id}`)
    } else {
      router.push('/dashboard/animals')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  if (error && !animal) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-red-500 text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-[15px] mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push('/dashboard/animals')}
            className="bg-[#f39c12] text-white px-6 py-2 rounded-[25px] hover:bg-[#e67e22] transition-colors"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-gray-500">ไม่พบข้อมูลสัตว์</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Error Message */}
      {error && (
        <div className="max-w-md mx-auto pt-4 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-[15px] mb-4">
            {error}
          </div>
        </div>
      )}

      {/* Animal Form */}
      <AnimalForm
        initialData={animal}
        mode="edit"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}