/*
  Warnings:

  - You are about to drop the column `createdAt` on the `PushSubscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."PushSubscription" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "device_id" TEXT,
ADD COLUMN     "device_name" TEXT,
ADD COLUMN     "is_active" BOOLEAN DEFAULT true,
ADD COLUMN     "last_used" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_agent" TEXT,
ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "keys_p256dh" DROP NOT NULL,
ALTER COLUMN "keys_auth" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "PushSubscription_device_id_idx" ON "public"."PushSubscription"("device_id");

-- CreateIndex
CREATE INDEX "PushSubscription_user_id_idx" ON "public"."PushSubscription"("user_id");

-- CreateIndex
CREATE INDEX "PushSubscription_is_active_idx" ON "public"."PushSubscription"("is_active");
