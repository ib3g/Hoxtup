-- CreateTable
CREATE TABLE "team_audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "target_id" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_audit_logs_actor_id_idx" ON "team_audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "team_audit_logs_target_id_idx" ON "team_audit_logs"("target_id");

-- CreateIndex
CREATE INDEX "team_audit_logs_created_at_idx" ON "team_audit_logs"("created_at");
