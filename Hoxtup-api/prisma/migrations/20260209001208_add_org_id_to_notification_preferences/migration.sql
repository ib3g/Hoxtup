/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,user_id,notification_type,channel]` on the table `notification_preferences` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `notification_preferences` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "notification_preferences_user_id_notification_type_channel_key";

-- AlterTable
ALTER TABLE "notification_preferences" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "notification_preferences_organization_id_idx" ON "notification_preferences"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_org_user_type_channel_unique" ON "notification_preferences"("organization_id", "user_id", "notification_type", "channel");

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
