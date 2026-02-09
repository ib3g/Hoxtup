-- CreateEnum
CREATE TYPE "property_type" AS ENUM ('APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM', 'OTHER');

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "type" "property_type" NOT NULL DEFAULT 'APARTMENT',
    "color_index" INTEGER NOT NULL DEFAULT 0,
    "photo_url" TEXT,
    "notes" TEXT,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "properties_organization_id_idx" ON "properties"("organization_id");

-- CreateIndex
CREATE INDEX "properties_archived_at_idx" ON "properties"("archived_at");

-- AddForeignKey
ALTER TABLE "property_assignments" ADD CONSTRAINT "property_assignments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
