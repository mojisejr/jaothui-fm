import { format } from 'date-fns'

export interface ActivityType {
  id: string
  name: string
  usage: number
  lastUsed: Date
}

export interface ActivityFormData {
  title: string
  description?: string
  activityDate: string
  reminderDate?: string
  animalId: string
  farmId: string
}

// LocalStorage key for activity types
const ACTIVITY_TYPES_KEY = 'jaothui-activity-types'

/**
 * Get activity types from localStorage
 */
export function getActivityTypes(): ActivityType[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(ACTIVITY_TYPES_KEY)
    if (!stored) return []
    
    const types = JSON.parse(stored) as ActivityType[]
    return types.sort((a, b) => b.usage - a.usage || new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
  } catch (error) {
    console.error('Error loading activity types:', error)
    return []
  }
}

/**
 * Save activity type to localStorage
 */
export function saveActivityType(typeName: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const currentTypes = getActivityTypes()
    const existingType = currentTypes.find(t => t.name.toLowerCase() === typeName.toLowerCase())
    
    if (existingType) {
      // Update existing type
      existingType.usage += 1
      existingType.lastUsed = new Date()
    } else {
      // Add new type
      currentTypes.push({
        id: generateActivityTypeId(),
        name: typeName,
        usage: 1,
        lastUsed: new Date()
      })
    }
    
    // Keep only top 20 most used types
    const sortedTypes = currentTypes
      .sort((a, b) => b.usage - a.usage || new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, 20)
    
    localStorage.setItem(ACTIVITY_TYPES_KEY, JSON.stringify(sortedTypes))
  } catch (error) {
    console.error('Error saving activity type:', error)
  }
}

/**
 * Generate unique ID for activity type
 */
function generateActivityTypeId(): string {
  return `at_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Get activity type suggestions based on input
 */
export function getActivityTypeSuggestions(input: string): string[] {
  if (!input.trim()) return []
  
  const types = getActivityTypes()
  const searchTerm = input.toLowerCase()
  
  return types
    .filter(type => type.name.toLowerCase().includes(searchTerm))
    .slice(0, 5)
    .map(type => type.name)
}

/**
 * Get popular activity types (top 10)
 */
export function getPopularActivityTypes(): string[] {
  const types = getActivityTypes()
  return types.slice(0, 10).map(type => type.name)
}

/**
 * Format activity date for API
 */
export function formatActivityDate(date: string): string {
  return format(new Date(date), 'yyyy-MM-dd')
}

/**
 * Format activity date for display
 */
export function formatActivityDateDisplay(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy')
}

/**
 * Check if reminder date is in the past
 */
export function isReminderOverdue(reminderDate: string | Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const reminder = new Date(reminderDate)
  reminder.setHours(0, 0, 0, 0)
  
  return reminder < today
}

/**
 * Get activity status display text
 */
export function getActivityStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'รอดำเนินการ',
    'IN_PROGRESS': 'กำลังดำเนินการ',
    'COMPLETED': 'เสร็จสิ้น',
    'CANCELLED': 'ยกเลิก',
    'OVERDUE': 'เกินกำหนด'
  }
  
  return statusMap[status] || status
}

/**
 * Get activity status color
 */
export function getActivityStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'PENDING': '#f39c12',
    'IN_PROGRESS': '#3498db',
    'COMPLETED': '#2ecc71',
    'CANCELLED': '#95a5a6',
    'OVERDUE': '#e74c3c'
  }
  
  return colorMap[status] || '#f39c12'
}

/**
 * Validate activity form data
 */
export function validateActivityForm(data: ActivityFormData): string[] {
  const errors: string[] = []
  
  if (!data.title.trim()) {
    errors.push('กรุณาระบุชื่อกิจกรรม')
  }
  
  if (data.title.length > 100) {
    errors.push('ชื่อกิจกรรมต้องไม่เกิน 100 ตัวอักษร')
  }
  
  if (data.description && data.description.length > 500) {
    errors.push('รายละเอียดกิจกรรมต้องไม่เกิน 500 ตัวอักษร')
  }
  
  if (!data.activityDate) {
    errors.push('กรุณาระบุวันที่กิจกรรม')
  }
  
  if (data.reminderDate && data.activityDate) {
    const activityDate = new Date(data.activityDate)
    const reminderDate = new Date(data.reminderDate)
    
    if (reminderDate > activityDate) {
      errors.push('วันที่แจ้งเตือนต้องไม่เกินวันที่กิจกรรม')
    }
  }
  
  return errors
}