import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JAOTHUI Farm Management System',
  description: 'ระบบบริหารจัดการฟาร์มสำหรับเลี้ยงสัตว์หลายประเภท',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" data-theme="jaothui">
      <body className="min-h-screen bg-base-100">
        <div className="mobile-container">
          {children}
        </div>
      </body>
    </html>
  )
}