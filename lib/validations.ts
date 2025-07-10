import { z } from 'zod'
import { AnimalType, Sex, AnimalStatus, ActivityStatus } from '@prisma/client'

// Common validation schemas
const uuidSchema = z.string().uuid('Invalid UUID format')
const dateStringSchema = z.string().refine(
  (date) => !isNaN(Date.parse(date)),
  'Invalid date format'
)
const positiveIntSchema = z.number().int().positive('Must be a positive integer')
const optionalPositiveIntSchema = z.number().int().positive().optional()

// Animal Type Enum validation
const animalTypeSchema = z.enum([
  'BUFFALO',
  'CHICKEN', 
  'COW',
  'PIG',
  'HORSE'
] as const)

// Sex Enum validation
const sexSchema = z.enum(['MALE', 'FEMALE'] as const)

// Animal Status Enum validation
const animalStatusSchema = z.enum([
  'ACTIVE',
  'SOLD',
  'DECEASED',
  'TRANSFERRED'
] as const)

// Activity Status Enum validation
const activityStatusSchema = z.enum([
  'PENDING',
  'COMPLETED',
  'CANCELLED',
  'OVERDUE'
] as const)

// Farm validation schemas
export const createFarmSchema = z.object({
  farmName: z.string()
    .min(1, 'Farm name is required')
    .max(100, 'Farm name must be less than 100 characters')
    .trim(),
  province: z.string()
    .min(1, 'Province is required')
    .max(50, 'Province must be less than 50 characters')
    .trim()
})

export const updateFarmSchema = z.object({
  farmName: z.string()
    .min(1, 'Farm name is required')
    .max(100, 'Farm name must be less than 100 characters')
    .trim()
    .optional(),
  province: z.string()
    .min(1, 'Province is required')
    .max(50, 'Province must be less than 50 characters')
    .trim()
    .optional()
})

// Animal validation schemas
export const createAnimalSchema = z.object({
  farmId: uuidSchema,
  animalType: animalTypeSchema,
  name: z.string()
    .min(1, 'Animal name is required')
    .max(100, 'Animal name must be less than 100 characters')
    .trim(),
  animalId: z.string()
    .min(6, 'Animal ID must be at least 6 characters')
    .max(50, 'Animal ID must be less than 50 characters')
    .trim()
    .optional(),
  sex: sexSchema.optional(),
  birthDate: dateStringSchema.optional(),
  color: z.string()
    .max(50, 'Color must be less than 50 characters')
    .trim()
    .optional(),
  weightKg: optionalPositiveIntSchema,
  heightCm: optionalPositiveIntSchema,
  motherName: z.string()
    .max(100, 'Mother name must be less than 100 characters')
    .trim()
    .optional(),
  fatherName: z.string()
    .max(100, 'Father name must be less than 100 characters')
    .trim()
    .optional(),
  imageUrl: z.string()
    .url('Invalid image URL')
    .optional()
})

export const updateAnimalSchema = z.object({
  name: z.string()
    .min(1, 'Animal name is required')
    .max(100, 'Animal name must be less than 100 characters')
    .trim()
    .optional(),
  sex: sexSchema.optional(),
  birthDate: dateStringSchema.optional(),
  color: z.string()
    .max(50, 'Color must be less than 50 characters')
    .trim()
    .optional(),
  weightKg: optionalPositiveIntSchema,
  heightCm: optionalPositiveIntSchema,
  motherName: z.string()
    .max(100, 'Mother name must be less than 100 characters')
    .trim()
    .optional(),
  fatherName: z.string()
    .max(100, 'Father name must be less than 100 characters')
    .trim()
    .optional(),
  imageUrl: z.string()
    .url('Invalid image URL')
    .optional(),
  status: animalStatusSchema.optional()
})

// Activity validation schemas
export const createActivitySchema = z.object({
  animalId: uuidSchema,
  farmId: uuidSchema,
  title: z.string()
    .min(1, 'Activity title is required')
    .max(200, 'Activity title must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),
  activityDate: dateStringSchema,
  reminderDate: dateStringSchema.optional()
}).refine(
  (data) => {
    if (data.reminderDate && data.activityDate) {
      const activityDate = new Date(data.activityDate)
      const reminderDate = new Date(data.reminderDate)
      return reminderDate <= activityDate
    }
    return true
  },
  {
    message: 'Reminder date must be before or equal to activity date',
    path: ['reminderDate']
  }
)

export const updateActivitySchema = z.object({
  title: z.string()
    .min(1, 'Activity title is required')
    .max(200, 'Activity title must be less than 200 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),
  activityDate: dateStringSchema.optional(),
  reminderDate: dateStringSchema.optional(),
  status: activityStatusSchema.optional()
}).refine(
  (data) => {
    if (data.reminderDate && data.activityDate) {
      const activityDate = new Date(data.activityDate)
      const reminderDate = new Date(data.reminderDate)
      return reminderDate <= activityDate
    }
    return true
  },
  {
    message: 'Reminder date must be before or equal to activity date',
    path: ['reminderDate']
  }
)

// Query parameter validation schemas
export const animalFiltersSchema = z.object({
  farmId: uuidSchema.optional(),
  animalType: animalTypeSchema.optional(),
  status: animalStatusSchema.optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['name', 'animalId', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
})

export const activityFiltersSchema = z.object({
  farmId: uuidSchema.optional(),
  animalId: uuidSchema.optional(),
  status: activityStatusSchema.optional(),
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
  hasReminder: z.coerce.boolean().optional(),
  sortBy: z.enum(['activityDate', 'reminderDate', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
}).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      const fromDate = new Date(data.dateFrom)
      const toDate = new Date(data.dateTo)
      return fromDate <= toDate
    }
    return true
  },
  {
    message: 'Date from must be before or equal to date to',
    path: ['dateTo']
  }
)

// Profile validation schemas
export const profileCompletionSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .trim()
})

// Notification validation schemas
export const notificationFiltersSchema = z.object({
  isRead: z.coerce.boolean().optional(),
  farmId: uuidSchema.optional(),
  notificationType: z.enum(['REMINDER', 'SYSTEM', 'ACTIVITY_UPDATE']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
})

// Push subscription validation schema
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh key is required'),
    auth: z.string().min(1, 'auth key is required')
  })
})

// Validation utility functions
export function validateAnimalId(animalId: string, animalType: AnimalType): {
  isValid: boolean
  error?: string
} {
  const typeCodeMap: Record<AnimalType, string> = {
    BUFFALO: 'BF',
    CHICKEN: 'CK',
    COW: 'CW',
    PIG: 'PG',
    HORSE: 'HR'
  }
  
  if (animalId.length !== 11) {
    return { isValid: false, error: 'Animal ID must be exactly 11 characters' }
  }
  
  const expectedTypeCode = typeCodeMap[animalType]
  const actualTypeCode = animalId.substring(0, 2)
  
  if (actualTypeCode !== expectedTypeCode) {
    return { 
      isValid: false, 
      error: `Expected type code ${expectedTypeCode} for ${animalType} but got ${actualTypeCode}` 
    }
  }
  
  const pattern = /^[A-Z]{2}\d{8}\d{3}$/
  if (!pattern.test(animalId)) {
    return { isValid: false, error: 'Invalid animal ID format' }
  }
  
  return { isValid: true }
}

export function validateDateRange(fromDate: string, toDate: string): {
  isValid: boolean
  error?: string
} {
  const from = new Date(fromDate)
  const to = new Date(toDate)
  
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return { isValid: false, error: 'Invalid date format' }
  }
  
  if (from > to) {
    return { isValid: false, error: 'From date must be before or equal to to date' }
  }
  
  return { isValid: true }
}

// Type inference helpers
export type CreateFarmInput = z.infer<typeof createFarmSchema>
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>
export type CreateAnimalInput = z.infer<typeof createAnimalSchema>
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>
export type CreateActivityInput = z.infer<typeof createActivitySchema>
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>
export type AnimalFiltersInput = z.infer<typeof animalFiltersSchema>
export type ActivityFiltersInput = z.infer<typeof activityFiltersSchema>
export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>
export type NotificationFiltersInput = z.infer<typeof notificationFiltersSchema>
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>