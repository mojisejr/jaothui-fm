# Farm Management System - AI Development Context

## Project Overview

ระบบบริหารจัดการฟาร์มสำหรับเลี้ยงสัตว์หลายประเภท (ควาย, ไก่, วัว, หมู, ม้า) พร้อมระบบแจ้งเตือนและการจัดการกิจกรรมต่างๆ

## Learning/Business Objectives

1. สร้างระบบจัดการฟาร์มที่ใช้งานง่าย mobile-first
2. เรียนรู้การผสานระบบ authentication, database, และ notifications
3. สร้างระบบที่ developer คนเดียวดูแลได้

## Tech Stack

- **Frontend**: Next.js 14.2.17, React 18.3.1, TypeScript 5.7.2
- **Backend**: Next.js API routes (full-stack)
- **Database**: Supabase (PostgreSQL) with Prisma ORM 6.3.0
- **Authentication**: Clerk 6.24.1 (with LINE login)
- **Styling**: Tailwind CSS 3.4.17 + DaisyUI 4.12.14
- **Forms**: React Hook Form 7.54.0 + Zod 3.24.1
- **Notifications**: Sonner 1.7.1 + Web Push Notifications
- **Icons**: Lucide React 0.468.0
- **Animation**: Framer Motion 11.15.0
- **Date handling**: date-fns 4.1.0
- **Deployment**: Vercel + Vercel Cron

## Business Logic Core

- **User-Farm**: 1 user = 1 owned farm + 1 member farm (future)
- **Animal ID**: Auto-generated `{TYPE_CODE}{YYYYMMDD}{SEQUENCE}` (e.g., BF20250101001)
- **Activity Types**: Free-text with localStorage history
- **Reminders**: Optional, only creates records if reminder_date exists
- **Notifications**: Daily 6 AM cron + in-app bell

## Database Schema (Prisma)

```prisma
model Profile {
  id          String @id @default(dbgenerated("gen_random_uuid()"))
  clerkUserId String @unique
  phoneNumber String @unique
  firstName   String
  lastName    String
  ownedFarms  Farm[] @relation("FarmOwner")
}

model Farm {
  id       String @id @default(dbgenerated("gen_random_uuid()"))
  ownerId  String
  farmName String @default("ฟาร์มของฉัน")
  province String @default("ไม่ระบุ")
  owner    Profile @relation("FarmOwner", fields: [ownerId], references: [id])
  animals  Animal[]
}

model Animal {
  id         String     @id @default(dbgenerated("gen_random_uuid()"))
  farmId     String
  animalId   String     // Auto-generated or manual
  animalType AnimalType // BUFFALO, CHICKEN, COW, PIG, HORSE
  name       String     // Required
  sex        Sex?       // Optional
  birthDate  DateTime?  // Optional
  color      String?    // Optional
  weightKg   Int?       // Optional
  heightCm   Int?       // Optional
  motherName String?    // Optional
  fatherName String?    // Optional
  imageUrl   String?    // Optional
  farm       Farm @relation(fields: [farmId], references: [id])
  activities Activity[]
  @@unique([farmId, animalId])
}

model Activity {
  id           String         @id @default(dbgenerated("gen_random_uuid()"))
  animalId     String
  farmId       String
  title        String
  description  String?
  activityDate DateTime
  reminderDate DateTime?      // Optional - creates reminder if exists
  status       ActivityStatus @default(PENDING)
  animal       Animal @relation(fields: [animalId], references: [id])
}
```

## UI Design System (Based on mock-ui/\*.json)

- **Primary Color**: `#f39c12` (orange - brand, buttons, active states)
- **Backgrounds**: Header `#4a4a4a`, Cards `#ffffff`/`#f9f9f9`, Inputs `#f5f5f5`
- **Logo**: `jaothui-logo.png` (120px x 120px)
- **Layout**: 400px max-width, mobile-first, 15px border-radius
- **Buttons**: 25px border-radius, 15px padding, orange primary
- **Typography**: 16px base, heading 24px, secondary 14px

## Development Approach: 8 Paired Sub-Agent Rounds

### Round Structure & Dependencies:

```
R1: Foundation → R2: Auth+DB → R3: Pages → R4: API → R5: Animal UI → R6: CRUD → R7: Activities → R8: Notifications
```

### Enhanced Round Prompts:

#### Round 1: Foundation Setup

```
อ่าน CLAUDE.md และทำ Round 1: Foundation Setup ตาม paired sub-agent pattern

TASK BREAKDOWN:
- Task A: Next.js 14 + TypeScript setup (dependencies: none)
- Task B: Tailwind + DaisyUI config (dependencies: Task A package.json)

ACCEPTANCE CRITERIA CHECKLIST:
□ npm run dev starts on port 3000 without errors
□ TypeScript strict mode compiles successfully
□ DaisyUI orange theme (#f39c12) applies correctly
□ Mobile responsive (test at 400px width)
□ App directory structure created

TESTING PROTOCOL:
1. npm run dev && open http://localhost:3000
2. Test DaisyUI: <button className="btn btn-primary">Test Orange</button>
3. Verify mobile: Chrome DevTools → 400px width
4. Check TypeScript: No red underlines in VSCode

COMMIT: "feat: setup Next.js 14 foundation with TypeScript and Tailwind+DaisyUI styling"
```

#### Round 2: Authentication & Database

```
อ่าน CLAUDE.md และทำ Round 2: Authentication & Database ตาม paired sub-agent pattern

TASK BREAKDOWN:
- Task A: Clerk auth setup (dependencies: Round 1 completed)
- Task B: Supabase + Prisma config (dependencies: Task A env setup)

ACCEPTANCE CRITERIA CHECKLIST:
□ Clerk authentication flow works with phone numbers
□ LINE login integration functions correctly
□ Prisma schema generates and migrates successfully
□ Database connection established
□ Protected routes redirect properly

TESTING PROTOCOL:
1. Test auth: Visit /sign-in, register with phone
2. Test LINE: Login with LINE account
3. Test DB: npx prisma studio (opens successfully)
4. Test protection: Access dashboard without auth (should redirect)

COMMIT: "feat: implement Clerk authentication and Supabase+Prisma database"
```

#### Round 3: Core Pages Structure

```
อ่าน CLAUDE.md และทำ Round 3: Core Pages Structure ตาม paired sub-agent pattern

TASK BREAKDOWN:
- Task A: Auth pages (home, login, register, success) following mock-ui/*.json
- Task B: Dashboard layout following profile-page.json design

ACCEPTANCE CRITERIA CHECKLIST:
□ All pages match JSON designs exactly (colors, spacing, layout)
□ JAOTHUI logo (120px x 120px) displays correctly
□ Orange theme (#f39c12) consistent throughout
□ Mobile responsive with 400px max-width containers
□ Navigation between pages works smoothly

TESTING PROTOCOL:
1. Compare visually with mock-ui/home-page.json
2. Test mobile layout at 400px width
3. Verify logo loads from public/jaothui-logo.png
4. Test navigation flow: home → login → dashboard

COMMIT: "feat: create core page structure with mobile-first responsive design"
```

#### Round 4: Database Models & API

```
อ่าน CLAUDE.md และทำ Round 4: Database Models & API ตาม paired sub-agent pattern

TASK BREAKDOWN:
- Task A: Complete Prisma schema with all models
- Task B: API routes for CRUD operations (/api/farms, /api/animals)

ACCEPTANCE CRITERIA CHECKLIST:
□ Auto-generated Animal IDs work (BF20250101001 format)
□ All CRUD operations functional via API routes
□ Request/response validation with proper error handling
□ Database queries optimized with proper indexes

TESTING PROTOCOL:
1. Test animal ID generation: Create buffalo, chicken, cow
2. Test API: POST /api/animals with valid/invalid data
3. Verify DB: Check records in Prisma Studio
4. Test relationships: Farm → Animals association

COMMIT: "feat: implement comprehensive Prisma schema and API routes"
```

#### Round 5: Animal Management Interface

```
อ่าน CLAUDE.md และทำ Round 5: Animal Management Interface ตาม paired sub-agent pattern

TASK BREAKDOWN:
- Task A: Animal list page with tab navigation (animal-list-tab-page.json)
- Task B: Animal detail page (animal-detail-page.json)

ACCEPTANCE CRITERIA CHECKLIST:
□ Tab navigation between "กระบือในฟาร์ม" and "รายการแจ้งเตือน"
□ Animal cards display correctly with all required info
□ Detail page shows comprehensive animal information
□ Navigation to/from list and detail views works

TESTING PROTOCOL:
1. Create test animals via API or direct DB
2. Verify list displays with proper card layout
3. Test tab switching functionality
4. Click animal card → detail page loads correctly

COMMIT: "feat: create animal management interface with list and detail views"
```

#### Round 6: Animal CRUD Operations

```
อ่าน CLAUDE.md และทำ Round 6: Animal CRUD Operations ตาม paired sub-agent pattern

TASK BREAKDOWN:
- Task A: Add animal form with auto-generated IDs
- Task B: Edit animal form and update functionality

ACCEPTANCE CRITERIA CHECKLIST:
□ Auto-generated IDs work for all 5 animal types
□ Form validation prevents invalid submissions
□ React Hook Form + Zod validation functions
□ Create and update operations work correctly

TESTING PROTOCOL:
1. Add new buffalo → ID generates as BF20250109001
2. Test form validation with empty/invalid data
3. Edit existing animal → changes save successfully
4. Verify data persistence in database

COMMIT: "feat: implement animal CRUD operations with auto-generated IDs"
```

#### Round 7: Activity & Reminder System

```
อ่าน CLAUDE.md และทำ Round 7: Activity & Reminder System ตาม paired sub-agent pattern

TASK BREAKDOWN:
- Task A: Activity creation with localStorage type history
- Task B: Reminder tab with status management

ACCEPTANCE CRITERIA CHECKLIST:
□ Activity types save to localStorage and suggest on reuse
□ Optional reminder dates create reminder records
□ Reminder tab sorts by nearest date (overdue first)
□ Status updates (complete, postpone, cancel) work

TESTING PROTOCOL:
1. Create activity with type "ตรวจสุขภาพ" → saves to localStorage
2. Create second activity → "ตรวจสุขภาพ" appears in suggestions
3. Create activity with reminder date → appears in reminder tab
4. Test status updates and postpone functionality

COMMIT: "feat: implement activity tracking and reminder management system"
```

#### Round 8: Notification System

```
อ่าน CLAUDE.md และทำ Round 8: Notification System ตาม paired sub-agent pattern

TASK BREAKDOWN:
- Task A: Web push notifications setup with service worker
- Task B: Daily cron job (6 AM) + notification bell in header

ACCEPTANCE CRITERIA CHECKLIST:
□ Push notification permission request works
□ Service worker handles push messages correctly
□ Daily cron job triggers at 6 AM
□ Notification bell shows accurate count
□ Real-time notification updates function

TESTING PROTOCOL:
1. Grant notification permission → test push works
2. Create reminder for today → notification bell updates
3. Test cron endpoint manually (if possible)
4. Verify notification content and click navigation

COMMIT: "feat: complete notification system with push notifications and daily scheduling"
```

## Recovery Strategy

```
If timeout or issues:
1. Press Escape → Ask: "สรุปความคืบหน้าของ Round [X] และแสดง checklist ที่เสร็จแล้ว"
2. Get status → Ask: "ทำ task ที่ยังไม่เสร็จทีละขั้นตอน"
3. Context loss → /clear → "อ่าน CLAUDE.md และ PROGRESS.md → สรุปสถานะและต่อ Round [X]"
```

## Quality Gates (Mandatory Before Next Round)

- [ ] All acceptance criteria passed
- [ ] No TypeScript errors
- [ ] Mobile responsive verified (400px width)
- [ ] No console errors in browser
- [ ] Git commit with semantic message

## Environment Variables Required

```env
# Clerk (Round 2)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Supabase (Round 2)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# Push Notifications (Round 8)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=Bxxxxx
VAPID_PRIVATE_KEY=xxxxx
VAPID_EMAIL=your-email@example.com
CRON_SECRET=your-random-secret-123
```

## File References

- **UI Designs**: `mock-ui/*.json` files (follow exactly)
- **Logo**: `public/jaothui-logo.png` (120px x 120px)
- **Package**: Use optimized package.json with latest compatible versions
- **Schema**: Full Prisma schema in separate file if needed

## Development Tips

1. **Context Management**: Always reference CLAUDE.md in prompts
2. **Mobile-First**: Test at 400px width first, then scale up
3. **Design Accuracy**: Follow JSON designs exactly (colors, spacing, layout)
4. **Git Discipline**: One semantic commit per completed round
5. **Error Handling**: Use recovery strategy for timeouts/issues
