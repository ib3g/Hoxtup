/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,task_a_id,task_b_id]` on the table `task_conflicts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "task_conflicts_task_a_id_task_b_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "task_conflicts_org_task_a_task_b_unique" ON "task_conflicts"("organization_id", "task_a_id", "task_b_id");
