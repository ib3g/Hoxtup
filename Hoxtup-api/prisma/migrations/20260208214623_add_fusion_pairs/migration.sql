-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "fusion_pair_id" TEXT;

-- CreateTable
CREATE TABLE "fusion_pairs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "task_a_id" TEXT NOT NULL,
    "task_b_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "merged_task_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "fusion_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fusion_rejections" (
    "id" TEXT NOT NULL,
    "task_a_id" TEXT NOT NULL,
    "task_b_id" TEXT NOT NULL,
    "rejected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fusion_rejections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fusion_pairs_organization_id_idx" ON "fusion_pairs"("organization_id");

-- CreateIndex
CREATE INDEX "fusion_pairs_status_idx" ON "fusion_pairs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fusion_pairs_task_a_id_task_b_id_key" ON "fusion_pairs"("task_a_id", "task_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "fusion_rejections_task_a_id_task_b_id_key" ON "fusion_rejections"("task_a_id", "task_b_id");

-- CreateIndex
CREATE INDEX "tasks_fusion_pair_id_idx" ON "tasks"("fusion_pair_id");
