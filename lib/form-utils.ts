import { AnimalType, Sex } from '@prisma/client'

// Type display mappings
export const ANIMAL_TYPE_DISPLAY: Record<AnimalType, string> = {
  BUFFALO: 'กระบือ',
  CHICKEN: 'ไก่',
  COW: 'วัว',
  PIG: 'หมู',
  HORSE: 'ม้า'
}

export const SEX_DISPLAY: Record<Sex, string> = {
  MALE: 'ตัวผู้',
  FEMALE: 'ตัวเมีย'
}

export const ANIMAL_TYPE_OPTIONS = [
  { value: 'BUFFALO', label: 'กระบือ' },
  { value: 'CHICKEN', label: 'ไก่' },
  { value: 'COW', label: 'วัว' },
  { value: 'PIG', label: 'หมู' },
  { value: 'HORSE', label: 'ม้า' }
] as const

export const SEX_OPTIONS = [
  { value: 'MALE', label: 'ตัวผู้' },
  { value: 'FEMALE', label: 'ตัวเมีย' }
] as const

// Form helper functions
export function getAnimalTypeDisplay(type: AnimalType): string {
  return ANIMAL_TYPE_DISPLAY[type] || type
}

export function getSexDisplay(sex: Sex | null): string {
  if (!sex) return 'ไม่ระบุ'
  return SEX_DISPLAY[sex] || sex
}

export function formatDate(date: Date | string | null): string {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

export function formatDisplayDate(date: Date | string | null): string {
  if (!date) return 'ไม่ระบุ'
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj)
  } catch {
    return 'ไม่ระบุ'
  }
}

// Form validation helpers
export function validateAnimalId(animalId: string): boolean {
  return /^[A-Z]{2}\d{8}\d{3}$/.test(animalId)
}

export function validatePhoneNumber(phone: string): boolean {
  return /^[0-9+\-\s()]{10,15}$/.test(phone)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Form data transformation
export function transformFormDataToApi(formData: any): any {
  const transformed = { ...formData }
  
  // Convert empty strings to null
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === '') {
      transformed[key] = null
    }
  })
  
  // Convert date strings to Date objects
  if (transformed.birthDate) {
    transformed.birthDate = new Date(transformed.birthDate)
  }
  
  return transformed
}

export function transformApiDataToForm(apiData: any): any {
  const transformed = { ...apiData }
  
  // Convert null values to empty strings for form fields
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === null) {
      transformed[key] = ''
    }
  })
  
  // Convert Date objects to date strings
  if (transformed.birthDate) {
    transformed.birthDate = formatDate(transformed.birthDate)
  }
  
  return transformed
}

// API request helpers
export async function submitAnimalForm(
  data: any, 
  mode: 'create' | 'edit',
  animalId?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const url = mode === 'create' 
      ? '/api/animals'
      : `/api/animals/${animalId}`
    
    const method = mode === 'create' ? 'POST' : 'PUT'
    const transformedData = transformFormDataToApi(data)
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transformedData)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || result.message || 'เกิดข้อผิดพลาด' }
    }
    
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Submit animal form error:', error)
    return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' }
  }
}

// Error message helpers
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
}

// Success message helpers
export function getSuccessMessage(mode: 'create' | 'edit', animalType: AnimalType): string {
  const animalName = getAnimalTypeDisplay(animalType)
  return mode === 'create' 
    ? `เพิ่ม${animalName}สำเร็จ`
    : `แก้ไขข้อมูล${animalName}สำเร็จ`
}