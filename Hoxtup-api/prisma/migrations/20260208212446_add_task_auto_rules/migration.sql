-- CreateEnum
CREATE TYPE "trigger_type" AS ENUM ('BEFORE_ARRIVAL', 'AFTER_DEPARTURE', 'TURNOVER');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "auto_rule_id" TEXT;

-- CreateTable
CREATE TABLE "task_auto_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "trigger_type" "trigger_type" NOT NULL,
    "task_type" "task_type" NOT NULL DEFAULT 'CLEANING',
    "title_template" TEXT NOT NULL,
    "time_offset_hours" INTEGER NOT NULL DEFAULT 0,
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_auto_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_auto_rules_organization_id_idx" ON "task_auto_rules"("organization_id");

-- CreateIndex
CREATE INDEX "task_auto_rules_property_id_idx" ON "task_auto_rules"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_auto_rules_property_id_trigger_type_key" ON "task_auto_rules"("property_id", "trigger_type");

-- CreateIndex
CREATE INDEX "tasks_auto_rule_id_idx" ON "tasks"("auto_rule_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_auto_rule_id_fkey" FOREIGN KEY ("auto_rule_id") REFERENCES "task_auto_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_auto_rules" ADD CONSTRAINT "task_auto_rules_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
