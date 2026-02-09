-- CreateEnum
CREATE TYPE "task_type" AS ENUM ('CLEANING', 'MAINTENANCE', 'INSPECTION', 'CHECK_IN', 'CHECK_OUT', 'TURNOVER', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "task_status" ADD VALUE 'INCIDENT';
ALTER TYPE "task_status" ADD VALUE 'FUSION_SUGGESTED';

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "assigned_user_id" TEXT,
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration_minutes" INTEGER,
ADD COLUMN     "started_at" TIMESTAMP(3),
ADD COLUMN     "type" "task_type" NOT NULL DEFAULT 'OTHER';

-- CreateTable
CREATE TABLE "task_history" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "from_status" "task_status" NOT NULL,
    "to_status" "task_status" NOT NULL,
    "actor_id" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_history_task_id_idx" ON "task_history"("task_id");

-- CreateIndex
CREATE INDEX "task_history_actor_id_idx" ON "task_history"("actor_id");

-- CreateIndex
CREATE INDEX "task_history_created_at_idx" ON "task_history"("created_at");

-- CreateIndex
CREATE INDEX "tasks_assigned_user_id_idx" ON "tasks"("assigned_user_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
