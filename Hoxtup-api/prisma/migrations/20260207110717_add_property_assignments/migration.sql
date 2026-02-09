-- CreateTable
CREATE TABLE "property_assignments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_assignments_user_id_idx" ON "property_assignments"("user_id");

-- CreateIndex
CREATE INDEX "property_assignments_property_id_idx" ON "property_assignments"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_assignments_user_id_property_id_key" ON "property_assignments"("user_id", "property_id");
