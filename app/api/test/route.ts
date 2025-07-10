import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test a simple query
    const profileCount = await prisma.profile.count()
    const farmCount = await prisma.farm.count()
    
    return NextResponse.json({
      message: 'Database connection successful',
      data: {
        profileCount,
        farmCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Database connection failed', details: error },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}