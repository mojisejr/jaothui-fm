import { AnimalType } from '@prisma/client'

/**
 * Animal ID generation utility
 * Format: {TYPE_CODE}{YYYYMMDD}{SEQUENCE}
 * Examples: BF20250110001, CK20250110002, etc.
 */

const ANIMAL_TYPE_CODES: Record<AnimalType, string> = {
  BUFFALO: 'BF',
  CHICKEN: 'CK',
  COW: 'CW',
  PIG: 'PG',
  HORSE: 'HR',
}

/**
 * Generate animal ID based on type and existing IDs
 * @param animalType - The type of animal
 * @param existingIds - Array of existing animal IDs for the same farm and date
 * @param date - Optional date (defaults to today)
 * @returns Generated animal ID
 */
export function generateAnimalId(
  animalType: AnimalType,
  existingIds: string[] = [],
  date: Date = new Date()
): string {
  // Get type code
  const typeCode = ANIMAL_TYPE_CODES[animalType]
  
  // Format date as YYYYMMDD
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '')
  
  // Find existing IDs for this type and date
  const prefix = `${typeCode}${datePart}`
  const matchingIds = existingIds.filter(id => id.startsWith(prefix))
  
  // Find the highest sequence number
  let maxSequence = 0
  for (const id of matchingIds) {
    const sequencePart = id.slice(-3) // Last 3 digits
    const sequenceNum = parseInt(sequencePart, 10)
    if (!isNaN(sequenceNum) && sequenceNum > maxSequence) {
      maxSequence = sequenceNum
    }
  }
  
  // Generate next sequence number
  const nextSequence = maxSequence + 1
  
  // Format sequence with leading zeros (3 digits)
  const sequencePart = nextSequence.toString().padStart(3, '0')
  
  return `${prefix}${sequencePart}`
}

/**
 * Validate animal ID format
 * @param animalId - The animal ID to validate
 * @param animalType - The expected animal type
 * @returns Validation result
 */
export function validateAnimalId(animalId: string, animalType: AnimalType): {
  isValid: boolean
  error?: string
} {
  // Check length (11 characters: 2 type + 8 date + 3 sequence)
  if (animalId.length !== 11) {
    return { isValid: false, error: 'Animal ID must be 11 characters long' }
  }
  
  // Check type code
  const expectedTypeCode = ANIMAL_TYPE_CODES[animalType]
  const actualTypeCode = animalId.substring(0, 2)
  if (actualTypeCode !== expectedTypeCode) {
    return { 
      isValid: false, 
      error: `Expected type code ${expectedTypeCode} but got ${actualTypeCode}` 
    }
  }
  
  // Check date format (YYYYMMDD)
  const datePart = animalId.substring(2, 10)
  const dateRegex = /^\d{8}$/
  if (!dateRegex.test(datePart)) {
    return { isValid: false, error: 'Invalid date format in animal ID' }
  }
  
  // Check sequence format (3 digits)
  const sequencePart = animalId.substring(10, 13)
  const sequenceRegex = /^\d{3}$/
  if (!sequenceRegex.test(sequencePart)) {
    return { isValid: false, error: 'Invalid sequence format in animal ID' }
  }
  
  return { isValid: true }
}

/**
 * Parse animal ID into components
 * @param animalId - The animal ID to parse
 * @returns Parsed components
 */
export function parseAnimalId(animalId: string): {
  typeCode: string
  date: string
  sequence: string
  isValid: boolean
} {
  if (animalId.length !== 11) {
    return { typeCode: '', date: '', sequence: '', isValid: false }
  }
  
  return {
    typeCode: animalId.substring(0, 2),
    date: animalId.substring(2, 10),
    sequence: animalId.substring(10, 13),
    isValid: true
  }
}

/**
 * Get animal type from animal ID
 * @param animalId - The animal ID
 * @returns Animal type or null if invalid
 */
export function getAnimalTypeFromId(animalId: string): AnimalType | null {
  const typeCode = animalId.substring(0, 2)
  
  for (const [type, code] of Object.entries(ANIMAL_TYPE_CODES)) {
    if (code === typeCode) {
      return type as AnimalType
    }
  }
  
  return null
}