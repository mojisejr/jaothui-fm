# Farm Management System - Vercel Deployment Guide

## 🚀 Complete Deployment Guide for Production

ระบบบริหารจัดการฟาร์มพร้อม notification system ที่สมบูรณ์ - คู่มือการ deploy บน Vercel แบบละเอียด

---

## 📋 Pre-Deployment Checklist

### ✅ Prerequisites ที่จำเป็น:

- [ ] Node.js 18+ installed
- [ ] Git repository ready
- [ ] Vercel account created
- [ ] Supabase project setup
- [ ] Clerk account setup  
- [ ] VAPID keys generated

### ✅ Required Services:

1. **Vercel Account**: [vercel.com](https://vercel.com)
2. **Supabase Project**: [supabase.com](https://supabase.com)
3. **Clerk Authentication**: [clerk.com](https://clerk.com)
4. **VAPID Keys**: For web push notifications

---

## 🔧 Step 1: Environment Variables Setup

### 1.1 Required Environment Variables

สร้างไฟล์ `.env.local` หรือ configure ใน Vercel dashboard:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Supabase Database (Required)
DATABASE_URL=postgresql://postgres:password@host:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:password@host:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Web Push Notifications (Required for Round 8)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your-email@example.com
CRON_SECRET=your_secure_random_secret_for_cron_jobs

# Application URL (Required)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 1.2 How to Get Each Variable:

#### Clerk Variables:
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "API Keys" section
4. Copy `Publishable key` and `Secret key`

#### Supabase Variables:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Settings" > "Database"
4. Copy connection strings and URLs
5. Go to "Settings" > "API" for anon key

#### VAPID Keys (for Push Notifications):
```bash
# Generate VAPID keys using web-push library
npx web-push generate-vapid-keys

# Output example:
# Public Key: BD06jvT80YQgsjqG9xLY2CyRMM6VqktwP25HlckGddOKi03n80OdpwreN7xKbUakDVgUadR2IDVkaLKrmZjW7ig
# Private Key: ZFbC3MxNSsJcMlac9oYbJ0d_EwIppeUTiELiwG4B6UQ
```

#### CRON Secret:
```bash
# Generate secure random string
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🌐 Step 2: Vercel Project Setup

### 2.1 Connect Repository to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /path/to/jaothui-fm
vercel

# Follow the prompts:
# ? Set up and deploy "~/jaothui-fm"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Username]
# ? Link to existing project? [y/N] n
# ? What's your project's name? jaothui-fm
# ? In which directory is your code located? ./
```

#### Option B: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.2 Configure Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add all variables from Step 1.1:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...
CLERK_SECRET_KEY = sk_test_...
DATABASE_URL = postgresql://...
DIRECT_URL = postgresql://...
NEXT_PUBLIC_SUPABASE_URL = https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
NEXT_PUBLIC_VAPID_PUBLIC_KEY = BD06...
VAPID_PRIVATE_KEY = ZFbC...
VAPID_EMAIL = your-email@example.com
CRON_SECRET = kE7tPxzy...
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
```

**Important**: Set environment for `Production`, `Preview`, and `Development`

---

## 🗄️ Step 3: Database Setup and Migration

### 3.1 Verify Database Connection

```bash
# Test database connection locally first
npm run build
npx prisma db push

# Check if all tables are created
npx prisma studio
```

### 3.2 Production Database Migration

```bash
# Generate Prisma client for production
npx prisma generate

# Push schema to production database
npx prisma db push

# Verify migration success
npx prisma db pull
```

### 3.3 Database Indexes (Performance Optimization)

Execute these SQL commands in Supabase SQL Editor:

```sql
-- Performance indexes for production
CREATE INDEX IF NOT EXISTS idx_animals_farm_type ON animals(farm_id, animal_type);
CREATE INDEX IF NOT EXISTS idx_activities_reminder_date ON activities(reminder_date) WHERE reminder_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_reminders_date_sent ON activity_reminders(reminder_date, notification_sent);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active ON push_subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_activities_animal_date ON activities(animal_id, activity_date DESC);
```

---

## 🔐 Step 4: Authentication Configuration

### 4.1 Update Clerk Settings

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "Domains" section
4. Add your Vercel domain:
   ```
   https://your-project-name.vercel.app
   https://your-custom-domain.com (if applicable)
   ```

### 4.2 Configure Allowed Origins

In Clerk Dashboard > "Restrictions":
```
Allowed origins:
- https://your-project-name.vercel.app
- https://your-custom-domain.com
```

### 4.3 Update Redirect URLs

```
Sign-in URL: https://your-domain.vercel.app/sign-in
Sign-up URL: https://your-domain.vercel.app/sign-up
After sign-in URL: https://your-domain.vercel.app/dashboard
After sign-up URL: https://your-domain.vercel.app/profile/complete
```

---

## 🔔 Step 5: Notification System Configuration

### 5.1 Verify Cron Job Setup

Ensure `vercel.json` exists in project root:

```json
{
  "functions": {
    "app/api/cron/reminders/route.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 6 * * *"
    }
  ]
}
```

### 5.2 Test Cron Job Endpoint

```bash
# Test cron endpoint (replace with your domain and CRON_SECRET)
curl -X GET "https://your-domain.vercel.app/api/cron/reminders" \
  -H "Authorization: Bearer your_cron_secret"
```

### 5.3 Verify Service Worker

1. Deploy project
2. Visit your site
3. Check browser DevTools > Application > Service Workers
4. Verify `service-worker.js` is registered

---

## 🚀 Step 6: Deploy and Verify

### 6.1 Initial Deployment

```bash
# Deploy with Vercel CLI
vercel --prod

# Or push to main branch (if auto-deployment is enabled)
git push origin main
```

### 6.2 Deployment Verification Checklist

#### ✅ Basic Functionality:
- [ ] Homepage loads correctly
- [ ] Authentication flow works (sign-in/sign-up)
- [ ] Profile completion flow works
- [ ] Dashboard loads with user data
- [ ] Database connections work

#### ✅ Animal Management:
- [ ] Animal list page loads
- [ ] Animal detail pages work
- [ ] Add/Edit animal forms function
- [ ] Animal ID generation works

#### ✅ Activity Management:
- [ ] Activity list and creation work
- [ ] Activity history displays correctly
- [ ] Status updates function
- [ ] Animal-specific activity pages work

#### ✅ Notification System:
- [ ] Notification bell appears in header
- [ ] Push notification permission request works
- [ ] Service worker registers successfully
- [ ] Test notifications work
- [ ] Cron job endpoint responds correctly

### 6.3 Post-Deployment Testing

```bash
# Test key endpoints
curl https://your-domain.vercel.app/api/farms
curl https://your-domain.vercel.app/api/animals
curl https://your-domain.vercel.app/api/activities
curl https://your-domain.vercel.app/api/notifications

# Test cron job (with proper authorization)
curl -X GET "https://your-domain.vercel.app/api/cron/reminders" \
  -H "Authorization: Bearer your_cron_secret"
```

---

## 🔧 Step 7: Custom Domain Setup (Optional)

### 7.1 Add Custom Domain in Vercel

1. Go to Vercel Dashboard > Your Project
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 7.2 Update Environment Variables

```env
# Update app URL to custom domain
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
```

### 7.3 Update Clerk Settings

Add custom domain to Clerk Dashboard > Domains section.

---

## 🔍 Step 8: Monitoring and Troubleshooting

### 8.1 Vercel Logs

```bash
# View deployment logs
vercel logs your-deployment-url

# View function logs
vercel logs --follow
```

### 8.2 Common Issues and Solutions

#### Issue 1: Database Connection Errors
```
Solution:
- Verify DATABASE_URL and DIRECT_URL
- Check Supabase project is active
- Ensure connection pooling is enabled
```

#### Issue 2: Authentication Redirect Loops
```
Solution:
- Verify Clerk domain settings
- Check redirect URLs configuration
- Ensure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is correct
```

#### Issue 3: Push Notifications Not Working
```
Solution:
- Verify VAPID keys are correct
- Check service worker registration
- Ensure HTTPS is enabled
- Test notification permissions
```

#### Issue 4: Cron Jobs Not Triggering
```
Solution:
- Verify vercel.json cron configuration
- Check CRON_SECRET environment variable
- Ensure function timeout is sufficient (60s)
- Check Vercel function logs
```

### 8.3 Performance Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Core Web Vitals**: Monitor in Vercel dashboard
3. **Function Performance**: Check function logs for execution times
4. **Database Performance**: Monitor Supabase dashboard

---

## ⚡ Step 9: Performance Optimization

### 9.1 Vercel Configuration

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['images.unsplash.com'], // Add any external image domains
  },
  // Enable compression
  compress: true,
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  }
}

module.exports = nextConfig
```

### 9.2 Database Connection Optimization

Update `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 🛡️ Step 10: Security Considerations

### 10.1 Environment Variables Security

- ✅ Never commit `.env` files to Git
- ✅ Use different secrets for development/production
- ✅ Rotate CRON_SECRET periodically
- ✅ Keep VAPID keys secure

### 10.2 Vercel Security Headers

Add to `next.config.js`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

---

## 📱 Step 11: Mobile PWA Configuration

### 11.1 Web App Manifest

Create `public/manifest.json`:

```json
{
  "name": "ระบบจัดการฟาร์ม JAOTHUI",
  "short_name": "JAOTHUI Farm",
  "description": "ระบบบริหารจัดการฟาร์มสัตว์ พร้อมการแจ้งเตือน",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f39c12",
  "icons": [
    {
      "src": "/jaothui-logo.png",
      "sizes": "120x120",
      "type": "image/png"
    }
  ]
}
```

### 11.2 Update Layout for PWA

Add to `app/layout.tsx`:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f39c12" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JAOTHUI Farm" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## 🎯 Final Verification Checklist

### ✅ Production Readiness:

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Authentication working with production URLs
- [ ] Push notifications functioning
- [ ] Cron jobs scheduled and working
- [ ] Service worker registered
- [ ] Mobile responsive design verified
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Error monitoring setup

### ✅ User Flow Testing:

1. **Registration Flow**:
   - [ ] New user signup
   - [ ] Profile completion
   - [ ] Success page redirect

2. **Authentication Flow**:
   - [ ] Login/logout
   - [ ] LINE login integration
   - [ ] Protected routes

3. **Animal Management**:
   - [ ] Add/edit/view animals
   - [ ] Auto-generated IDs
   - [ ] Image uploads (if implemented)

4. **Activity Management**:
   - [ ] Create activities with reminders
   - [ ] Activity status updates
   - [ ] Activity history

5. **Notification System**:
   - [ ] Push notification subscription
   - [ ] Test notifications
   - [ ] Daily reminder processing

---

## 🚀 Deployment Success!

คุณได้ deploy ระบบ Farm Management System สำเร็จแล้ว! 

### 📊 ผลลัพธ์ที่ได้:
- ✅ ระบบจัดการฟาร์มแบบ full-stack
- ✅ Authentication ด้วย Clerk + LINE login  
- ✅ Database ด้วย Supabase + Prisma
- ✅ Real-time notifications ด้วย Web Push
- ✅ Daily cron jobs สำหรับการแจ้งเตือน
- ✅ Mobile-first responsive design
- ✅ Production-ready deployment บน Vercel

### 🎯 Next Steps:
1. ทดสอบระบบอย่างละเอียด
2. เพิ่ม custom domain (ถ้าต้องการ)
3. Setup monitoring และ analytics
4. เพิ่มฟีเจอร์เพิ่มเติมตามความต้องการ

**ระบบพร้อมใช้งานแล้ว!** 🎉

---

**Created**: 2025-07-12  
**Last Updated**: 2025-07-12  
**Version**: Production Ready v1.0  
**Status**: ✅ Complete Deployment Guide