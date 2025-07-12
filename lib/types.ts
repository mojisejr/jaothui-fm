import { 
  Animal, 
  Farm, 
  Activity, 
  ActivityReminder,
  Notification,
  FarmMember,
  Profile,
  AnimalType,
  Sex,
  AnimalStatus,
  ActivityStatus,
  NotificationType 
} from '@prisma/client'

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Farm Related Types
export interface FarmWithAnimals extends Farm {
  animals: AnimalSummary[]
  owner: ProfileSummary
  members: FarmMemberWithProfile[]
  _count: {
    animals: number
    activities: number
  }
}

export interface FarmSummary {
  id: string
  farmName: string
  province: string
  farmCode: string | null
  createdAt: Date
  updatedAt: Date
  animalCount: number
}

export interface CreateFarmRequest {
  farmName: string
  province: string
}

// Animal Related Types
export interface AnimalWithFarm extends Animal {
  farm: FarmSummary
  activities: ActivitySummary[]
  _count: {
    activities: number
  }
}

export interface AnimalSummary {
  id: string
  animalId: string
  animalType: AnimalType
  name: string
  sex: Sex | null
  birthDate: Date | null
  color: string | null
  weightKg: number | null
  heightCm: number | null
  imageUrl: string | null
  status: AnimalStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateAnimalRequest {
  farmId: string
  animalType: AnimalType
  name: string
  animalId?: string // Optional, will be auto-generated if not provided
  sex?: Sex
  birthDate?: string // ISO date string
  color?: string
  weightKg?: number
  heightCm?: number
  motherName?: string
  fatherName?: string
  imageUrl?: string
}

export interface UpdateAnimalRequest {
  name?: string
  sex?: Sex
  birthDate?: string // ISO date string
  color?: string
  weightKg?: number
  heightCm?: number
  motherName?: string
  fatherName?: string
  imageUrl?: string
  status?: AnimalStatus
}

// Activity Related Types
export interface ActivityWithAnimal extends Activity {
  animal: AnimalSummary
  farm: FarmSummary
  creator: ProfileSummary
  completer?: ProfileSummary
  activityReminders: ActivityReminder[]
}

export interface ActivitySummary {
  id: string
  title: string
  description: string | null
  activityDate: Date
  reminderDate: Date | null
  status: ActivityStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateActivityRequest {
  animalId: string
  farmId: string
  title: string
  description?: string
  activityDate: string // ISO date string
  reminderDate?: string // ISO date string
}

export interface UpdateActivityRequest {
  title?: string
  description?: string
  activityDate?: string // ISO date string
  reminderDate?: string // ISO date string
  status?: ActivityStatus
}

// Profile Related Types
export interface ProfileSummary {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

export interface ProfileWithFarms extends Profile {
  ownedFarms: FarmWithAnimals[]
  farmMemberships: FarmMemberWithFarm[]
  _count: {
    ownedFarms: number
    farmMemberships: number
  }
}

// Farm Member Related Types
export interface FarmMemberWithProfile extends FarmMember {
  user: ProfileSummary
}

export interface FarmMemberWithFarm extends FarmMember {
  farm: FarmSummary
}

// Notification Related Types
export interface NotificationWithDetails extends Notification {
  farm: FarmSummary
  activity?: ActivitySummary
}

export interface NotificationSummary {
  id: string
  notificationType: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  farmName: string
  animalName?: string
  activityTitle?: string
}

// Animal ID Generation Types
export interface AnimalIdComponents {
  typeCode: string
  date: string
  sequence: string
  isValid: boolean
}

export interface AnimalIdValidation {
  isValid: boolean
  error?: string
}

// Statistics Types
export interface FarmStatistics {
  totalAnimals: number
  animalsByType: Record<AnimalType, number>
  pendingActivities: number
  overdueActivities: number
  completedActivitiesThisWeek: number
  upcomingReminders: number
}

export interface AnimalStatistics {
  totalActivities: number
  pendingActivities: number
  completedActivities: number
  overdueActivities: number
  lastActivityDate: Date | null
  nextReminderDate: Date | null
}

// Filter and Search Types
export interface AnimalFilters {
  farmId?: string
  animalType?: AnimalType
  status?: AnimalStatus
  search?: string // Search by name or animalId
  sortBy?: 'name' | 'animalId' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ActivityFilters {
  farmId?: string
  animalId?: string
  status?: ActivityStatus
  dateFrom?: string // ISO date string
  dateTo?: string // ISO date string
  hasReminder?: boolean
  sortBy?: 'activityDate' | 'reminderDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Error Types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiError {
  error: string
  message?: string
  validationErrors?: ValidationError[]
  statusCode: number
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>