'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

export default function ProfileSuccessPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [userProfile, setUserProfile] = useState<{
    firstName: string
    lastName: string
  } | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    // Get user info from Clerk or URL params
    if (user) {
      const firstName = user.firstName || 'ผู้ใช้'
      const lastName = user.lastName || ''
      setUserProfile({ firstName, lastName })
    } else {
      // If no user, redirect to sign-in
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  const handleLoginClick = () => {
    router.push('/dashboard')
  }

  if (!isLoaded || !userProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-[#f39c12]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[400px] mx-auto px-5 py-[60px] text-center">
        {/* Logo Section */}
        <div className="mb-[60px]">
          <div className="mb-[30px]">
            <Image
              src="/jaothui-logo.png"
              alt="JAOTHUI Logo"
              width={120}
              height={120}
              className="mx-auto"
              priority
            />
          </div>
          <h1 className="text-[32px] font-bold text-[#f39c12]">
            JAOTHUI
          </h1>
        </div>

        {/* Success Message */}
        <div className="mb-[80px]">
          <h2 className="text-2xl font-bold text-[#333333] mb-5">
            ยินดีต้อนรับ คุณ{userProfile.firstName} {userProfile.lastName}
          </h2>
          <p className="text-base text-[#666666]">
            กรุณาเข้าสู่ระบบเพื่อเริ่มรายการ
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleLoginClick}
          className="w-4/5 bg-[#f39c12] hover:bg-[#d68910] text-white border-none rounded-[25px] px-12 py-4 text-base font-bold transition-colors duration-200"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    </div>
  )
}