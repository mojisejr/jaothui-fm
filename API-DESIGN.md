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
├── activities/             # Activity management
│   ├── route.ts           # GET, POST /api/activities
│   └── [id]/
│       ├── route.ts       # GET, PUT, DELETE /api/activities/[id]
│       └── status/
│           └── route.ts   # PATCH /api/activities/[id]/status
└── webhooks/
    └── clerk/
        └── route.ts       # POST /api/webhooks/clerk
```

### Future API Endpoints (Round 8+)

```
/api/
├── notifications/          # Notification system
│   ├── route.ts           # GET, POST /api/notifications
│   ├── subscribe/
│   │   └── route.ts       # POST /api/notifications/subscribe
│   └── [id]/
│       └── route.ts       # PUT, DELETE /api/notifications/[id]
├── cron/
│   └── notifications/
│       └── route.ts       # POST /api/cron/notifications (Vercel Cron)
└── push/
    └── route.ts           # POST /api/push (Web Push)
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

### Round 8: Notification System
**Primary Focus**: Notification APIs และ webhook integration
```typescript
// ใช้สำหรับ:
// - /api/notifications (GET, POST)
// - /api/cron/notifications (POST)
// - /api/push (POST)
// - Web Push subscription management

// Prompt คำแนะนำ:
"อ่าน API-DESIGN.md sections: Future API Endpoints, Webhook Patterns สำหรับ implement notification system APIs"
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

**Last Updated**: 2025-07-11 (Round 7.3 Implementation Complete)
**Next Review**: After Round 8 Notification System implementation  
**Usage**: สำหรับ Round 4, 6, 7, 7.2, 7.3 ✅, และ 8 ในการ implement และ maintain API standards

**Round 7.3 API Enhancements Completed**:
- ✅ Enhanced POST /api/activities with optional status field
- ✅ Activity list pagination and filtering APIs
- ✅ Activity detail and status update APIs
- ✅ Comprehensive activity management CRUD operations