# Farm Management System - AI Development Context

## Project Overview

ระบบบริหารจัดการฟาร์มสำหรับเลี้ยงสัตว์หลายประเภท (ควาย, ไก่, วัว, หมู, ม้า) พร้อมระบบแจ้งเตือนและการจัดการกิจกรรมต่างๆ

## Learning/Business Objectives

1. สร้างระบบจัดการฟาร์มที่ใช้งานง่าย mobile-first
2. เรียนรู้การผสานระบบ authentication, database, และ notifications
3. สร้างระบบที่ developer คนเดียวดูแลได้

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API routes (full-stack)
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Authentication**: Clerk (with LINE login)
- **Styling**: Tailwind CSS + DaisyUI
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner + Web Push Notifications
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Date handling**: date-fns
- **Deployment**: Vercel
- **Scheduling**: Vercel Cron / node-cron

## Features Required

### Phase 1: Core Authentication & Basic Structure (Must Have)

#### 1.1 Project Foundation Setup

**User Story**: As a developer, I need a properly configured Next.js 14 project so that I can start building the farm management system.

**Technical Tasks:**

- [ ] **Task 1.1.1**: Initialize Next.js 14 with TypeScript

  - **Dependencies**: None
  - **Technical Details**:
    - Use `create-next-app@latest` with TypeScript template
    - Configure `next.config.js` for app directory
    - Setup proper TypeScript config with strict mode
  - **Acceptance Criteria**:
    - `npm run dev` starts successfully
    - TypeScript compilation works without errors
    - App directory structure is created

- [ ] **Task 1.1.2**: Setup Tailwind CSS + DaisyUI

  - **Dependencies**: Task 1.1.1 completed
  - **Technical Details**:
    - Install `tailwindcss`, `daisyui`, `@tailwindcss/typography`
    - Configure `tailwind.config.js` with DaisyUI theme
    - Setup CSS reset and base styles in `globals.css`
    - Configure orange theme (`#f39c12`) as primary color
  - **Acceptance Criteria**:
    - DaisyUI components render correctly
    - Primary orange color applies
    - Mobile-first responsive classes work

- [ ] **Task 1.1.3**: Create Project Structure
  - **Dependencies**: Task 1.1.1, 1.1.2 completed
  - **Technical Details**:
    - Create folder structure: `app/(auth)`, `app/(dashboard)`, `app/api`
    - Setup `components/ui`, `components/forms`, `components/layouts`
    - Create `lib/` directory with utility files
    - Setup `public/` for static assets
  - **Acceptance Criteria**:
    - All directories exist with proper naming
    - TypeScript path mapping works
    - Import statements resolve correctly

#### 1.2 Authentication System

**User Story**: As a farm owner, I need to register and login with my phone number or LINE account so that I can access my farm management system securely.

**Technical Tasks:**

- [ ] **Task 1.2.1**: Setup Clerk Authentication

  - **Dependencies**: Task 1.1.1 completed
  - **Technical Details**:
    - Install `@clerk/nextjs`
    - Configure Clerk provider in root layout
    - Setup environment variables for Clerk keys
    - Configure phone number as primary identifier
  - **Acceptance Criteria**:
    - Clerk middleware works correctly
    - Authentication state persists across sessions
    - Phone number collection works

- [ ] **Task 1.2.2**: Implement LINE Login Integration

  - **Dependencies**: Task 1.2.1 completed
  - **Technical Details**:
    - Configure LINE Login in Clerk dashboard
    - Setup OAuth redirect URLs
    - Implement phone number collection flow for LINE users
    - Handle LINE profile data integration
  - **Acceptance Criteria**:
    - LINE login button appears and works
    - Phone number is collected from LINE users
    - User profile includes LINE data

- [ ] **Task 1.2.3**: Create Authentication Pages
  - **Dependencies**: Task 1.1.3, 1.2.1 completed
  - **Technical Details**:
    - Create `app/(auth)/sign-in/[[...sign-in]]/page.tsx` following `login-page.json`
    - Create `app/(auth)/sign-up/[[...sign-up]]/page.tsx` following `register-page.json`
    - Create `app/(auth)/success/page.tsx` following `success-page.json`
    - Implement consistent logo section (120px x 120px) with JAOTHUI branding
    - Use white input backgrounds `#f5f5f5` with `#e0e0e0` borders and 10px border-radius
    - Add form fields with 15px padding and 20px bottom margins
    - Include orange action buttons `#f39c12` with 25px border-radius and 80% width
    - Add "ลืมรหัสผ่าน?" and "ยังไม่มีบัญชี? สร้างบัญชี" links as per design
    - Success page shows personalized "ยินดีต้อนรับ คุณXXXXXX" message
  - **Acceptance Criteria**:
    - All pages match respective JSON designs exactly
    - Clerk authentication components integrate seamlessly
    - Consistent branding and color scheme across all auth pages
    - Phone number field works with Clerk phone authentication
    - Success page personalizes with actual user name
    - Mobile-responsive with proper touch-friendly elements

#### 1.3 Database Foundation

**User Story**: As a system, I need a reliable database to store farm, user, and animal data with proper relationships and constraints.

**Technical Tasks:**

- [ ] **Task 1.3.1**: Setup Supabase Project

  - **Dependencies**: None (can run parallel with 1.1.x)
  - **Technical Details**:
    - Create Supabase project
    - Configure environment variables
    - Setup database connection
    - Configure Row Level Security (RLS) policies
  - **Acceptance Criteria**:
    - Database connection works from Next.js
    - Environment variables are properly configured
    - RLS policies are in place

- [ ] **Task 1.3.2**: Setup Prisma ORM

  - **Dependencies**: Task 1.3.1, 1.1.1 completed
  - **Technical Details**:
    - Install `prisma`, `@prisma/client`
    - Configure `prisma/schema.prisma` with Supabase connection
    - Create initial schema with User, Farm tables
    - Setup Prisma Client singleton
  - **Acceptance Criteria**:
    - Prisma generates client successfully
    - Database schema is created
    - Prisma queries work from API routes

- [ ] **Task 1.3.3**: Create Core Database Tables
  - **Dependencies**: Task 1.3.2 completed
  - **Technical Details**:
    - Design User table with phone number as unique key
    - Design Farm table with user relationship
    - Create initial migration files
    - Setup proper indexes and constraints
  - **Acceptance Criteria**:
    - Tables are created in database
    - Relationships work correctly
    - Indexes are properly configured

#### 1.4 Basic Layout & Home Page

**User Story**: As a visitor, I need a welcoming home page that clearly explains the farm management system and guides me to register.

**Technical Tasks:**

- [ ] **Task 1.4.1**: Create Root Layout

  - **Dependencies**: Task 1.1.2, 1.2.1 completed
  - **Technical Details**:
    - Setup `app/layout.tsx` with Clerk provider
    - Configure global CSS and fonts
    - Add mobile viewport meta tags
    - Setup Sonner toast provider
  - **Acceptance Criteria**:
    - Layout renders correctly across devices
    - Global styles apply consistently
    - Toast notifications work

- [ ] **Task 1.4.2**: Create Home Page
  - **Dependencies**: Task 1.1.3, 1.4.1 completed
  - **Technical Details**:
    - Create `app/page.tsx` following `home-page.json` design
    - Implement logo section with JAOTHUI brand (120px x 120px)
    - Add welcome text: "ยินดีต้อนรับเข้าสู่ระบบ E-ID" และ "ข้อมูลควาย"
    - Include "Powered by JAOTHUI" footer text
    - Create orange CTA button "เข้าสู่ระบบ" with 25px border-radius
    - Use 400px max-width container with 40px padding
    - Center all content with proper spacing (30px, 40px, 60px margins)
  - **Acceptance Criteria**:
    - Matches `home-page.json` design exactly
    - Logo displays correctly from `public/jaothui-logo.png`
    - Orange theme `#f39c12` applies consistently
    - CTA button redirects to Clerk sign-in
    - Mobile-responsive with proper touch targets

### Phase 2: Core Farm Management (Must Have)

#### 2.1 Profile Dashboard Foundation

**User Story**: As a logged-in farm owner, I need a personalized dashboard that shows my farm information and provides easy navigation to main features.

**Technical Tasks:**

- [ ] **Task 2.1.1**: Create Protected Dashboard Layout

  - **Dependencies**: Phase 1 completed
  - **Technical Details**:
    - Create `app/(dashboard)/layout.tsx` with auth protection following `profile-page.json`
    - Implement header with "ระบบ E-ID" title and notification bell (red badge with count)
    - Use dark gray background `#4a4a4a` for header with white text
    - Add user greeting section "สวัสดี! คุณรุ่งนิดล์ ใครขึ้นลาดหัก" style
    - Include farm info card with avatar (100px x 100px with 15px border-radius)
    - Create menu section with rounded cards `#f9f9f9` background
    - Add logout button with transparent background and white border
    - Use 400px max-width container with proper mobile spacing
  - **Acceptance Criteria**:
    - Matches `profile-page.json` design structure exactly
    - Header shows notification badge count (red circle with number)
    - Farm info displays correctly with editable fields
    - Menu items show proper badges and action buttons
    - Only authenticated users can access dashboard routes
    - Responsive layout works on mobile devices

- [ ] **Task 2.1.2**: Implement User Greeting Section

  - **Dependencies**: Task 2.1.1 completed
  - **Technical Details**:
    - Display personalized greeting with user name
    - Show current date and time
    - Add quick stats overview
    - Implement loading states
  - **Acceptance Criteria**:
    - Greeting personalizes with user's name
    - Date/time updates correctly
    - Loading states are smooth

- [ ] **Task 2.1.3**: Create Farm Info Management
  - **Dependencies**: Task 2.1.1, database setup completed
  - **Technical Details**:
    - Auto-create farm on user registration
    - Implement editable farm name and province
    - Add farm statistics display
    - Create API routes for farm CRUD
  - **Acceptance Criteria**:
    - Farm is auto-created for new users
    - Farm name and province are editable
    - Changes save successfully

#### 2.2 Navigation System

**User Story**: As a farm owner, I need intuitive navigation to access animals, activities, reminders, and settings quickly.

**Technical Tasks:**

- [ ] **Task 2.2.1**: Create Main Navigation Menu

  - **Dependencies**: Task 2.1.1 completed
  - **Technical Details**:
    - Design 4 main navigation buttons (Animals, Activities, Reminders, Settings)
    - Implement card-based layout with icons
    - Add active state indicators
    - Ensure touch-friendly button sizes
  - **Acceptance Criteria**:
    - All 4 main buttons are easily accessible
    - Active states are clearly visible
    - Buttons are touch-friendly (44px minimum)

- [ ] **Task 2.2.2**: Implement Tab Navigation Component
  - **Dependencies**: Task 2.2.1 completed
  - **Technical Details**:
    - Create reusable tab component
    - Implement smooth tab switching animations
    - Add keyboard navigation support
    - Handle tab state management
  - **Acceptance Criteria**:
    - Tab switching is smooth and responsive
    - Active tab is clearly indicated
    - Works with keyboard navigation

#### 2.3 Animal Management Foundation

**User Story**: As a farm owner, I need to view and manage my animals in an organized way with easy access to their information.

**Technical Tasks:**

- [ ] **Task 2.3.1**: Design Animal Database Schema

  - **Dependencies**: Task 1.3.3 completed
  - **Technical Details**:
    - Create Animal table with all animal types
    - Implement auto-generated ID system (`{TYPE_CODE}{YYYYMMDD}{SEQUENCE}`)
    - Setup required/optional fields (name required, others optional)
    - Add proper indexes and relationships
  - **Acceptance Criteria**:
    - Animal table supports all 5 animal types
    - Auto-generated IDs work correctly
    - Schema allows for optional fields

- [ ] **Task 2.3.2**: Create Animal List Page

  - **Dependencies**: Task 2.3.1, 2.2.2 completed
  - **Technical Details**:
    - Create `app/(dashboard)/animals/page.tsx` following `animal-list-tab-page.json`
    - Implement tab navigation: "กระบือในฟาร์ม" and "รายการแจ้งเตือน"
    - Use rounded top corners (15px) for tabs with white active/gray inactive states
    - Design animal cards with profile image, name, birth date, and ID number
    - Use `#f9f9f9` background for cards with 15px border-radius and padding
    - Add fixed bottom button "หน้าหลัก" in orange `#f39c12`
    - Implement reminder tab following `animal-reminder-tab-page.json`
    - Show notification cards with status, date, and action buttons
    - Use 400px max-width with dark header `#4a4a4a`
  - **Acceptance Criteria**:
    - Matches both `animal-list-tab-page.json` and `animal-reminder-tab-page.json` designs
    - Tab switching works between animal list and reminders
    - Animal cards display profile images and all required info
    - Reminder cards show status, dates, and clickable action buttons
    - Fixed bottom navigation works correctly
    - Responsive design maintains proper spacing on mobile

- [ ] **Task 2.3.3**: Create Animal Detail Page
  - **Dependencies**: Task 2.3.2 completed
  - **Technical Details**:
    - Create `app/(dashboard)/animals/[id]/page.tsx` following `animal-detail-page.json`
    - Implement header tabs "PED" (active orange) and "ART" (inactive gray)
    - Display full-width animal image (250px height, 15px border-radius)
    - Create information section with icon + label + value rows
    - Include fields: Name, Signature ID, Birthday, Sex, Mother/Father ID, Genome, Stature, Color
    - Add trophy display for rewards (8 trophy icons)
    - Implement "อัปเดตข้อมูลกระบือ" button in orange `#f39c12`
    - Add bottom action buttons: "กลับสู่หน้าหลัก" (gray) and "เพิ่มข้อมูลกระบือ" (orange)
    - Use white background `#ffffff` with 15px border-radius cards
    - Apply 20px padding and 10px margins throughout
  - **Acceptance Criteria**:
    - Matches `animal-detail-page.json` design exactly
    - All animal information displays with proper icons
    - Tab navigation between PED/ART works correctly
    - Action buttons navigate to appropriate pages
    - Trophy display shows correct number of achievements
    - Responsive layout maintains proper spacing

### Phase 3: Activity & Reminder System (Must Have)

#### 3.1 Activity Management System

**User Story**: As a farm owner, I need to track activities for my animals with flexible activity types and optional reminders.

**Technical Tasks:**

- [ ] **Task 3.1.1**: Design Activity Database Schema

  - **Dependencies**: Task 2.3.1 completed
  - **Technical Details**:
    - Create Activity table with animal relationship
    - Implement free-text activity types
    - Add optional reminder_date field
    - Setup status enum (pending, completed, cancelled, overdue)
  - **Acceptance Criteria**:
    - Activity table supports flexible activity types
    - Optional reminder dates work correctly
    - Status tracking is implemented

- [ ] **Task 3.1.2**: Implement Activity Type History

  - **Dependencies**: Task 3.1.1 completed
  - **Technical Details**:
    - Use localStorage to save frequently used activity types
    - Create autocomplete dropdown for activity types
    - Implement type suggestion algorithm
    - Add manual type entry option
  - **Acceptance Criteria**:
    - Frequent activity types are suggested
    - localStorage persists across sessions
    - Manual entry is always available

- [ ] **Task 3.1.3**: Create Activity Creation Form
  - **Dependencies**: Task 3.1.2 completed
  - **Technical Details**:
    - Build responsive activity form
    - Implement date/time picker for reminders
    - Add form validation with Zod schema
    - Create API routes for activity CRUD
  - **Acceptance Criteria**:
    - Form validation works correctly
    - Date/time picker is user-friendly
    - Activities save successfully

#### 3.2 Reminder System

**User Story**: As a farm owner, I need to see upcoming reminders sorted by date and be able to manage their status.

**Technical Tasks:**

- [ ] **Task 3.2.1**: Create Reminder Database Schema

  - **Dependencies**: Task 3.1.1 completed
  - **Technical Details**:
    - Create Reminder table linked to activities
    - Only activities with reminder_date create reminder records
    - Add status tracking and completion dates
    - Setup proper indexes for date queries
  - **Acceptance Criteria**:
    - Reminder records are created automatically
    - Status updates work correctly
    - Date queries are optimized

- [ ] **Task 3.2.2**: Implement Reminder List View

  - **Dependencies**: Task 3.2.1, 2.2.2 completed
  - **Technical Details**:
    - Create reminder tab in animals section
    - Sort reminders by nearest date first
    - Display overdue reminders prominently
    - Add quick action buttons (complete, postpone, cancel)
  - **Acceptance Criteria**:
    - Reminders sort correctly by date
    - Overdue items are visually distinct
    - Quick actions work smoothly

- [ ] **Task 3.2.3**: Implement Reminder Actions
  - **Dependencies**: Task 3.2.2 completed
  - **Technical Details**:
    - Create API routes for reminder status updates
    - Implement postpone functionality with new date picker
    - Add bulk action capabilities
    - Handle status change notifications
  - **Acceptance Criteria**:
    - All reminder actions work correctly
    - Postponed reminders get new dates
    - Status changes reflect immediately

### Phase 4: Notification System (Later/Enhancement)

#### 4.1 Web Push Notifications

**User Story**: As a farm owner, I want to receive push notifications for upcoming reminders even when not using the app.

**Technical Tasks:**

- [ ] **Task 4.1.1**: Setup Push Notification Service

  - **Dependencies**: Phase 3 completed
  - **Technical Details**:
    - Configure VAPID keys for web push
    - Implement service worker for push handling
    - Create notification permission request flow
    - Setup push subscription management
  - **Acceptance Criteria**:
    - Push notifications work across browsers
    - Permission request is user-friendly
    - Subscriptions are stored securely

- [ ] **Task 4.1.2**: Implement Notification Content
  - **Dependencies**: Task 4.1.1 completed
  - **Technical Details**:
    - Design notification templates
    - Include animal and activity information
    - Add action buttons to notifications
    - Handle notification click events
  - **Acceptance Criteria**:
    - Notifications contain relevant information
    - Action buttons work correctly
    - Click navigation works properly

#### 4.2 Daily Notification Scheduling

**User Story**: As a farm owner, I want to receive daily notifications at 6 AM about my pending reminders.

**Technical Tasks:**

- [ ] **Task 4.2.1**: Setup Cron Job System

  - **Dependencies**: Task 4.1.2 completed
  - **Technical Details**:
    - Create Vercel cron function for daily 6 AM execution
    - Implement timezone handling for different users
    - Add cron job authentication and security
    - Create fallback scheduling system
  - **Acceptance Criteria**:
    - Cron job runs daily at 6 AM
    - Timezone handling works correctly
    - Secure authentication is in place

- [ ] **Task 4.2.2**: Implement Notification Bell
  - **Dependencies**: Phase 3 completed
  - **Technical Details**:
    - Add notification counter to header bell
    - Create in-app notification list
    - Implement real-time notification updates
    - Add mark as read functionality
  - **Acceptance Criteria**:
    - Bell shows accurate notification count
    - In-app notifications display correctly
    - Real-time updates work smoothly

#### 4.3 Future Enhancement Features

**User Story**: As a farm owner, I may want additional features like farm member invitations and advanced analytics.

**Technical Tasks:**

- [ ] **Task 4.3.1**: Farm Invitation System (Future)

  - **Dependencies**: All core phases completed
  - **Technical Details**:
    - Design farm membership schema
    - Implement invitation by phone number
    - Add role-based permissions
    - Create invitation management UI
  - **Acceptance Criteria**:
    - Invitations can be sent by phone
    - Role permissions work correctly
    - Management UI is intuitive

- [ ] **Task 4.3.2**: Advanced Analytics (Future)
  - **Dependencies**: Sufficient data collected
  - **Technical Details**:
    - Create analytics dashboard
    - Implement activity trend analysis
    - Add farm performance metrics
    - Generate automated insights
  - **Acceptance Criteria**:
    - Analytics provide valuable insights
    - Charts and graphs are clear
    - Performance metrics are accurate

## Development Approach: Paired Sub-Agent Rounds

### Round Structure:

- **Total Rounds**: 8 rounds (complex project)
- **Pattern**: 2 related tasks per round with detailed atomic breakdown
- **Testing**: Manual testing after each round with specific test criteria
- **Git**: One commit per completed round with semantic commit messages
- **Dependencies**: Clear dependency mapping between tasks and rounds

### Round Execution Pattern:

```bash
claude → [round prompt] → atomic task execution → manual test → acceptance criteria check → git commit → next round
```

### Detailed Round Breakdown:

**Round 1: Foundation Setup & Configuration**

**Overview**: Establish the core Next.js 14 project foundation with proper TypeScript configuration and styling setup.

**Task A: Next.js 14 + TypeScript Project Initialization**

- **Technical Details**:
  - Execute `npx create-next-app@latest jaothui-fm --typescript --tailwind --eslint --app --src-dir=false`
  - Configure `next.config.js` with experimental features for app directory
  - Setup `tsconfig.json` with strict mode and path mapping
  - Configure `.gitignore` with Next.js and environment patterns
  - Initialize package.json with required scripts
- **Dependencies**: None (starting point)
- **Acceptance Criteria**:
  - [ ] `npm run dev` starts without errors on port 3000
  - [ ] TypeScript compilation works with strict mode
  - [ ] App directory structure exists with proper routing
  - [ ] ESLint configuration doesn't show any initial errors

**Task B: Tailwind CSS + DaisyUI Styling Configuration**

- **Technical Details**:
  - Install dependencies: `npm install daisyui @tailwindcss/typography`
  - Configure `tailwind.config.js` with DaisyUI plugin and custom orange theme
  - Setup `app/globals.css` with CSS reset and custom properties
  - Create initial component structure in `components/` directory
  - Test responsive breakpoints and DaisyUI components
- **Dependencies**: Task A completed (requires package.json)
- **Acceptance Criteria**:
  - [ ] DaisyUI components render correctly (test with a button)
  - [ ] Primary orange color (`#f39c12`) applies throughout
  - [ ] Mobile-first responsive design works (test at 320px, 768px, 1024px)
  - [ ] Dark mode support is functional

**Round Dependencies**: None
**Test Criteria**:

- Development server runs smoothly
- Basic component styling works
- No console errors in browser
- Mobile responsiveness verified

**Commit Message**: `feat: setup Next.js 14 foundation with TypeScript and Tailwind+DaisyUI styling`

---

**Round 2: Authentication & Database Infrastructure**

**Overview**: Implement secure authentication system with Clerk and establish database connection with Supabase + Prisma.

**Task A: Clerk Authentication System Setup**

- **Technical Details**:
  - Install Clerk: `npm install @clerk/nextjs`
  - Configure environment variables in `.env.local`
  - Setup Clerk provider in `app/layout.tsx`
  - Create middleware.ts for route protection
  - Configure phone number as primary authentication method
  - Setup LINE login provider in Clerk dashboard
  - Create phone number collection flow for social logins
- **Dependencies**: Round 1 completed (requires Next.js foundation)
- **Acceptance Criteria**:
  - [ ] Clerk authentication provider works without errors
  - [ ] Phone number registration/login flow functions
  - [ ] LINE login integration works and collects phone numbers
  - [ ] Protected routes redirect unauthenticated users
  - [ ] Authentication state persists across browser sessions

**Task B: Supabase + Prisma Database Configuration**

- **Technical Details**:
  - Create Supabase project and obtain connection strings
  - Install Prisma: `npm install prisma @prisma/client`
  - Initialize Prisma: `npx prisma init`
  - Configure `prisma/schema.prisma` with PostgreSQL provider
  - Create initial User and Farm models with proper relationships
  - Setup Prisma Client singleton in `lib/prisma.ts`
  - Configure Row Level Security (RLS) policies in Supabase
  - Run initial migration: `npx prisma migrate dev`
- **Dependencies**: Task A started (can run in parallel)
- **Acceptance Criteria**:
  - [ ] Database connection established successfully
  - [ ] Prisma schema generates without errors
  - [ ] Initial migration creates tables in Supabase
  - [ ] Prisma Client queries work from API routes
  - [ ] RLS policies protect user data correctly

**Round Dependencies**: Round 1 must be completed
**Test Criteria**:

- Authentication flow works end-to-end
- Database operations succeed via Prisma
- Environment variables load correctly
- No authentication or database connection errors

**Commit Message**: `feat: implement Clerk authentication and Supabase+Prisma database foundation`

---

**Round 3: Core Pages Structure & Layout**

**Overview**: Create the fundamental page structure with mobile-first design and basic navigation.

**Task A: Authentication Pages & Home Page**

- **Technical Details**:
  - Create `app/page.tsx` following `mock-ui/home-page.json` design exactly
  - Create `app/(auth)/sign-in/[[...sign-in]]/page.tsx` following `mock-ui/login-page.json`
  - Create `app/(auth)/sign-up/[[...sign-up]]/page.tsx` following `mock-ui/register-page.json`
  - Create `app/(auth)/success/page.tsx` following `mock-ui/success-page.json`
  - Implement JAOTHUI logo (120px x 120px) from `public/jaothui-logo.png`
  - Use consistent orange theme `#f39c12` and design patterns across all pages
  - Apply proper spacing, border-radius, and responsive design as per JSON specs
  - Integrate Clerk authentication components while maintaining design consistency
- **Dependencies**: Round 1, 2 completed (requires auth and styling)
- **Acceptance Criteria**:
  - [ ] All pages match their respective JSON design files exactly
  - [ ] JAOTHUI logo displays correctly from public assets
  - [ ] Clerk authentication integrates seamlessly with custom designs
  - [ ] Orange theme and consistent styling applied throughout
  - [ ] Mobile-responsive design works perfectly (400px max-width containers)
  - [ ] All form elements and buttons follow design specifications

**Task B: Protected Dashboard Layout Structure**

- **Technical Details**:
  - Create `app/(dashboard)/layout.tsx` following `mock-ui/profile-page.json` structure
  - Implement header with "ระบบ E-ID" title and red notification badge
  - Use dark gray `#4a4a4a` header background with white text
  - Create user greeting section with personalized message
  - Implement farm info card with 100px x 100px avatar and 15px border-radius
  - Add menu section with rounded cards and action buttons
  - Create logout button with transparent background and white border
  - Setup authentication protection and proper data fetching
- **Dependencies**: Task A completed (requires auth pages)
- **Acceptance Criteria**:
  - [ ] Dashboard layout matches `profile-page.json` design exactly
  - [ ] Authentication protection prevents unauthorized access
  - [ ] Header notification bell displays with red badge counter
  - [ ] Farm info card shows avatar and editable farm details
  - [ ] Menu items display with proper badges and action buttons
  - [ ] Logout functionality works correctly
  - [ ] Mobile-responsive design with 400px max-width container

**Round Dependencies**: Round 1, 2 must be completed
**Test Criteria**:

- All pages render without errors
- Authentication flow redirects work
- Mobile navigation is intuitive
- Protected routes enforce authentication

**Commit Message**: `feat: create core page structure with mobile-first responsive design`

---

**Round 4: Database Models & API Foundation**

**Overview**: Finalize database schema design and create robust API routes for data operations.

**Task A: Comprehensive Prisma Schema Design**

- **Technical Details**:
  - Expand User model with phone number uniqueness
  - Create comprehensive Animal model supporting all 5 animal types
  - Design Activity model with flexible activity types
  - Create Reminder model linked to activities
  - Add farm membership models for future invitation system
  - Implement proper indexes for performance
  - Add data validation constraints
  - Create seed data for development testing
- **Dependencies**: Round 2 completed (requires basic Prisma setup)
- **Acceptance Criteria**:
  - [ ] All animal types (ควาย, ไก่, วัว, หมู, ม้า) supported in single table
  - [ ] Auto-generated ID system works (`{TYPE_CODE}{YYYYMMDD}{SEQUENCE}`)
  - [ ] Optional fields (sex, birth_date, color, etc.) properly configured
  - [ ] Activity-Reminder relationship functions correctly
  - [ ] Database indexes optimize common queries

**Task B: CRUD API Routes Implementation**

- **Technical Details**:
  - Create `/api/farms/` routes for farm management
  - Create `/api/animals/` routes with full CRUD operations
  - Create `/api/activities/` routes with reminder integration
  - Implement proper error handling and validation
  - Add request/response type definitions
  - Setup API middleware for authentication
  - Add logging and monitoring
  - Create utility functions for common operations
- **Dependencies**: Task A completed (requires schema)
- **Acceptance Criteria**:
  - [ ] All CRUD operations work through API routes
  - [ ] Proper HTTP status codes returned
  - [ ] Request validation prevents invalid data
  - [ ] Error responses provide helpful messages
  - [ ] Authentication required for protected endpoints

**Round Dependencies**: Round 2, 3 must be completed
**Test Criteria**:

- Database operations succeed via API
- Auto-generated IDs work correctly
- API endpoints return proper responses
- Data validation prevents corruption

**Commit Message**: `feat: implement comprehensive Prisma schema and API routes foundation`

---

**Round 5: Animal Management Interface**

**Overview**: Build the core animal management interface with list view, detail view, and navigation.

**Task A: Animal List Page with Tab Navigation**

- **Technical Details**:
  - Create `app/(dashboard)/animals/page.tsx` with tab navigation
  - Implement "Animal List" and "Reminders" tabs
  - Design animal cards with essential information display
  - Add search functionality with debounced input
  - Implement filter by animal type
  - Add sort options (name, date added, type)
  - Include empty states and loading skeletons
  - Optimize for touch interaction on mobile
- **Dependencies**: Round 3, 4 completed (requires dashboard and API)
- **Acceptance Criteria**:
  - [ ] Tab navigation switches smoothly between views
  - [ ] Animal cards display name, type, ID, and basic info
  - [ ] Search filters animals in real-time
  - [ ] Filter by animal type works correctly
  - [ ] Loading states show during data fetching

**Task B: Animal Detail Page with Information Display**

- **Technical Details**:
  - Create `app/(dashboard)/animals/[id]/page.tsx` for individual animals
  - Display comprehensive animal information (all fields)
  - Show related activities and reminders
  - Add edit button for animal details
  - Implement image display with fallback
  - Add back navigation to list view
  - Include action buttons (edit, delete, add activity)
  - Implement proper error handling for missing animals
- **Dependencies**: Task A completed (requires list page navigation)
- **Acceptance Criteria**:
  - [ ] All animal details render correctly
  - [ ] Related activities/reminders display
  - [ ] Navigation to/from list works smoothly
  - [ ] Image handling works with fallbacks
  - [ ] Edit button leads to form (placeholder for now)

**Round Dependencies**: Round 3, 4 must be completed
**Test Criteria**:

- Animal list displays properly
- Detail view shows complete information
- Navigation between views works
- Search and filter functionality operates correctly

**Commit Message**: `feat: create animal management interface with list and detail views`

---

**Round 6: Animal CRUD Operations & Forms**

**Overview**: Implement complete Create, Read, Update, Delete operations for animals with proper form handling.

**Task A: Add Animal Form with Auto-Generated IDs**

- **Technical Details**:
  - Create `app/(dashboard)/animals/add/page.tsx` with comprehensive form
  - Implement auto-generated ID system with animal type codes
  - Use React Hook Form with Zod validation schema
  - Add image upload functionality (with placeholder handling)
  - Implement parent animal selection (optional)
  - Add weight/height input with proper units
  - Include form submission loading states
  - Handle form errors and success feedback
- **Dependencies**: Round 4, 5 completed (requires API and interface)
- **Acceptance Criteria**:
  - [ ] Auto-generated IDs work for all animal types
  - [ ] Form validation prevents invalid submissions
  - [ ] Image upload handles various file types
  - [ ] Parent selection shows existing animals
  - [ ] Form submission creates animal successfully

**Task B: Edit Animal Form & Data Management**

- **Technical Details**:
  - Create `app/(dashboard)/animals/[id]/edit/page.tsx` for updates
  - Pre-populate form with existing animal data
  - Allow modification of auto-generated IDs with validation
  - Implement optimistic updates for better UX
  - Add confirmation dialogs for destructive actions
  - Handle concurrent edit prevention
  - Add data change tracking
  - Implement proper error recovery
- **Dependencies**: Task A completed (requires add form components)
- **Acceptance Criteria**:
  - [ ] Form pre-populates with current animal data
  - [ ] Modified auto-generated IDs validate correctly
  - [ ] Updates reflect immediately in the interface
  - [ ] Concurrent edit conflicts are handled
  - [ ] Delete functionality works with confirmation

**Round Dependencies**: Round 4, 5 must be completed
**Test Criteria**:

- Animal creation works with auto-generated IDs
- Edit functionality updates data correctly
- Form validation prevents data corruption
- User feedback is clear and helpful

**Commit Message**: `feat: implement comprehensive animal CRUD operations with auto-generated IDs`

---

**Round 7: Activity & Reminder System**

**Overview**: Build the activity tracking system with flexible types and reminder management.

**Task A: Activity Creation with Type History**

- **Technical Details**:
  - Create `app/(dashboard)/activities/add/page.tsx` for activity creation
  - Implement localStorage for frequently used activity types
  - Build autocomplete dropdown with type suggestions
  - Add manual activity type entry option
  - Include optional reminder date/time picker
  - Implement animal selection from user's farm
  - Add activity description and notes fields
  - Create real-time type suggestion algorithm
- **Dependencies**: Round 5, 6 completed (requires animal management)
- **Acceptance Criteria**:
  - [ ] Frequently used activity types appear in suggestions
  - [ ] localStorage persists suggestions across sessions
  - [ ] Manual type entry always available
  - [ ] Date/time picker is user-friendly
  - [ ] Activities save with proper animal association

**Task B: Reminder Tab with Status Management**

- **Technical Details**:
  - Implement reminder tab in animals page
  - Sort reminders by nearest date (overdue first)
  - Add visual indicators for overdue reminders
  - Create quick action buttons (complete, postpone, cancel)
  - Implement postpone functionality with new date picker
  - Add bulk actions for multiple reminders
  - Include status change notifications
  - Optimize query performance for large reminder lists
- **Dependencies**: Task A completed (requires activity creation)
- **Acceptance Criteria**:
  - [ ] Reminders sort correctly by date/priority
  - [ ] Overdue items are visually distinct
  - [ ] Quick actions update status immediately
  - [ ] Postponed reminders get new dates correctly
  - [ ] Bulk actions work for multiple selections

**Round Dependencies**: Round 5, 6 must be completed
**Test Criteria**:

- Activity creation saves to localStorage
- Reminder system sorts and displays correctly
- Status management works reliably
- Performance is acceptable with many reminders

**Commit Message**: `feat: implement activity tracking and reminder management system`

---

**Round 8: Notification System & Final Polish**

**Overview**: Complete the notification system with web push notifications and daily scheduling.

**Task A: Web Push Notifications Setup**

- **Technical Details**:
  - Configure VAPID keys for web push notifications
  - Create service worker for push message handling
  - Implement notification permission request flow
  - Setup push subscription management
  - Design notification templates with animal/activity info
  - Add notification action buttons
  - Handle notification click events for navigation
  - Create fallback for unsupported browsers
- **Dependencies**: Round 7 completed (requires reminder system)
- **Acceptance Criteria**:
  - [ ] Push notifications work across major browsers
  - [ ] Permission request is user-friendly
  - [ ] Notifications contain relevant information
  - [ ] Action buttons function correctly
  - [ ] Click navigation works properly

**Task B: Daily Cron Job & Notification Bell**

- **Technical Details**:
  - Create Vercel cron function for daily 6 AM execution
  - Implement timezone handling for different users
  - Add cron job authentication and security
  - Create notification bell counter in header
  - Implement in-app notification list
  - Add mark as read functionality
  - Setup real-time notification updates
  - Create notification history management
- **Dependencies**: Task A completed (requires push notification foundation)
- **Acceptance Criteria**:
  - [ ] Cron job runs daily at correct time
  - [ ] Timezone handling works for different users
  - [ ] Bell shows accurate notification count
  - [ ] In-app notifications display correctly
  - [ ] Real-time updates work smoothly

**Round Dependencies**: Round 7 must be completed
**Test Criteria**:

- Push notifications deliver successfully
- Daily scheduling works correctly
- Notification bell updates in real-time
- All notification features integrate properly

**Commit Message**: `feat: complete notification system with push notifications and daily scheduling`

### Enhanced Prompt Templates with Context:

- **Round 1**: "อ่าน CLAUDE.md และทำ Round 1: Foundation Setup & Configuration ตาม paired sub-agent pattern พร้อม atomic tasks และ acceptance criteria ที่ระบุไว้"

- **Round 2**: "อ่าน CLAUDE.md และทำ Round 2: Authentication & Database Infrastructure ตาม paired sub-agent pattern โดยให้ dependency เรียบร้อยจาก Round 1"

- **Round 3**: "อ่าน CLAUDE.md และทำ Round 3: Core Pages Structure & Layout ตาม paired sub-agent pattern โดยใช้ auth และ database จาก Round 2"

- **Round 4**: "อ่าน CLAUDE.md และทำ Round 4: Database Models & API Foundation ตาม paired sub-agent pattern โดยขยาย schema และสร้าง API routes"

- **Round 5**: "อ่าน CLAUDE.md และทำ Round 5: Animal Management Interface ตาม paired sub-agent pattern โดยใช้ API จาก Round 4"

- **Round 6**: "อ่าน CLAUDE.md และทำ Round 6: Animal CRUD Operations & Forms ตาม paired sub-agent pattern พร้อม auto-generated IDs"

- **Round 7**: "อ่าน CLAUDE.md และทำ Round 7: Activity & Reminder System ตาม paired sub-agent pattern พร้อม localStorage และ status management"

- **Round 8**: "อ่าน CLAUDE.md และทำ Round 8: Notification System & Final Polish ตาม paired sub-agent pattern พร้อม push notifications และ cron jobs"

### Advanced Recovery Strategy:

```
Recovery Levels:
1. **Task-level Recovery**: If single task fails
   - Ask: "สรุปความคืบหน้าของ task [A/B] ใน round นี้"
   - Continue with remaining task

2. **Round-level Recovery**: If entire round has issues
   - Ask: "สรุปความคืบหน้าของ Round [X] และแสดง checklist ที่เสร็จแล้ว"
   - Switch to sequential task execution

3. **Dependency Recovery**: If previous round incomplete
   - Review round dependencies
   - Complete missing acceptance criteria first

4. **Full Project Recovery**: If major issues occur
   - Review PROGRESS.md for latest working state
   - Restart from last completed round
   - Verify all acceptance criteria before proceeding
```

### Quality Assurance Checkpoints:

**After Each Round:**

1. **Functionality Test**: All acceptance criteria must pass
2. **Performance Test**: Page load times under 3 seconds
3. **Mobile Test**: Verify responsiveness at 320px, 768px, 1024px
4. **Accessibility Test**: Basic keyboard navigation and screen reader support
5. **Error Handling Test**: Verify graceful error handling
6. **Git Status**: Clean commit with semantic message

**Before Next Round:**

1. **Dependency Verification**: Confirm all required components are working
2. **Environment Check**: All environment variables are configured
3. **Database State**: Verify schema and data integrity
4. **Authentication State**: Confirm auth flow works end-to-end

## Business Logic & Database Design

### User-Farm Relationship:

- 1 user = 1 owned farm + 1 member farm (future feature)
- Farm auto-created on user registration
- Phone number as unique identifier

### Animal Management:

- Auto-generated IDs: `{TYPE_CODE}{YYYYMMDD}{SEQUENCE}` (e.g., BF20250101001)
- User can modify generated IDs
- All animal types in single table
- Required: name only; Optional: sex, birth_date, color, image_url, weight, height, parent names

### Activity System:

- Free-text activity types with localStorage history
- Optional reminder dates
- Status: pending, completed, cancelled, overdue
- Only activities with reminder_date create reminder records

### Notification System:

- Daily 6 AM cron job for pending reminders
- Web push notifications + in-app notification bell
- Notification count in header

## Quality Standards

- **Code Quality**: TypeScript strict mode, เขียนโค้ดระดับปานกลาง เข้าใจง่าย
- **Testing**: Manual testing after each round
- **Responsive**: Mobile-first design ตาม JSON specifications
- **Performance**: Fast loading, optimized queries
- **Accessibility**: Semantic HTML, proper contrast ratios
- **Documentation**: สร้าง docs สำหรับส่วนที่ซับซ้อน

## UI Design Guidelines (from JSON Mock-ups)

### Core Design System:

- **Primary Color**: `#f39c12` (orange theme for brand, buttons, active states)
- **Secondary Colors**:
  - Header background: `#4a4a4a` (dark gray)
  - Card backgrounds: `#ffffff`, `#f9f9f9`, `#f5f5f5`
  - Secondary buttons: `#cccccc`, `#e0e0e0`
  - Text colors: `#333333`, `#666666`, `#999999`

### Logo & Branding:

- **Logo File**: `jaothui-logo.png` (reference from mock-ui designs)
- **Logo Size**: 120px x 120px for most pages
- **Brand Name**: "JAOTHUI" in orange `#f39c12`
- **System Title**: "ระบบ E-ID" for headers

### Layout Patterns:

- **Mobile-first**: 400px max-width containers, centered with auto margins
- **Container Padding**: 20px standard, 40px for welcome pages
- **Card Spacing**: 15px padding internal, 10-20px margins between cards
- **Border Radius**: 15px for cards, 25px for buttons and inputs

### Component Guidelines:

#### Buttons:

- **Primary**: Orange `#f39c12` background, white text, 25px border-radius
- **Secondary**: Gray `#cccccc` background, dark text
- **Fixed Bottom**: 80% width, centered, 30px from bottom
- **Touch Target**: Minimum 44px height, 15px padding

#### Inputs & Forms:

- **Background**: White `#ffffff` with light gray `#f5f5f5` for disabled
- **Border**: 1px solid `#e0e0e0` or none
- **Padding**: 15px horizontal, 15px vertical
- **Border Radius**: 25px for text inputs, 15px for textareas
- **Icons**: Right-aligned edit/action icons

#### Cards:

- **Background**: White or light gray `#f9f9f9`
- **Border Radius**: 15px consistent
- **Padding**: 15-20px internal
- **Shadow**: Subtle or none (flat design approach)

#### Navigation:

- **Tab Style**: Rounded top corners (15px), active tab white background
- **Header**: Dark gray `#4a4a4a` background, white text, 20px padding
- **Back Buttons**: Consistent placement and styling

#### Lists & Content:

- **Animal Cards**: Profile image left, info text right, action buttons
- **Info Rows**: Icon + label + value pattern
- **Notification Cards**: Status info with action buttons
- **Spacing**: 15px between list items

### Responsive Behavior:

- **Mobile**: Single column, full-width components
- **Touch**: 44px minimum touch targets, appropriate spacing
- **Typography**: 16px base, 24px headings, 14px secondary text

## Project Structure

```
farm-management-system/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   └── success/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (profile dashboard)
│   │   ├── animals/
│   │   │   ├── page.tsx (list with tabs)
│   │   │   ├── add/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx (detail view)
│   │   │       └── edit/page.tsx
│   │   └── activities/
│   │       └── add/page.tsx
│   ├── api/
│   │   ├── farms/
│   │   ├── animals/
│   │   └── activities/
│   ├── layout.tsx (root layout with Clerk)
│   ├── page.tsx (home/welcome page)
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── TabNavigation.tsx
│   │   └── NotificationBell.tsx
│   ├── forms/
│   │   ├── AnimalForm.tsx
│   │   ├── ActivityForm.tsx
│   │   └── AuthForms.tsx
│   ├── layouts/
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   └── DashboardLayout.tsx
│   └── animals/
│       ├── AnimalCard.tsx
│       ├── AnimalList.tsx
│       └── AnimalDetail.tsx
├── lib/
│   ├── prisma.ts
│   ├── supabase.ts
│   ├── clerk.ts
│   ├── types.ts
│   ├── utils.ts
│   └── validations.ts (Zod schemas)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── jaothui-logo.png (120x120px brand logo)
│   ├── icons/ (UI icons)
│   └── images/ (placeholder animal images)
├── mock-ui/ (reference designs)
│   ├── home-page.json
│   ├── login-page.json
│   ├── register-page.json
│   ├── success-page.json
│   ├── profile-page.json
│   ├── animal-list-tab-page.json
│   ├── animal-detail-page.json
│   ├── animal-create-page.json
│   ├── animal-update-page.json
│   └── animal-reminder-tab-page.json
├── CLAUDE.md (this file)
├── PROGRESS.md (progress tracking)
├── README.md (documentation)
└── .gitignore
```

## Environment Variables Required

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Supabase Database
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# Push Notifications (Round 8)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=Bxxxxx
VAPID_PRIVATE_KEY=xxxxx
VAPID_EMAIL=your-email@example.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-random-secret-123
```

## Success Criteria

### Phase 1: Core Foundation ✅

- [ ] Next.js 14 + TypeScript setup working
- [ ] Tailwind + DaisyUI configured
- [ ] Clerk authentication with phone + LINE
- [ ] Supabase + Prisma connected

### Phase 2: Basic Functionality ✅

- [ ] All core pages render correctly
- [ ] Mobile-responsive design implemented
- [ ] Animal CRUD operations working
- [ ] Auto-generated Animal IDs functional

### Phase 3: Advanced Features ✅

- [ ] Activity system with localStorage history
- [ ] Reminder system functional
- [ ] Push notifications working
- [ ] Daily 6 AM cron job scheduled

### Phase 4: Deployment & Polish ✅

- [ ] Deployed to Vercel successfully
- [ ] All features tested in production
- [ ] Performance optimized
- [ ] Documentation complete

## Development Tips

1. **Context Management**: Always reference CLAUDE.md in prompts
2. **Round Discipline**: Complete each round fully before moving to next
3. **Testing Protocol**: Manual test after every round completion
4. **Git Discipline**: One commit per completed round
5. **Progress Tracking**: Update PROGRESS.md after each round
6. **Error Handling**: Use recovery strategies for timeouts/issues
7. **Mobile-first**: Always start with mobile design, then desktop
8. **JSON Design Reference**: **CRITICAL** - Follow the `mock-ui/*.json` designs EXACTLY
   - Each page has a corresponding JSON file with precise specifications
   - Use exact colors, spacing, border-radius, and component layouts
   - Reference logo file: `public/jaothui-logo.png` (120px x 120px)
   - Brand colors: Orange `#f39c12`, Header `#4a4a4a`, Cards `#f9f9f9`
9. **Prisma Usage**: Use Prisma Client for all database operations
10. **Type Safety**: Leverage TypeScript for better development experience
11. **Asset Management**: Ensure `jaothui-logo.png` is copied to `public/` directory
12. **Design Consistency**: Maintain JAOTHUI branding and "ระบบ E-ID" system title throughout
