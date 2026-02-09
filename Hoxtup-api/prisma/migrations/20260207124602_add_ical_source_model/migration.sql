-- CreateTable
CREATE TABLE "ical_sources" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sync_interval_minutes" INTEGER NOT NULL DEFAULT 15,
    "last_sync_at" TIMESTAMP(3),
    "last_sync_status" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ical_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ical_sources_property_id_idx" ON "ical_sources"("property_id");

-- CreateIndex
CREATE INDEX "ical_sources_organization_id_idx" ON "ical_sources"("organization_id");

-- AddForeignKey
ALTER TABLE "ical_sources" ADD CONSTRAINT "ical_sources_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
