-- CreateEnum
CREATE TYPE "role" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "invitation_status" AS ENUM ('PENDING', 'ACTIVE', 'DECLINED', 'REMOVED');

-- CreateEnum
CREATE TYPE "animal_type" AS ENUM ('BUFFALO', 'CHICKEN', 'COW', 'PIG', 'HORSE');

-- CreateEnum
CREATE TYPE "sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "animal_status" AS ENUM ('ACTIVE', 'SOLD', 'DECEASED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "activity_status" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('REMINDER', 'SYSTEM', 'ACTIVITY_UPDATE');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerk_user_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "farm_name" TEXT NOT NULL DEFAULT 'ฟาร์มของฉัน',
    "province" TEXT NOT NULL DEFAULT 'ไม่ระบุ',
    "farm_code" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "farm_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "role" NOT NULL,
    "invitation_status" "invitation_status" NOT NULL DEFAULT 'ACTIVE',
    "invited_by" UUID,
    "invited_at" TIMESTAMPTZ(6),
    "responded_at" TIMESTAMPTZ(6),
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farm_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "farm_id" UUID NOT NULL,
    "animal_id" TEXT NOT NULL,
    "animal_type" "animal_type" NOT NULL,
    "name" TEXT NOT NULL,
    "sex" "sex",
    "birth_date" DATE,
    "color" TEXT,
    "weight_kg" INTEGER,
    "height_cm" INTEGER,
    "mother_name" TEXT,
    "father_name" TEXT,
    "image_url" TEXT,
    "status" "animal_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "animal_id" UUID NOT NULL,
    "farm_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activity_date" DATE NOT NULL,
    "reminder_date" DATE,
    "status" "activity_status" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMPTZ(6),
    "completed_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_reminders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "farm_id" UUID NOT NULL,
    "reminder_date" DATE NOT NULL,
    "reminder_time" TIME(6) NOT NULL DEFAULT '06:00:00'::time,
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMPTZ(6),
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_pattern" TEXT,
    "next_reminder_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "farm_id" UUID NOT NULL,
    "activity_id" UUID,
    "notification_type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "push_sent" BOOLEAN NOT NULL DEFAULT false,
    "push_sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh_key" TEXT NOT NULL,
    "auth_key" TEXT NOT NULL,
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_clerk_user_id_key" ON "profiles"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_phone_number_key" ON "profiles"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "farms_farm_code_key" ON "farms"("farm_code");

-- CreateIndex
CREATE UNIQUE INDEX "farm_members_user_id_role_key" ON "farm_members"("user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "animals_farm_id_animal_id_key" ON "animals"("farm_id", "animal_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_user_id_endpoint_key" ON "push_subscriptions"("user_id", "endpoint");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_members" ADD CONSTRAINT "farm_members_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_members" ADD CONSTRAINT "farm_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_reminders" ADD CONSTRAINT "activity_reminders_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_reminders" ADD CONSTRAINT "activity_reminders_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
