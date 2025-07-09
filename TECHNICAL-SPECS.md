# TECHNICAL-SPECS.md

**Load for Rounds 2, 4, 8 (Database, API, Notifications)**

## 🗄️ Complete Prisma Schema

```prisma
// Farm Management System - Complete Database Schema
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User profile information (extends Clerk auth)
model Profile {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clerkUserId  String   @unique @map("clerk_user_id")
  phoneNumber  String   @unique @map("phone_number")
  firstName    String   @map("first_name")
  lastName     String   @map("last_name")
  avatarUrl    String?  @map("avatar_url")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  // Relations
  ownedFarms         Farm[]         @relation("FarmOwner")
  farmMemberships    FarmMember[]
  createdActivities  Activity[]     @relation("ActivityCreator")
  completedActivities Activity[]    @relation("ActivityCompleter")
  notifications      Notification[]
  pushSubscriptions  PushSubscription[]

  @@map("profiles")
}

// Farm information
model Farm {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  ownerId   String   @map("owner_id") @db.Uuid
  farmName  String   @default("ฟาร์มของฉัน") @map("farm_name")
  province  String   @default("ไม่ระบุ")
  farmCode  String?  @unique @map("farm_code")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  // Relations
  owner           Profile        @relation("FarmOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members         FarmMember[]
  animals         Animal[]
  activities      Activity[]
  activityReminders ActivityReminder[]
  notifications   Notification[]

  @@map("farms")
}

// Farm membership (owner + future member invitations)
model FarmMember {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  farmId           String    @map("farm_id") @db.Uuid
  userId           String    @map("user_id") @db.Uuid
  role             Role
  invitationStatus InvitationStatus @default(ACTIVE) @map("invitation_status")
  invitedBy        String?   @map("invited_by") @db.Uuid
  invitedAt        DateTime? @map("invited_at") @db.Timestamptz(6)
  respondedAt      DateTime? @map("responded_at") @db.Timestamptz(6)
  joinedAt         DateTime  @default(now()) @map("joined_at") @db.Timestamptz(6)

  // Relations
  farm    Farm    @relation(fields: [farmId], references: [id], onDelete: Cascade)
  user    Profile @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Constraints
  @@unique([userId, role])
  @@map("farm_members")
}

// Animal information (all types in one table)
model Animal {
  id         String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  farmId     String      @map("farm_id") @db.Uuid
  animalId   String      @map("animal_id") // User-defined or auto-generated
  animalType AnimalType  @map("animal_type")
  name       String
  sex        Sex?
  birthDate  DateTime?   @map("birth_date") @db.Date
  color      String?
  weightKg   Int?        @map("weight_kg") // Weight in kilograms (integer)
  heightCm   Int?        @map("height_cm") // Height in centimeters (integer)
  motherName String?     @map("mother_name") // Parent name (not linked)
  fatherName String?     @map("father_name") // Parent name (not linked)
  imageUrl   String?     @map("image_url")
  status     AnimalStatus @default(ACTIVE)
  createdAt  DateTime    @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt  DateTime    @updatedAt @map("updated_at") @db.Timestamptz(6)

  // Relations
  farm       Farm       @relation(fields: [farmId], references: [id], onDelete: Cascade)
  activities Activity[]

  // Constraints
  @@unique([farmId, animalId])
  @@map("animals")
}

// Activity/Task information
model Activity {
  id           String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  animalId     String         @map("animal_id") @db.Uuid
  farmId       String         @map("farm_id") @db.Uuid
  createdBy    String         @map("created_by") @db.Uuid
  title        String
  description  String?
  activityDate DateTime       @map("activity_date") @db.Date
  reminderDate DateTime?      @map("reminder_date") @db.Date // Optional reminder
  status       ActivityStatus @default(PENDING)
  completedAt  DateTime?      @map("completed_at") @db.Timestamptz(6)
  completedBy  String?        @map("completed_by") @db.Uuid
  createdAt    DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime       @updatedAt @map("updated_at") @db.Timestamptz(6)

  // Relations
  animal            Animal             @relation(fields: [animalId], references: [id], onDelete: Cascade)
  farm              Farm               @relation(fields: [farmId], references: [id], onDelete: Cascade)
  creator           Profile            @relation("ActivityCreator", fields: [createdBy], references: [id])
  completer         Profile?           @relation("ActivityCompleter", fields: [completedBy], references: [id])
  activityReminders ActivityReminder[]
  notifications     Notification[]

  @@map("activities")
}

// Reminder system (created automatically when activity has reminder_date)
model ActivityReminder {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  activityId       String    @map("activity_id") @db.Uuid
  farmId           String    @map("farm_id") @db.Uuid
  reminderDate     DateTime  @map("reminder_date") @db.Date
  reminderTime     DateTime  @default(dbgenerated("'06:00:00'::time")) @map("reminder_time") @db.Time(6)
  notificationSent Boolean   @default(false) @map("notification_sent")
  sentAt           DateTime? @map("sent_at") @db.Timestamptz(6)
  isRecurring      Boolean   @default(false) @map("is_recurring")
  recurrencePattern String? @map("recurrence_pattern") // 'daily', 'weekly', 'monthly'
  nextReminderDate DateTime? @map("next_reminder_date") @db.Date
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  // Relations
  activity Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  farm     Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)

  @@map("activity_reminders")
}

// Notification history
model Notification {
  id               String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId           String           @map("user_id") @db.Uuid
  farmId           String           @map("farm_id") @db.Uuid
  activityId       String?          @map("activity_id") @db.Uuid
  notificationType NotificationType @map("notification_type")
  title            String
  message          String
  isRead           Boolean          @default(false) @map("is_read")
  readAt           DateTime?        @map("read_at") @db.Timestamptz(6)
  pushSent         Boolean          @default(false) @map("push_sent")
  pushSentAt       DateTime?        @map("push_sent_at") @db.Timestamptz(6)
  createdAt        DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)

  // Relations
  user     Profile   @relation(fields: [userId], references: [id], onDelete: Cascade)
  farm     Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  activity Activity? @relation(fields: [activityId], references: [id], onDelete: SetNull)

  @@map("notifications")
}

// Push notification subscriptions
model PushSubscription {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String    @map("user_id") @db.Uuid
  endpoint    String
  p256dhKey   String    @map("p256dh_key")
  authKey     String    @map("auth_key")
  userAgent   String?   @map("user_agent")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  lastUsedAt  DateTime  @default(now()) @map("last_used_at") @db.Timestamptz(6)

  // Relations
  user Profile @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Constraints
  @@unique([userId, endpoint])
  @@map("push_subscriptions")
}

// Enums
enum Role {
  OWNER
  MEMBER
  @@map("role")
}

enum InvitationStatus {
  PENDING
  ACTIVE
  DECLINED
  REMOVED
  @@map("invitation_status")
}

enum AnimalType {
  BUFFALO
  CHICKEN
  COW
  PIG
  HORSE
  @@map("animal_type")
}

enum Sex {
  MALE
  FEMALE
  @@map("sex")
}

enum AnimalStatus {
  ACTIVE
  SOLD
  DECEASED
  TRANSFERRED
  @@map("animal_status")
}

enum ActivityStatus {
  PENDING
  COMPLETED
  CANCELLED
  OVERDUE
  @@map("activity_status")
}

enum NotificationType {
  REMINDER
  SYSTEM
  ACTIVITY_UPDATE
  @@map("notification_type")
}
```

## 🔧 Auto-Generated Animal ID Function

```sql
-- PostgreSQL function for generating animal IDs
CREATE OR REPLACE FUNCTION generate_animal_id(farm_uuid UUID, animal_type TEXT)
RETURNS TEXT AS $$
DECLARE
  type_code TEXT;
  date_part TEXT;
  sequence_num INTEGER;
  result TEXT;
BEGIN
  -- Get type code
  type_code := CASE animal_type
    WHEN 'BUFFALO' THEN 'BF'
    WHEN 'CHICKEN' THEN 'CK'
    WHEN 'COW' THEN 'CW'
    WHEN 'PIG' THEN 'PG'
    WHEN 'HORSE' THEN 'HR'
    ELSE 'AN'
  END;

  -- Get date part
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');

  -- Get next sequence number for this farm and date
  SELECT COALESCE(MAX(CAST(RIGHT(animal_id, 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM animals
  WHERE farm_id = farm_uuid
    AND animal_id LIKE type_code || date_part || '%';

  -- Format final ID
  result := type_code || date_part || LPAD(sequence_num::TEXT, 3, '0');

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

## 🚀 API Route Patterns

### `/api/farms/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId },
      include: {
        ownedFarms: {
          include: {
            animals: {
              select: { id: true, name: true, animalType: true },
            },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile.ownedFarms);
  } catch (error) {
    console.error("Farm API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { farmName, province } = await request.json();

    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const farm = await prisma.farm.create({
      data: {
        ownerId: profile.id,
        farmName,
        province,
        farmCode: `FM${Date.now()}`,
      },
    });

    // Create farm membership
    await prisma.farmMember.create({
      data: {
        farmId: farm.id,
        userId: profile.id,
        role: "OWNER",
      },
    });

    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    console.error("Create Farm Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### `/api/animals/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");
    const animalType = searchParams.get("type");

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause: any = {};
    if (farmId) whereClause.farmId = farmId;
    if (animalType) whereClause.animalType = animalType.toUpperCase();

    const animals = await prisma.animal.findMany({
      where: whereClause,
      include: {
        farm: { select: { farmName: true, province: true } },
        activities: {
          where: { status: "PENDING" },
          select: { id: true, title: true, reminderDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(animals);
  } catch (error) {
    console.error("Animals GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { farmId, animalType, name, animalId, ...rest } = body;

    // Auto-generate ID if not provided
    let finalAnimalId = animalId;
    if (!finalAnimalId) {
      const typeCode =
        {
          BUFFALO: "BF",
          CHICKEN: "CK",
          COW: "CW",
          PIG: "PG",
          HORSE: "HR",
        }[animalType] || "AN";

      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      const lastAnimal = await prisma.animal.findFirst({
        where: {
          farmId,
          animalId: { startsWith: `${typeCode}${datePart}` },
        },
        orderBy: { animalId: "desc" },
      });

      let sequence = 1;
      if (lastAnimal) {
        const lastSequence = parseInt(lastAnimal.animalId.slice(-3));
        sequence = lastSequence + 1;
      }

      finalAnimalId = `${typeCode}${datePart}${sequence
        .toString()
        .padStart(3, "0")}`;
    }

    const animal = await prisma.animal.create({
      data: {
        farmId,
        animalId: finalAnimalId,
        animalType,
        name,
        ...rest,
      },
      include: {
        farm: { select: { farmName: true } },
      },
    });

    return NextResponse.json(animal, { status: 201 });
  } catch (error) {
    console.error("Create Animal Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### `/api/activities/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { animalId, farmId, title, description, activityDate, reminderDate } =
      body;

    const activity = await prisma.activity.create({
      data: {
        animalId,
        farmId,
        createdBy: profile.id,
        title,
        description,
        activityDate: new Date(activityDate),
        reminderDate: reminderDate ? new Date(reminderDate) : null,
      },
      include: {
        animal: { select: { name: true, animalType: true } },
      },
    });

    // Create reminder if reminder date exists
    if (reminderDate) {
      await prisma.activityReminder.create({
        data: {
          activityId: activity.id,
          farmId: activity.farmId,
          reminderDate: new Date(reminderDate),
        },
      });
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Create Activity Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 📱 Push Notification System

### Service Worker (`public/sw.js`)

```javascript
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: data.icon || "/jaothui-logo.png",
      badge: "/badge-icon.png",
      tag: data.tag || "farm-reminder",
      data: data.data,
      actions: [
        {
          action: "view",
          title: "ดูรายละเอียด",
          icon: "/icons/view.png",
        },
        {
          action: "complete",
          title: "ทำเสร็จแล้ว",
          icon: "/icons/complete.png",
        },
      ],
      requireInteraction: true,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else if (event.action === "complete") {
    // Handle complete action
    fetch(`/api/activities/${event.notification.data.activityId}/complete`, {
      method: "PATCH",
    });
  } else {
    // Default click action
    event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
  }
});
```

### Push Notification Utility (`lib/push-notifications.ts`)

```typescript
import webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: any;
  tag?: string;
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error) {
    console.error("Push notification error:", error);
    return { success: false, error };
  }
}

export async function subscribeUser(
  subscription: PushSubscription,
  userId: string
) {
  try {
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dhKey: subscription.keys?.p256dh || "",
        authKey: subscription.keys?.auth || "",
        isActive: true,
        lastUsedAt: new Date(),
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys?.p256dh || "",
        authKey: subscription.keys?.auth || "",
        isActive: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Subscribe user error:", error);
    return { success: false, error };
  }
}
```

### Daily Cron Job (`app/api/cron/notifications/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push-notifications";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all reminders for today
    const reminders = await prisma.activityReminder.findMany({
      where: {
        reminderDate: today,
        notificationSent: false,
      },
      include: {
        activity: {
          include: {
            animal: { select: { name: true, animalType: true } },
            farm: {
              include: {
                owner: {
                  include: {
                    pushSubscriptions: {
                      where: { isActive: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    let notificationsSent = 0;

    for (const reminder of reminders) {
      const { activity } = reminder;
      const { animal, farm } = activity;

      // Create notification record
      await prisma.notification.create({
        data: {
          userId: farm.ownerId,
          farmId: farm.id,
          activityId: activity.id,
          notificationType: "REMINDER",
          title: "ฟาร์มแจ้งเตือน",
          message: `${animal.name}: ${activity.title}`,
          pushSent: true,
          pushSentAt: new Date(),
        },
      });

      // Send push notifications
      for (const subscription of farm.owner.pushSubscriptions) {
        await sendPushNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey,
            },
          },
          {
            title: "ฟาร์มแจ้งเตือน",
            body: `${animal.name}: ${activity.title}`,
            icon: "/jaothui-logo.png",
            data: {
              animalId: animal.id,
              activityId: activity.id,
              url: `/animals/${animal.id}`,
            },
            tag: `reminder-${reminder.id}`,
          }
        );
      }

      // Mark reminder as sent
      await prisma.activityReminder.update({
        where: { id: reminder.id },
        data: {
          notificationSent: true,
          sentAt: new Date(),
        },
      });

      notificationsSent++;
    }

    return NextResponse.json({
      success: true,
      notificationsSent,
      processedReminders: reminders.length,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 🔗 Useful Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Create and apply migration
npx prisma migrate dev --name init

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed
```

## 📊 Database Indexes for Performance

```sql
-- Additional indexes for better performance
CREATE INDEX idx_animals_farm_type ON animals(farm_id, animal_type);
CREATE INDEX idx_activities_reminder_date ON activities(reminder_date) WHERE reminder_date IS NOT NULL;
CREATE INDEX idx_activity_reminders_date_sent ON activity_reminders(reminder_date, notification_sent);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_push_subscriptions_user_active ON push_subscriptions(user_id, is_active);
```
