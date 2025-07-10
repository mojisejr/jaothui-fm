'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'

const profileSchema = z.object({
  firstName: z.string().min(1, 'กรุณาระบุชื่อ'),
  lastName: z.string().min(1, 'กรุณาระบุนามสกุล'),
  phoneNumber: z.string()
    .min(10, 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก')
    .regex(/^[0-9+\-\s()]+$/, 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileCompletePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[400px] mx-auto px-5 py-10 text-center">
        {/* Logo Section */}
        <div className="mb-8">
          <div className="mb-8">
            <Image
              src="/jaothui-logo.png"
              alt="JAOTHUI Logo"
              width={120}
              height={120}
              className="mx-auto"
              priority
            />
          </div>
          <h1 className="text-[32px] font-bold text-[#f39c12] mb-10">
            JAOTHUI
          </h1>
        </div>

        {/* Form Title */}
        <h2 className="text-2xl font-bold text-[#333333] mb-10">
          กรุณาเติมข้อมูลให้ครบถ้วน
        </h2>

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        {/* Profile Completion Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* First Name */}
          <div>
            <input
              {...register('firstName')}
              type="text"
              placeholder="ชื่อ"
              className="input w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-5 py-4 text-base placeholder-gray-500 focus:outline-none focus:border-[#f39c12] focus:ring-1 focus:ring-[#f39c12]"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <input
              {...register('lastName')}
              type="text"
              placeholder="นามสกุล"
              className="input w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-5 py-4 text-base placeholder-gray-500 focus:outline-none focus:border-[#f39c12] focus:ring-1 focus:ring-[#f39c12]"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <input
              {...register('phoneNumber')}
              type="tel"
              placeholder="เบอร์โทรศัพท์"
              className="input w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-[10px] px-5 py-4 text-base placeholder-gray-500 focus:outline-none focus:border-[#f39c12] focus:ring-1 focus:ring-[#f39c12]"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn w-4/5 bg-[#f39c12] hover:bg-[#d68910] text-white border-none rounded-[25px] px-12 py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm mr-2"></span>
              ) : null}
              {isSubmitting ? 'กำลังบันทึก...' : 'เสร็จสิ้น'}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <p className="text-[#666666] text-sm mt-8">
          ข้อมูลนี้จำเป็นสำหรับการใช้งานระบบ
        </p>
      </div>
    </div>
  )
}