# Farm Management System - API Design Guidelines

## 🌐 API Architecture Overview

### RESTful API Design Principles

- **Resource-based URLs**: `/api/animals`, `/api/activities`, `/api/farms`
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Status Codes**: 200 (success), 201 (created), 400 (validation), 401 (unauthorized), 500 (server error)
- **JSON Communication**: All requests and responses use JSON format
- **Authentication**: Clerk-based authentication with middleware protection

### Base URL Structure

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## 📁 API Route Structure

### Current API Endpoints

```
/api/
├── farms/                    # Farm management
│   └── route.ts             # GET, POST /api/farms
├── animals/                 # Animal management  
│   ├── route.ts            # GET, POST /api/animals
│   ├── [id]/
│   │   └── route.ts        # GET, PUT, DELETE /api/animals/[id]
│   └── generate-id/
│       └── route.ts        # GET /api/animals/generate-id
├── activities/             # Activity management ✅
│   ├── route.ts           # GET, POST /api/activities (with animalId filtering support)
│   └── [id]/
│       ├── route.ts       # GET, PUT, DELETE /api/activities/[id]
│       └── status/
│           └── route.ts   # PATCH /api/activities/[id]/status
└── webhooks/
    └── clerk/
        └── route.ts       # POST /api/webhooks/clerk
```

### Round 8 API Endpoints (Notification System) ✅

```
/api/
├── notifications/          # Notification system ✅
│   └── route.ts           # GET, POST, DELETE /api/notifications ✅
└── cron/
    └── reminders/
        └── route.ts       # GET /api/cron/reminders (Daily 6 AM Vercel Cron) ✅
```

## 🔐 Authentication Patterns

### Standard Authentication Implementation

```typescript
// Pattern สำหรับทุก protected API route
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // API logic here
    return NextResponse.json({ data: result });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### Farm Access Control Pattern

```typescript
// Pattern สำหรับตรวจสอบสิทธิ์เข้าถึง Farm
import { getUserFarm } from '@/lib/user';

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const farm = await getUserFarm(userId);
    
    // ใช้ farm.id สำหรับ query ข้อมูล
    const animals = await prisma.animal.findMany({
      where: { farmId: farm.id }
    });
    
    return NextResponse.json({ data: animals });
  } catch (error) {
    return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
  }
}
```

## 📝 Request/Response Patterns

### Standard Response Format

```typescript
// Success Response Pattern
interface SuccessResponse<T> {
  data: T;
  message?: string;
}

// Error Response Pattern  
interface ErrorResponse {
  error: string;
  details?: any;
  code?: string;
}

// Paginated Response Pattern
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
```

### Example API Responses

```typescript
// GET /api/animals - Success
{
  "data": [
    {
      "id": "uuid-123",
      "animalId": "BF20250101001",
      "animalType": "BUFFALO",
      "name": "ก้อนทอง",
      "birthDate": "2024-01-01T00:00:00.000Z",
      "farmId": "farm-uuid",
      "activities": []
    }
  ]
}

// POST /api/animals - Validation Error
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["name"],
      "message": "กรุณากรอกชื่อสัตว์"
    }
  ]
}

// GET /api/activities?page=1&limit=5 - Paginated
{
  "data": [
    {
      "id": "activity-uuid",
      "title": "ตรวจสุขภาพ",
      "activityDate": "2025-01-15T10:00:00.000Z",
      "status": "PENDING",
      "animalId": "animal-uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 23,
    "hasNext": true
  }
}
```

## 🛡️ Validation Patterns

### Zod Schema Patterns

```typescript
// Basic Entity Schema Pattern
import { z } from 'zod';

const animalSchema = z.object({
  animalId: z.string()
    .min(6, 'รหัสสัตว์ต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(50, 'รหัสสัตว์ต้องไม่เกิน 50 ตัวอักษร'),
  animalType: z.enum(['BUFFALO', 'CHICKEN', 'COW', 'PIG', 'HORSE']),
  name: z.string().min(1, 'กรุณากรอกชื่อสัตว์'),
  sex: z.enum(['MALE', 'FEMALE']).optional(),
  birthDate: z.preprocess(
    (value) => {
      if (typeof value === 'string' && value.trim() === '') {
        return undefined;
      }
      return value;
    },
    z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'รูปแบบวันที่ไม่ถูกต้อง'
    ).optional()
  ),
  weightKg: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }
      return Number(value);
    },
    z.number().positive('น้ำหนักต้องเป็นจำนวนบวก').optional()
  ),
  heightCm: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }
      return Number(value);
    },
    z.number().positive('ส่วนสูงต้องเป็นจำนวนบวก').optional()
  ),
  color: z.string().optional(),
  motherName: z.string().optional(),
  fatherName: z.string().optional(),
  imageUrl: z.string().url('URL รูปภาพไม่ถูกต้อง').optional().or(z.literal(''))
});

// Update Schema (Partial Pattern)
const updateAnimalSchema = animalSchema.partial();

// Activity Schema Pattern
const activitySchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อกิจกรรม'),
  description: z.string().optional(),
  activityDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'รูปแบบวันที่ไม่ถูกต้อง'
  ),
  reminderDate: z.preprocess(
    (value) => {
      if (typeof value === 'string' && value.trim() === '') {
        return undefined;
      }
      return value;
    },
    z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'รูปแบบวันที่แจ้งเตือนไม่ถูกต้อง'
    ).optional()
  ),
  animalId: z.string().uuid('Animal ID ไม่ถูกต้อง')
});
```

### Request Validation Pattern

```typescript
// Standard validation middleware pattern
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate request data
    const validatedData = animalSchema.parse(body);
    
    // Process validated data
    const result = await createAnimal(validatedData, userId);
    
    return NextResponse.json({ 
      data: result,
      message: 'สร้างข้อมูลสัตว์เรียบร้อยแล้ว' 
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}
```

## 🔍 Query Parameters & Filtering

### Pagination Pattern

```typescript
// Standard pagination implementation
const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('10')
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = paginationSchema.parse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit')
  });
  
  const skip = (page - 1) * limit;
  
  const [animals, total] = await Promise.all([
    prisma.animal.findMany({
      where: { farmId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.animal.count({ where: { farmId } })
  ]);
  
  return NextResponse.json({
    data: animals,
    pagination: {
      page,
      limit,
      total,
      hasNext: skip + limit < total
    }
  });
}
```

### Filtering Pattern

```typescript
// Animal filtering by type and status
const filterSchema = z.object({
  animalType: z.enum(['BUFFALO', 'CHICKEN', 'COW', 'PIG', 'HORSE']).optional(),
  sex: z.enum(['MALE', 'FEMALE']).optional(),
  search: z.string().optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = filterSchema.parse({
    animalType: searchParams.get('animalType'),
    sex: searchParams.get('sex'),
    search: searchParams.get('search')
  });
  
  const where: any = { farmId };
  
  if (filters.animalType) {
    where.animalType = filters.animalType;
  }
  
  if (filters.sex) {
    where.sex = filters.sex;
  }
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { animalId: { contains: filters.search, mode: 'insensitive' } }
    ];
  }
  
  const animals = await prisma.animal.findMany({ where });
  return NextResponse.json({ data: animals });
}
```

## 🚨 Error Handling Standards

### Error Categories

```typescript
// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
```

### Error Response Handler

```typescript
// Centralized error handling
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    return NextResponse.json({
      error: 'Validation failed',
      details: error.errors
    }, { status: 400 });
  }
  
  if (error instanceof ValidationError) {
    return NextResponse.json({
      error: error.message,
      details: error.details
    }, { status: 400 });
  }
  
  if (error instanceof NotFoundError) {
    return NextResponse.json({
      error: error.message
    }, { status: 404 });
  }
  
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({
      error: error.message
    }, { status: 401 });
  }
  
  console.error('Unexpected API Error:', error);
  return NextResponse.json({
    error: 'Internal Server Error'
  }, { status: 500 });
}
```

### Thai Error Messages

```typescript
// Standardized Thai error messages
export const ErrorMessages = {
  UNAUTHORIZED: 'ไม่ได้รับอนุญาตให้เข้าใช้',
  VALIDATION_FAILED: 'ข้อมูลไม่ถูกต้อง',
  ANIMAL_NOT_FOUND: 'ไม่พบข้อมูลสัตว์',
  ACTIVITY_NOT_FOUND: 'ไม่พบข้อมูลกิจกรรม',
  FARM_NOT_FOUND: 'ไม่พบข้อมูลฟาร์ม',
  INTERNAL_ERROR: 'เกิดข้อผิดพลาดภายในระบบ',
  INVALID_ANIMAL_ID: 'รหัสสัตว์ไม่ถูกต้อง',
  DUPLICATE_ANIMAL_ID: 'รหัสสัตว์นี้มีอยู่แล้ว'
} as const;
```

## 🔄 CRUD Operation Patterns

### CREATE (POST) Pattern

```typescript
// Create new resource
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: ErrorMessages.UNAUTHORIZED }, { status: 401 });
    }
    
    const farm = await getUserFarm(userId);
    const body = await request.json();
    const validatedData = animalSchema.parse(body);
    
    // Generate animal ID if not provided
    if (!validatedData.animalId) {
      validatedData.animalId = await generateAnimalId(
        validatedData.animalType,
        new Date(),
        farm.id
      );
    }
    
    // Check for duplicate animal ID
    const existingAnimal = await prisma.animal.findUnique({
      where: {
        farmId_animalId: {
          farmId: farm.id,
          animalId: validatedData.animalId
        }
      }
    });
    
    if (existingAnimal) {
      throw new ValidationError(ErrorMessages.DUPLICATE_ANIMAL_ID);
    }
    
    const animal = await prisma.animal.create({
      data: {
        ...validatedData,
        farmId: farm.id
      }
    });
    
    return NextResponse.json({
      data: animal,
      message: 'เพิ่มข้อมูลสัตว์เรียบร้อยแล้ว'
    }, { status: 201 });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

### READ (GET) Pattern

```typescript
// Get single resource
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: ErrorMessages.UNAUTHORIZED }, { status: 401 });
    }
    
    const farm = await getUserFarm(userId);
    
    const animal = await prisma.animal.findFirst({
      where: {
        id: params.id,
        farmId: farm.id
      },
      include: {
        activities: {
          orderBy: { activityDate: 'desc' },
          take: 10 // Initial load
        }
      }
    });
    
    if (!animal) {
      throw new NotFoundError(ErrorMessages.ANIMAL_NOT_FOUND);
    }
    
    return NextResponse.json({ data: animal });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

### UPDATE (PUT) Pattern

```typescript
// Update existing resource
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: ErrorMessages.UNAUTHORIZED }, { status: 401 });
    }
    
    const farm = await getUserFarm(userId);
    const body = await request.json();
    const validatedData = updateAnimalSchema.parse(body);
    
    // Check if animal exists and belongs to user's farm
    const existingAnimal = await prisma.animal.findFirst({
      where: {
        id: params.id,
        farmId: farm.id
      }
    });
    
    if (!existingAnimal) {
      throw new NotFoundError(ErrorMessages.ANIMAL_NOT_FOUND);
    }
    
    // Check for duplicate animal ID if being updated
    if (validatedData.animalId && validatedData.animalId !== existingAnimal.animalId) {
      const duplicateAnimal = await prisma.animal.findUnique({
        where: {
          farmId_animalId: {
            farmId: farm.id,
            animalId: validatedData.animalId
          }
        }
      });
      
      if (duplicateAnimal) {
        throw new ValidationError(ErrorMessages.DUPLICATE_ANIMAL_ID);
      }
    }
    
    const updatedAnimal = await prisma.animal.update({
      where: { id: params.id },
      data: validatedData
    });
    
    return NextResponse.json({
      data: updatedAnimal,
      message: 'อัปเดตข้อมูลสัตว์เรียบร้อยแล้ว'
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

### DELETE Pattern

```typescript
// Delete resource
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: ErrorMessages.UNAUTHORIZED }, { status: 401 });
    }
    
    const farm = await getUserFarm(userId);
    
    // Check if animal exists and belongs to user's farm
    const animal = await prisma.animal.findFirst({
      where: {
        id: params.id,
        farmId: farm.id
      }
    });
    
    if (!animal) {
      throw new NotFoundError(ErrorMessages.ANIMAL_NOT_FOUND);
    }
    
    // Delete associated activities first (if not using CASCADE)
    await prisma.activity.deleteMany({
      where: { animalId: params.id }
    });
    
    // Delete the animal
    await prisma.animal.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({
      message: 'ลบข้อมูลสัตว์เรียบร้อยแล้ว'
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

## 📊 Performance Optimization Patterns

### Database Query Optimization

```typescript
// Efficient data fetching with proper includes
export async function getAnimalsWithRecentActivities(farmId: string) {
  return prisma.animal.findMany({
    where: { farmId },
    include: {
      activities: {
        orderBy: { activityDate: 'desc' },
        take: 5, // Limit to recent activities
        select: {
          id: true,
          title: true,
          activityDate: true,
          status: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// Pagination with total count optimization
export async function getPaginatedAnimals(farmId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  
  const [animals, total] = await Promise.all([
    prisma.animal.findMany({
      where: { farmId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        animalId: true,
        animalType: true,
        name: true,
        birthDate: true,
        imageUrl: true
      }
    }),
    prisma.animal.count({ where: { farmId } })
  ]);
  
  return {
    animals,
    pagination: {
      page,
      limit,
      total,
      hasNext: skip + limit < total,
      hasPrev: page > 1
    }
  };
}
```

### Caching Patterns

```typescript
// Simple in-memory caching for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Usage in API route
export async function GET() {
  const cacheKey = `animals:${farmId}`;
  let animals = getCachedData<Animal[]>(cacheKey);
  
  if (!animals) {
    animals = await prisma.animal.findMany({ where: { farmId } });
    setCachedData(cacheKey, animals);
  }
  
  return NextResponse.json({ data: animals });
}
```

## 🎯 Round-Specific API Usage Guidelines

### Round 4: Database Models & API
**Primary Focus**: สร้าง API routes พื้นฐาน
```typescript
// ใช้สำหรับ:
// - /api/farms (GET, POST)
// - /api/animals (GET, POST) 
// - /api/animals/[id] (GET, PUT, DELETE)
// - /api/animals/generate-id (GET)

// Prompt คำแนะนำ:
"อ่าน API-DESIGN.md sections: Authentication Patterns, CRUD Operation Patterns, Request/Response Patterns สำหรับสร้าง API routes ตาม REST principles"
```

### Round 6: Animal CRUD Operations
**Primary Focus**: Form validation และ API integration
```typescript
// ใช้สำหรับ:
// - Animal creation/update forms
// - Form validation with Zod schemas
// - Error handling และ user feedback

// Prompt คำแนะนำ:
"อ่าน API-DESIGN.md sections: Validation Patterns, Error Handling Standards สำหรับ implement form validation และ API integration"
```

### Round 7: Activity & Reminder System
**Primary Focus**: Activity APIs และ complex validation
```typescript
// ใช้สำหรับ:
// - /api/activities (GET, POST)
// - /api/activities/[id] (GET, PUT, DELETE)
// - /api/activities/[id]/status (PATCH)
// - Activity form validation

// Prompt คำแนะนำ:
"อ่าน API-DESIGN.md sections: Activity Schema Pattern, Status Update Pattern สำหรับ implement activity management APIs"
```

### Round 7.2: Activity History Enhancement
**Primary Focus**: Pagination และ filtering APIs
```typescript
// ใช้สำหรับ:
// - Activity history pagination
// - Activity filtering by type/status
// - Load more functionality

// Prompt คำแนะนำ:
"อ่าน API-DESIGN.md sections: Query Parameters & Filtering, Pagination Pattern สำหรับ implement activity history with load more"
```

### Round 7.3: Activity Management Enhancement ✅
**Primary Focus**: Activity CRUD management และ status update APIs
```typescript
// ใช้สำหรับ:
// - Activity list page with comprehensive filtering
// - Activity detail/edit functionality  
// - Activity status update operations (PATCH /api/activities/[id]/status)
// - Enhanced activity creation with initial status selection

// Implementation Completed:
// - Enhanced POST /api/activities to accept status field during creation
// - Activity filtering by status with real-time updates
// - Comprehensive activity detail page with status management
// - ActivityStatusSelector component with proper validation

// Prompt คำแนะนำ:
"อ่าน API-DESIGN.md sections: CRUD Operation Patterns, Status Update Pattern สำหรับ implement comprehensive activity management with status controls"
```

### Round 7.4: Animal-Specific Activity Management ✅
**Primary Focus**: Animal-specific activity filtering and management APIs
```typescript
// ใช้สำหรับ:
// - Enhanced GET /api/activities with animalId query parameter for filtering
// - Animal Detail Page with recent activity history display
// - Animal-specific Activity List Page (/dashboard/animals/[id]/activities/)
// - POST /api/activities with automatic animalId association from context

// Key API Enhancements Completed:
// - ✅ GET /api/activities?animalId={id} for filtering activities by specific animal
// - ✅ Enhanced activity creation from animal context with proper animalId handling
// - ✅ Activity history pagination optimized for animal-specific views
// - ✅ Proper error handling for invalid animalId parameters
// - ✅ Smart back navigation system with URL parameter tracking (returnTo, animalId)
// - ✅ Enhanced ActivityHistorySection with navigation to animal-specific activity list

// Implementation Completed:
// - Enhanced Animal Detail Page (/dashboard/animals/[id]/) with recent activity history
// - Animal-specific Activity List Page (/dashboard/animals/[id]/activities/)
// - Context-aware activity detail page navigation based on entry point
// - ActivityHistorySection component with "ดูกิจกรรมทั้งหมด" navigation button

// Prompt คำแนะนำ:
"อ่าน API-DESIGN.md sections: Query Parameters & Filtering, Pagination Pattern สำหรับ implement animal-specific activity filtering และ management"
```

### Round 8: Notification System ✅
**Primary Focus**: Notification APIs และ web push notification system
```typescript
// ใช้สำหรับ:
// - /api/notifications (GET, POST, DELETE) - subscription management and notification fetching ✅
// - /api/cron/reminders (GET) - daily 6 AM cron job with CRON_SECRET authentication ✅
// - Web Push subscription management with VAPID keys ✅
// - Service worker integration for push notification handling ✅

// Implementation Completed:
// - NotificationBell component with dropdown interface and real-time count display ✅
// - Push subscription management with client-side utilities ✅
// - Daily reminder processing with activity and farm integration ✅
// - Service worker with notification actions (view, complete) ✅
// - Vercel Cron configuration for automated daily scheduling ✅

// Prompt คำแนะนำ:
"อ่าน API-DESIGN.md sections: Notification System APIs, Push Notification Patterns สำหรับ implement web push notification system"
```

## 🔗 Cross-Reference Links

### Related Documentation
- **ARCHITECTURE.md**: API Architecture section สำหรับ overall system design
- **UI-GUIDELINES.md**: Form Component Pattern สำหรับ client-side validation
- **CLAUDE.md**: Round-specific prompts สำหรับแต่ละ round development
- **PROGRESS.md**: API implementation status และ testing results

### Key Dependencies
- **lib/validations.ts**: Zod schemas สำหรับ request validation
- **lib/types.ts**: TypeScript interfaces สำหรับ API responses
- **lib/user.ts**: User และ farm access control utilities
- **lib/animal-id.ts**: Animal ID generation และ validation logic

---

## 📱 Round 8: Notification System APIs (Completed)

### `/api/notifications/route.ts` ✅

```typescript
// GET - Fetch notifications with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            activity: {
              include: {
                animal: { select: { name: true, animalType: true } }
              }
            }
          }
        }
      }
    });

    // Transform notifications for upcoming activities
    const upcomingActivities = await prisma.activity.findMany({
      where: {
        farmId: profile?.ownedFarms[0]?.id,
        reminderDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        status: 'PENDING'
      },
      include: {
        animal: { select: { name: true, animalType: true } }
      },
      orderBy: { reminderDate: 'asc' }
    });

    return NextResponse.json({
      notifications: profile?.notifications || [],
      upcomingActivities,
      unreadCount: profile?.notifications.filter(n => !n.isRead).length || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Subscribe to push notifications or send test notification
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription, action } = body;

    if (action === 'subscribe' && subscription) {
      const result = await subscribeUser(subscription, userId);
      return NextResponse.json(result);
    }

    if (action === 'test') {
      // Send test notification to all user's active subscriptions
      const profile = await prisma.profile.findUnique({
        where: { clerkUserId: userId },
        include: { pushSubscriptions: { where: { isActive: true } } }
      });

      for (const sub of profile?.pushSubscriptions || []) {
        await sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dhKey, auth: sub.authKey }
          },
          {
            title: 'ทดสอบการแจ้งเตือน',
            body: 'ระบบแจ้งเตือนฟาร์มของคุณทำงานปกติ',
            icon: '/jaothui-logo.png'
          }
        );
      }

      return NextResponse.json({ message: 'Test notification sent' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (endpoint) {
      await prisma.pushSubscription.updateMany({
        where: { userId, endpoint },
        data: { isActive: false }
      });
    }

    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### `/api/cron/reminders/route.ts` ✅

```typescript
// GET - Daily cron job for processing reminders (6 AM)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find activities with reminders for today
    const activities = await prisma.activity.findMany({
      where: {
        reminderDate: {
          gte: today,
          lt: tomorrow
        },
        status: 'PENDING'
      },
      include: {
        animal: { select: { name: true, animalType: true } },
        farm: {
          include: {
            owner: {
              include: {
                pushSubscriptions: { where: { isActive: true } }
              }
            }
          }
        }
      }
    });

    let notificationsSent = 0;
    let errors = [];

    for (const activity of activities) {
      try {
        // Create notification record
        await prisma.notification.create({
          data: {
            userId: activity.farm.ownerId,
            farmId: activity.farmId,
            activityId: activity.id,
            notificationType: 'REMINDER',
            title: 'แจ้งเตือนกิจกรรมฟาร์ม',
            message: `${activity.animal.name}: ${activity.title}`,
            pushSent: true,
            pushSentAt: new Date()
          }
        });

        // Send push notifications to all active subscriptions
        for (const subscription of activity.farm.owner.pushSubscriptions) {
          try {
            await sendPushNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.p256dhKey,
                  auth: subscription.authKey
                }
              },
              {
                title: 'แจ้งเตือนกิจกรรมฟาร์ม',
                body: `${activity.animal.name}: ${activity.title}`,
                icon: '/jaothui-logo.png',
                data: {
                  animalId: activity.animalId,
                  activityId: activity.id,
                  url: `/dashboard/animals/${activity.animalId}`
                },
                tag: `reminder-${activity.id}`
              }
            );

            await prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { lastUsedAt: new Date() }
            });

            notificationsSent++;
          } catch (pushError) {
            errors.push(`Push notification failed for subscription ${subscription.id}: ${pushError.message}`);
            
            // Mark subscription as inactive if push fails
            await prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { isActive: false }
            });
          }
        }
      } catch (activityError) {
        errors.push(`Activity ${activity.id} processing failed: ${activityError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      processedActivities: activities.length,
      notificationsSent,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}
```

### Push Notification Validation Schema

```typescript
// Push subscription validation
const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh key is required'),
    auth: z.string().min(1, 'auth key is required')
  })
});

// Notification payload validation
const notificationPayloadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  icon: z.string().url().optional(),
  data: z.record(z.any()).optional(),
  tag: z.string().optional()
});
```

**Last Updated**: 2025-07-12 (Round 8 Completed - Notification System) ✅
**Next Review**: System maintenance and performance optimization  
**Usage**: Complete API reference for farm management system with notification capabilities

**Round 7.3 API Enhancements Completed**:
- ✅ Enhanced POST /api/activities with optional status field
- ✅ Activity list pagination and filtering APIs
- ✅ Activity detail and status update APIs
- ✅ Comprehensive activity management CRUD operations

**Round 7.4 API Enhancements Completed**:
- ✅ Enhanced GET /api/activities with animalId filtering parameter for animal-specific queries
- ✅ Animal Detail Page integration with recent activity history display (5 most recent)
- ✅ Animal-specific Activity List Page API support (/dashboard/animals/[id]/activities/)
- ✅ Optimized activity creation from animal context with automatic animalId association
- ✅ Smart back navigation system with URL parameter tracking (returnTo, animalId)
- ✅ Enhanced ActivityHistorySection with "ดูกิจกรรมทั้งหมด" navigation functionality
- ✅ Context-aware activity detail page navigation based on entry point

**Round 8 API Implementation Completed**:
- ✅ Complete notification system with web push notifications and daily cron scheduling
- ✅ GET /api/notifications - fetch notifications with upcoming activities and unread count
- ✅ POST /api/notifications - push subscription management and test notification sending
- ✅ DELETE /api/notifications - unsubscribe from push notifications
- ✅ GET /api/cron/reminders - daily 6 AM cron job with CRON_SECRET authentication
- ✅ Integration with existing activity and farm management systems
- ✅ Service worker support for push notification handling
- ✅ VAPID key configuration for secure web push notifications
- ✅ Real-time notification bell with dropdown interface