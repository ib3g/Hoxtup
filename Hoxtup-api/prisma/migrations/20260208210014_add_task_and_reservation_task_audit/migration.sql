-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('PENDING_VALIDATION', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "reservation_id" TEXT,
    "title" TEXT NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'PENDING_VALIDATION',
    "scheduled_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_task_audits" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_check_in" TIMESTAMP(3),
    "old_check_out" TIMESTAMP(3),
    "new_check_in" TIMESTAMP(3),
    "new_check_out" TIMESTAMP(3),
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_task_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_organization_id_idx" ON "tasks"("organization_id");

-- CreateIndex
CREATE INDEX "tasks_property_id_idx" ON "tasks"("property_id");

-- CreateIndex
CREATE INDEX "tasks_reservation_id_idx" ON "tasks"("reservation_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "reservation_task_audits_reservation_id_idx" ON "reservation_task_audits"("reservation_id");

-- CreateIndex
CREATE INDEX "reservation_task_audits_task_id_idx" ON "reservation_task_audits"("task_id");

-- CreateIndex
CREATE INDEX "reservation_task_audits_created_at_idx" ON "reservation_task_audits"("created_at");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
