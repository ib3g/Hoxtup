/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,task_a_id,task_b_id]` on the table `fusion_pairs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,task_a_id,task_b_id]` on the table `fusion_rejections` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "fusion_pairs_task_a_id_task_b_id_key";

-- DropIndex
DROP INDEX "fusion_rejections_task_a_id_task_b_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "fusion_pairs_org_task_a_task_b_unique" ON "fusion_pairs"("organization_id", "task_a_id", "task_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "fusion_rejections_org_task_a_task_b_unique" ON "fusion_rejections"("organization_id", "task_a_id", "task_b_id");
