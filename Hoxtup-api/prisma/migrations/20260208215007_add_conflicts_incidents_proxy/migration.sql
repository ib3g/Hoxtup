-- CreateEnum
CREATE TYPE "incident_type" AS ENUM ('EQUIPMENT', 'STOCK', 'CLEANLINESS', 'OTHER');

-- AlterTable
ALTER TABLE "task_history" ADD COLUMN     "is_proxy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "on_behalf_of_id" TEXT;

-- CreateTable
CREATE TABLE "task_conflicts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "task_a_id" TEXT NOT NULL,
    "task_b_id" TEXT NOT NULL,
    "conflict_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'detected',
    "acknowledged_at" TIMESTAMP(3),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "type" "incident_type" NOT NULL,
    "photo_url" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "resolved_by_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_conflicts_organization_id_idx" ON "task_conflicts"("organization_id");

-- CreateIndex
CREATE INDEX "task_conflicts_status_idx" ON "task_conflicts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "task_conflicts_task_a_id_task_b_id_key" ON "task_conflicts"("task_a_id", "task_b_id");

-- CreateIndex
CREATE INDEX "incidents_organization_id_idx" ON "incidents"("organization_id");

-- CreateIndex
CREATE INDEX "incidents_task_id_idx" ON "incidents"("task_id");

-- CreateIndex
CREATE INDEX "incidents_reporter_id_idx" ON "incidents"("reporter_id");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");
