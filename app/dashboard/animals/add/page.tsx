'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AnimalForm, { AnimalFormData } from '@/components/forms/animal-form'
import { submitAnimalForm, getSuccessMessage, getErrorMessage } from '@/lib/form-utils'
import { AnimalType } from '@prisma/client'

export default function AddAnimalPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: AnimalFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Get user's farm ID
      const farmResponse = await fetch('/api/farms')
      const farmData = await farmResponse.json()
      
      if (!farmData.success || !farmData.data.data.length) {
        throw new Error('ไม่พบข้อมูลฟาร์ม')
      }

      const farmId = farmData.data.data[0].id

      // Submit animal data
      const result = await submitAnimalForm({
        ...data,
        farmId
      }, 'create')

      if (result.success) {
        // Show success message and redirect
        const successMessage = getSuccessMessage('create', data.animalType as AnimalType)
        
        // Redirect to animal list with success message
        router.push(`/dashboard/animals?success=${encodeURIComponent(successMessage)}`)
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการเพิ่มสัตว์')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/animals')
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
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}