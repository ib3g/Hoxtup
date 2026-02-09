/*
  Warnings:

  - Added the required column `organization_id` to the `fusion_rejections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `property_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `reservation_task_audits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `task_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `team_audit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fusion_rejections" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "property_assignments" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reservation_task_audits" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "task_history" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "team_audit_logs" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "fusion_rejections_organization_id_idx" ON "fusion_rejections"("organization_id");

-- CreateIndex
CREATE INDEX "property_assignments_organization_id_idx" ON "property_assignments"("organization_id");

-- CreateIndex
CREATE INDEX "reservation_task_audits_organization_id_idx" ON "reservation_task_audits"("organization_id");

-- CreateIndex
CREATE INDEX "stock_movements_organization_id_idx" ON "stock_movements"("organization_id");

-- CreateIndex
CREATE INDEX "task_history_organization_id_idx" ON "task_history"("organization_id");

-- CreateIndex
CREATE INDEX "team_audit_logs_organization_id_idx" ON "team_audit_logs"("organization_id");

-- AddForeignKey
ALTER TABLE "team_audit_logs" ADD CONSTRAINT "team_audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS on all tenant-scoped tables
ALTER TABLE "member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "property_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ical_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reservation_task_audits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_conflicts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "incidents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fusion_pairs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fusion_rejections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_auto_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consumable_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "revenues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DO $$
DECLARE
    table_name TEXT;
    tables TEXT[] := ARRAY[
        'member', 'property_assignments', 'team_audit_logs', 'properties', 
        'reservations', 'ical_sources', 'tasks', 'task_history', 
        'reservation_task_audits', 'task_conflicts', 'incidents', 
        'fusion_pairs', 'fusion_rejections', 'task_auto_rules', 
        'notifications', 'consumable_items', 'stock_movements', 
        'assets', 'revenues', 'subscriptions'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables LOOP
        EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (organization_id::text = current_setting(''app.tenant_id'', TRUE))', table_name);
    END LOOP;
END
$$;
