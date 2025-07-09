# TESTING-PROTOCOLS.md

**Load for All Rounds (Testing Guidance)**

## 🧪 Round-by-Round Testing Protocols

### Round 1: Foundation Setup Testing

**Objective**: Verify Next.js 14 + TypeScript + Tailwind + DaisyUI foundation works correctly

#### Pre-Testing Setup

```bash
# 1. Install dependencies
npm install

# 2. Environment check
node --version  # Should be >= 18.18.0
npm --version   # Should be >= 9.0.0
```

#### Core Functionality Tests

```bash
# 1. Development server test
npm run dev
# ✅ Should start on http://localhost:3000 without errors
# ✅ Should show Next.js default page or custom content
# ✅ Browser console should be error-free

# 2. TypeScript compilation test
npm run build
# ✅ Should complete without TypeScript errors
# ✅ Should generate .next directory with static files
# ✅ No type errors in terminal output

# 3. Production build test
npm run start
# ✅ Should serve production build successfully
# ✅ Should be accessible at http://localhost:3000
```

#### DaisyUI Integration Test

```tsx
// Add test component to any page (temporarily):
const DaisyUITest = () => (
  <div className="p-8 space-y-4">
    {/* Primary button test */}
    <button className="btn btn-primary">
      Primary Button (Should be orange #f39c12)
    </button>

    {/* Secondary button test */}
    <button className="btn btn-secondary">Secondary Button</button>

    {/* Card test */}
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Card Test</h2>
        <p>This card should have proper styling</p>
      </div>
    </div>

    {/* Input test */}
    <input
      type="text"
      placeholder="Test input"
      className="input input-bordered w-full max-w-xs"
    />
  </div>
);
```

#### Mobile Responsive Test

**Chrome DevTools testing:**

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test at these widths:
   - **320px**: iPhone SE (smallest common width)
   - **375px**: iPhone standard
   - **400px**: Project target max-width
   - **768px**: iPad portrait
   - **1024px**: Desktop

#### Acceptance Criteria Checklist

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] TypeScript strict mode compiles without errors
- [ ] DaisyUI components render with correct orange theme (#f39c12)
- [ ] Mobile responsive design works at 400px width
- [ ] No console errors in browser
- [ ] App directory structure created correctly

---

### Round 2: Authentication & Database Testing

**Objective**: Verify Clerk authentication and Supabase+Prisma database integration

#### Environment Variables Test

```bash
# Check all required environment variables are set:
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  # Should return pk_test_xxxxx
echo $CLERK_SECRET_KEY                   # Should return sk_test_xxxxx
echo $DATABASE_URL                       # Should return postgresql://...
echo $NEXT_PUBLIC_SUPABASE_URL          # Should return https://xxxxx.supabase.co
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY     # Should return eyJxxxxx
```

#### Clerk Authentication Test

```bash
# 1. Start development server
npm run dev

# 2. Test authentication flow:
# - Visit http://localhost:3000
# - Click sign-in button
# - Should redirect to Clerk hosted pages
# - Register with phone number: +66922123456
# - Should complete registration successfully
# - Should redirect back to application

# 3. Test LINE login (if configured):
# - Click LINE login button
# - Should redirect to LINE auth
# - Should collect phone number during flow
# - Should create profile with LINE data
```

#### Database Connection Test

```bash
# 1. Prisma connection test
npx prisma studio
# ✅ Should open Prisma Studio at http://localhost:5555
# ✅ Should show database tables without errors
# ✅ Should be able to browse existing data

# 2. Database schema test
npx prisma db push
# ✅ Should apply schema to database successfully
# ✅ Should create all required tables (profiles, farms, animals, etc.)
# ✅ Should show "Database is now in sync with your schema"

# 3. Migration test (if using migrations)
npx prisma migrate dev --name init
# ✅ Should create migration files in prisma/migrations/
# ✅ Should apply migration to database
# ✅ Should generate Prisma client
```

#### Protected Routes Test

```bash
# 1. Test route protection:
# - Visit dashboard URL without login: http://localhost:3000/dashboard
# - Should redirect to sign-in page
# - Should preserve redirect URL after login

# 2. Test authenticated access:
# - Login with valid credentials
# - Should access dashboard successfully
# - Should show user-specific data
```

#### Acceptance Criteria Checklist

- [ ] Clerk authentication flow works with phone numbers
- [ ] LINE login integration functions correctly
- [ ] Database connection established successfully
- [ ] Prisma schema generates and migrates without errors
- [ ] Protected routes redirect unauthenticated users
- [ ] Authentication state persists across browser sessions
- [ ] User profile data saves to database correctly

---

### Round 3: Core Pages Structure Testing

**Objective**: Verify all core pages render correctly with proper design and navigation

#### Visual Design Verification

**Compare each page with corresponding JSON mock-up:**

```bash
# 1. Home page test
# - Visit http://localhost:3000
# - Compare with mock-ui/home-page.json
# ✅ JAOTHUI logo displays correctly (120px x 120px)
# ✅ Orange branding color (#f39c12) applied
# ✅ "ยินดีต้อนรับเข้าสู่ระบบ E-ID" title visible
# ✅ "ข้อมูลควาย" subtitle visible
# ✅ "Powered by JAOTHUI" footer text shown
# ✅ "เข้าสู่ระบบ" button with correct styling

# 2. Authentication pages test
# - Visit sign-in, sign-up, success pages
# - Compare with respective JSON files
# ✅ Consistent logo and branding across all pages
# ✅ Form inputs match design specifications
# ✅ Button styling consistent (25px border-radius, orange color)
# ✅ Mobile responsive at 400px width
```

#### Navigation Flow Test

```bash
# Test complete user journey:
# 1. Home → Sign In
# 2. Sign In → Register (if new user)
# 3. Register → Success page
# 4. Success → Sign In
# 5. Sign In → Dashboard (after login)

# ✅ All navigation transitions work smoothly
# ✅ No broken links or 404 errors
# ✅ Proper redirects after authentication
# ✅ Back button behavior works correctly
```

#### Mobile Responsiveness Test

```bash
# Test at multiple screen sizes:
# 1. 320px width (iPhone SE)
# 2. 375px width (iPhone standard)
# 3. 400px width (container max-width)
# 4. 768px width (tablet)

# ✅ All content visible and accessible
# ✅ Touch targets minimum 44px
# ✅ Horizontal scrolling not required
# ✅ Typography scales appropriately
```

#### Acceptance Criteria Checklist

- [ ] All pages match their respective JSON design files exactly
- [ ] JAOTHUI logo displays correctly from public assets
- [ ] Orange theme (#f39c12) applied consistently throughout
- [ ] Mobile-responsive design works at 400px max-width
- [ ] Navigation between pages functions smoothly
- [ ] No console errors or broken images
- [ ] Authentication integration works with custom designs

---

### Round 4: Database Models & API Testing

**Objective**: Verify database models and API routes function correctly

#### API Endpoint Testing

```bash
# Use curl, Postman, or browser to test API endpoints:

# 1. Test farms API
curl -X GET "http://localhost:3000/api/farms" \
  -H "Authorization: Bearer {clerk_session_token}"
# ✅ Should return user's farms
# ✅ Should include farm details and animal counts

# 2. Test animals API
curl -X POST "http://localhost:3000/api/animals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {clerk_session_token}" \
  -d '{
    "farmId": "farm_uuid_here",
    "animalType": "BUFFALO",
    "name": "เอกชัย"
  }'
# ✅ Should create animal with auto-generated ID
# ✅ Should return created animal data
# ✅ ID format should be BF20250109001

# 3. Test animal ID generation
# Create multiple animals of same type on same day:
# - First buffalo: BF20250109001
# - Second buffalo: BF20250109002
# - First chicken: CK20250109001
```

#### Database Operations Test

```bash
# 1. Prisma Studio verification
npx prisma studio
# - Navigate to animals table
# ✅ Auto-generated IDs follow correct pattern
# ✅ All required relationships exist
# ✅ Enum values stored correctly

# 2. Direct database queries
npx prisma db seed  # If seed file exists
# ✅ Seed data creates successfully
# ✅ Relationships between tables work
# ✅ Constraints prevent invalid data
```

#### Error Handling Test

```bash
# Test API error scenarios:

# 1. Invalid data
curl -X POST "http://localhost:3000/api/animals" \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'  # Missing required fields
# ✅ Should return 400 Bad Request
# ✅ Should include helpful error message

# 2. Unauthorized access
curl -X GET "http://localhost:3000/api/farms"
# ✅ Should return 401 Unauthorized
# ✅ Should not expose sensitive data

# 3. Duplicate animal ID
# Try to create animal with existing ID
# ✅ Should return appropriate error
# ✅ Should not corrupt database
```

#### Acceptance Criteria Checklist

- [ ] Auto-generated Animal IDs work for all 5 animal types
- [ ] All CRUD operations function via API routes
- [ ] Request/response validation prevents invalid data
- [ ] Database queries optimized with proper indexes
- [ ] Error handling provides helpful messages
- [ ] Authentication required for protected endpoints

---

### Round 5: Animal Management Interface Testing

**Objective**: Verify animal list and detail pages work correctly

#### Animal List Page Test

```bash
# 1. Navigation test
# - Login to dashboard
# - Click "ข้อมูลกระบือภายในฟาร์ม" button
# - Should navigate to animals list page

# 2. Tab functionality test
# ✅ "กระบือในฟาร์ม" tab shows animal list
# ✅ "รายการแจ้งเตือน" tab shows reminder list
# ✅ Tab switching works smoothly
# ✅ Active tab styling correct (white background)
# ✅ Inactive tab styling correct (gray background)

# 3. Animal cards display test
# ✅ Each animal card shows profile image
# ✅ Animal name displays correctly
# ✅ Birth date shows in correct format
# ✅ Animal ID displays correctly
# ✅ Card styling matches design (15px border-radius, #f9f9f9 background)
```

#### Search and Filter Test

```bash
# If search functionality implemented:
# 1. Search by animal name
# 2. Filter by animal type
# 3. Sort by date added

# ✅ Search results update in real-time
# ✅ Filters work correctly
# ✅ Sort order functions properly
# ✅ Empty states show appropriate messages
```

#### Animal Detail Page Test

```bash
# 1. Navigation to detail
# - Click on any animal card
# - Should navigate to detail page with correct animal ID

# 2. Information display test
# ✅ All animal information renders correctly
# ✅ Profile image displays (or placeholder if none)
# ✅ PED/ART tabs visible (PED active by default)
# ✅ Information rows show with proper icons
# ✅ Action buttons styled correctly

# 3. Related data test
# ✅ Associated activities display (if any)
# ✅ Reminders show in appropriate section
# ✅ Back navigation works to return to list
```

#### Mobile Interface Test

```bash
# Test on mobile viewport (400px):
# ✅ Tab navigation touch-friendly
# ✅ Animal cards easy to tap
# ✅ Detail page scrolls properly
# ✅ Fixed bottom button accessible
# ✅ All text readable at mobile size
```

#### Acceptance Criteria Checklist

- [ ] Tab navigation switches smoothly between animal list and reminders
- [ ] Animal cards display correctly with all required information
- [ ] Detail page shows comprehensive animal information
- [ ] Navigation to/from list and detail views works correctly
- [ ] Mobile interface is touch-friendly and responsive
- [ ] Loading states show during data fetching

---

### Round 6: Animal CRUD Operations Testing

**Objective**: Verify create, update, and delete operations for animals

#### Add Animal Form Test

```bash
# 1. Navigation to add form
# - From animal list, click "เพิ่มข้อมูลกระบือ" button
# - Should navigate to add animal form

# 2. Auto-generated ID test
# ✅ Select animal type "Buffalo"
# ✅ ID should auto-generate as BF20250109XXX
# ✅ Generated ID should be editable
# ✅ User can modify auto-generated ID
# ✅ Validation prevents duplicate IDs

# 3. Form validation test
# - Submit form with empty name field
# ✅ Should show validation error
# ✅ Should prevent form submission
# ✅ Error messages should be helpful

# 4. Successful creation test
# - Fill all required fields
# - Submit form
# ✅ Should create animal successfully
# ✅ Should redirect to animal detail or list
# ✅ New animal should appear in list
# ✅ Data should persist in database
```

#### Edit Animal Form Test

```bash
# 1. Navigation to edit form
# - From animal detail page, click "อัปเดตข้อมูลกระบือ"
# - Should navigate to edit form

# 2. Form pre-population test
# ✅ All existing data should pre-fill form fields
# ✅ Auto-generated ID should be editable
# ✅ Optional fields should show current values

# 3. Update operations test
# - Modify animal name
# - Change optional fields (weight, color, etc.)
# - Submit form
# ✅ Should update animal successfully
# ✅ Changes should reflect immediately
# ✅ Should handle concurrent edit conflicts
```

#### Image Upload Test

```bash
# If image upload implemented:
# 1. Upload valid image file
# ✅ Should accept common formats (jpg, png, webp)
# ✅ Should resize/optimize image appropriately
# ✅ Should update animal's imageUrl

# 2. Invalid file test
# ✅ Should reject non-image files
# ✅ Should show appropriate error message
# ✅ Should handle large file sizes gracefully
```

#### Data Validation Test

```bash
# Test various validation scenarios:
# 1. Required field validation (name)
# 2. Animal ID uniqueness within farm
# 3. Date validation (birth_date)
# 4. Numeric validation (weight, height)

# ✅ All validations should work client-side
# ✅ Server-side validation should catch edge cases
# ✅ Error messages should be user-friendly
# ✅ Form should maintain user input during validation errors
```

#### Acceptance Criteria Checklist

- [ ] Auto-generated IDs work for all animal types with correct format
- [ ] Form validation prevents invalid submissions
- [ ] React Hook Form + Zod validation functions correctly
- [ ] Create and update operations work successfully
- [ ] Changes persist to database correctly
- [ ] Error handling provides clear feedback to users

---

### Round 7: Activity & Reminder System Testing

**Objective**: Verify activity creation and reminder management work correctly

#### Activity Creation Test

```bash
# 1. Navigation to activity form
# - From animal detail page or dedicated activity section
# - Click "เพิ่มกิจกรรม" or similar button

# 2. Activity type suggestions test
# - Start typing activity type "ตรวจสุขภาพ"
# - Submit form
# - Start typing activity type again
# ✅ "ตรวจสุขภาพ" should appear in suggestions
# ✅ localStorage should persist suggestions across sessions
# ✅ Manual entry should always be available

# 3. Reminder creation test
# - Create activity with reminder date
# ✅ Should create activity record
# ✅ Should create reminder record if reminder_date provided
# ✅ Should NOT create reminder if no reminder_date

# 4. Activity without reminder test
# - Create activity without reminder date
# ✅ Should create activity successfully
# ✅ Should not create reminder record
# ✅ Should not appear in reminder tab
```

#### Reminder Management Test

```bash
# 1. Reminder list display test
# - Navigate to reminder tab
# ✅ Should show reminders sorted by nearest date
# ✅ Overdue reminders should be visually distinct
# ✅ Should show animal name, activity title, reminder date

# 2. Status update test
# - Mark reminder as "complete"
# ✅ Should update reminder status
# ✅ Should update activity status
# ✅ Should reflect changes immediately

# 3. Postpone functionality test
# - Click "postpone" on reminder
# - Select new date
# ✅ Should update reminder_date
# ✅ Should resort reminder list
# ✅ Should maintain original activity_date
```

#### localStorage Test

```bash
# Activity type history test:
# 1. Create activity with type "ฉีดวัคซีน"
# 2. Create activity with type "ตรวจสุขภาพ"
# 3. Create activity with type "ให้ยา"
# 4. Start creating new activity

# ✅ All three types should appear in suggestions
# ✅ Most recent types should appear first
# ✅ Should persist after browser refresh
# ✅ Should work across multiple sessions

# Test localStorage persistence:
# 1. Close browser
# 2. Reopen browser and navigate to activity form
# ✅ Previous activity types should still be suggested
```

#### Performance Test

```bash
# Test with many reminders:
# 1. Create 20+ activities with reminders
# 2. Navigate to reminder tab

# ✅ List should load quickly (< 2 seconds)
# ✅ Sorting should be fast
# ✅ Status updates should be responsive
# ✅ No memory leaks in browser
```

#### Acceptance Criteria Checklist

- [ ] Activity types save to localStorage and suggest on reuse
- [ ] Optional reminder dates create reminder records correctly
- [ ] Reminder tab sorts by nearest date with overdue items first
- [ ] Status updates (complete, postpone, cancel) work correctly
- [ ] localStorage persists activity type history across sessions
- [ ] Performance remains good with many reminders

---

### Round 8: Notification System Testing

**Objective**: Verify push notifications and cron job functionality

#### Push Notification Setup Test

```bash
# 1. Service worker registration test
# - Visit application in Chrome
# - Open Developer Tools → Application → Service Workers
# ✅ Service worker should be registered
# ✅ Should show "activated and running" status

# 2. Permission request test
# - Trigger notification permission request
# ✅ Browser should show permission dialog
# ✅ Should handle user acceptance gracefully
# ✅ Should handle user denial gracefully
```

#### Push Notification Delivery Test

```bash
# 1. Manual notification test
# - Create activity with reminder for today
# - Trigger manual notification send (if endpoint available)

# ✅ Notification should appear on desktop
# ✅ Should include animal name and activity title
# ✅ Should show JAOTHUI logo as icon
# ✅ Should include action buttons if implemented

# 2. Notification click test
# - Click on notification
# ✅ Should open/focus application tab
# ✅ Should navigate to relevant animal/activity page
# ✅ Should mark notification as read
```

#### Notification Bell Test

```bash
# 1. Bell counter test
# - Create notifications for user
# - Navigate to dashboard
# ✅ Notification bell should show correct count
# ✅ Count should update in real-time

# 2. Bell click test
# - Click notification bell
# ✅ Should show notification list
# ✅ Should mark notifications as read when viewed
# ✅ Count should update after marking as read
```

#### Cron Job Test

```bash
# 1. Cron endpoint test (manual)
curl -X GET "http://localhost:3000/api/cron/notifications" \
  -H "Authorization: Bearer {CRON_SECRET}"

# ✅ Should return success response
# ✅ Should process today's reminders
# ✅ Should send notifications to users
# ✅ Should mark reminders as sent

# 2. Security test
curl -X GET "http://localhost:3000/api/cron/notifications"
# ✅ Should return 401 Unauthorized without proper secret

# 3. Production cron test (if deployed)
# - Wait for 6 AM trigger time
# - Create reminder for test
# ✅ Should receive notification at correct time
# ✅ Should only send once per reminder
```

#### Browser Compatibility Test

```bash
# Test push notifications across browsers:
# 1. Chrome (should work fully)
# 2. Firefox (should work)
# 3. Safari (may have limitations)
# 4. Mobile browsers

# ✅ Graceful fallback for unsupported browsers
# ✅ Clear messaging about browser support
# ✅ No JavaScript errors in any browser
```

#### Acceptance Criteria Checklist

- [ ] Push notification permission request works correctly
- [ ] Service worker handles push messages properly
- [ ] Daily cron job triggers at 6 AM correctly
- [ ] Notification bell shows accurate count in header
- [ ] Real-time notification updates function properly
- [ ] Cross-browser compatibility maintained

---

## 🚀 Performance Testing Guidelines

### Lighthouse Audit (All Rounds)

```bash
# Run Lighthouse audit in Chrome DevTools:
# 1. Open DevTools → Lighthouse
# 2. Select "Mobile" device
# 3. Run audit for Performance, Accessibility, Best Practices, SEO

# Target scores:
# ✅ Performance: > 90
# ✅ Accessibility: > 95
# ✅ Best Practices: > 90
# ✅ SEO: > 90
```

### Bundle Size Analysis

```bash
# Analyze bundle size after builds:
npm run build

# Check bundle sizes:
ls -la .next/static/chunks/

# ✅ Main bundle should be reasonable (< 1MB)
# ✅ No unexpectedly large dependencies
# ✅ Code splitting working properly
```

### Memory Usage Test

```bash
# Chrome DevTools → Performance:
# 1. Record page interactions
# 2. Check for memory leaks
# 3. Monitor garbage collection

# ✅ Memory usage should be stable
# ✅ No significant memory leaks
# ✅ Garbage collection working properly
```

## 🔧 Debugging & Troubleshooting

### Common Issues and Solutions

#### Next.js Issues

```bash
# Build errors
rm -rf .next node_modules
npm install
npm run build

# TypeScript errors
npx tsc --noEmit --skipLibCheck

# Hydration errors
# Check for server/client differences
# Verify dynamic imports work correctly
```

#### Database Issues

```bash
# Connection issues
npx prisma db push
npx prisma generate

# Migration issues
npx prisma migrate reset
npx prisma migrate dev

# Data corruption
# Check Prisma Studio for data integrity
```

#### Authentication Issues

```bash
# Clerk configuration
# Verify environment variables
# Check Clerk dashboard settings
# Test in incognito mode

# Session issues
# Clear browser cookies
# Check token expiration
```

### Error Log Analysis

```bash
# Check logs for errors:
# 1. Browser console errors
# 2. Network tab for failed requests
# 3. Server logs in terminal
# 4. Vercel function logs (if deployed)

# Common error patterns:
# - CORS issues
# - Authentication failures
# - Database connection problems
# - Build/compilation errors
```

This comprehensive testing protocol ensures each round is thoroughly validated before proceeding to the next, maintaining high quality throughout the development process.
