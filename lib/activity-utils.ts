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
 * Activity type icons following UI-GUIDELINES.md emoji-based system
 */
const ACTIVITY_TYPE_ICONS = {
  'ตรวจสุขภาพ': '🏥',
  'ให้อาหาร': '🥬',
  'ฉีดวัคซีน': '💉',
  'ทำความสะอาด': '🧽',
  'ออกกำลังกาย': '🏃',
  'อาบน้ำ': '🚿',
  'ตรวจการเจริญเติบโต': '📏',
  'ผสมพันธุ์': '❤️',
  'คลอดลูก': '🐣',
  'รักษาโรค': '⚕️',
  'ตัดขน': '✂️',
  'ตัดเล็บ': '💅',
  'ฝึกวินัย': '🎯',
  'ขาย': '💰',
  'ซื้อ': '🛒',
  'default': '📝'
} as const;

/**
 * Get activity type icon based on activity title
 */
export function getActivityTypeIcon(title: string): string {
  // Check exact matches first
  for (const [key, icon] of Object.entries(ACTIVITY_TYPE_ICONS)) {
    if (key !== 'default' && title.includes(key)) {
      return icon;
    }
  }
  
  // Check for common keywords
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('สุขภาพ') || lowerTitle.includes('ตรวจ')) {
    return ACTIVITY_TYPE_ICONS['ตรวจสุขภาพ'];
  }
  if (lowerTitle.includes('อาหาร') || lowerTitle.includes('ให้') || lowerTitle.includes('เลี้ยง')) {
    return ACTIVITY_TYPE_ICONS['ให้อาหาร'];
  }
  if (lowerTitle.includes('วัคซีน') || lowerTitle.includes('ฉีด')) {
    return ACTIVITY_TYPE_ICONS['ฉีดวัคซีน'];
  }
  if (lowerTitle.includes('สะอาด') || lowerTitle.includes('ทำความ')) {
    return ACTIVITY_TYPE_ICONS['ทำความสะอาด'];
  }
  if (lowerTitle.includes('กำลัง') || lowerTitle.includes('ออก') || lowerTitle.includes('วิ่ง')) {
    return ACTIVITY_TYPE_ICONS['ออกกำลังกาย'];
  }
  if (lowerTitle.includes('อาบ') || lowerTitle.includes('น้ำ')) {
    return ACTIVITY_TYPE_ICONS['อาบน้ำ'];
  }
  if (lowerTitle.includes('เจริญ') || lowerTitle.includes('วัด') || lowerTitle.includes('นิ้ว')) {
    return ACTIVITY_TYPE_ICONS['ตรวจการเจริญเติบโต'];
  }
  if (lowerTitle.includes('ผสม') || lowerTitle.includes('พันธุ์')) {
    return ACTIVITY_TYPE_ICONS['ผสมพันธุ์'];
  }
  if (lowerTitle.includes('คลอด') || lowerTitle.includes('ลูก') || lowerTitle.includes('เกิด')) {
    return ACTIVITY_TYPE_ICONS['คลอดลูก'];
  }
  if (lowerTitle.includes('รักษา') || lowerTitle.includes('โรค') || lowerTitle.includes('ยา')) {
    return ACTIVITY_TYPE_ICONS['รักษาโรค'];
  }
  if (lowerTitle.includes('ตัด') && lowerTitle.includes('ขน')) {
    return ACTIVITY_TYPE_ICONS['ตัดขน'];
  }
  if (lowerTitle.includes('ตัด') && lowerTitle.includes('เล็บ')) {
    return ACTIVITY_TYPE_ICONS['ตัดเล็บ'];
  }
  if (lowerTitle.includes('ฝึก') || lowerTitle.includes('วินัย')) {
    return ACTIVITY_TYPE_ICONS['ฝึกวินัย'];
  }
  if (lowerTitle.includes('ขาย')) {
    return ACTIVITY_TYPE_ICONS['ขาย'];
  }
  if (lowerTitle.includes('ซื้อ')) {
    return ACTIVITY_TYPE_ICONS['ซื้อ'];
  }
  
  return ACTIVITY_TYPE_ICONS.default;
}

/**
 * Status colors following UI-GUIDELINES.md color system
 */
const STATUS_COLORS = {
  PENDING: '#f1c40f',    // Yellow
  IN_PROGRESS: '#3498db', // Blue
  COMPLETED: '#2ecc71',  // Green
  CANCELLED: '#e74c3c',  // Red
  OVERDUE: '#e67e22'     // Orange
} as const;

/**
 * Get activity status color (enhanced version)
 */
export function getActivityStatusColorEnhanced(status: string): string {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.PENDING;
}

/**
 * Get status badge class name for styling
 */
export function getActivityStatusBadgeClass(status: string): string {
  const classMap: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800 border-blue-200',
    'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
    'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
    'OVERDUE': 'bg-orange-100 text-orange-800 border-orange-200'
  };
  
  return classMap[status] || classMap.PENDING;
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