-- CreateEnum
CREATE TYPE "reservation_status" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "source_type" AS ENUM ('ICAL', 'MANUAL');

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "ical_source_id" TEXT,
    "ical_uid" TEXT,
    "guest_name" TEXT NOT NULL,
    "check_in" TIMESTAMP(3) NOT NULL,
    "check_out" TIMESTAMP(3) NOT NULL,
    "status" "reservation_status" NOT NULL DEFAULT 'CONFIRMED',
    "source_type" "source_type" NOT NULL DEFAULT 'ICAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservations_property_id_idx" ON "reservations"("property_id");

-- CreateIndex
CREATE INDEX "reservations_organization_id_idx" ON "reservations"("organization_id");

-- CreateIndex
CREATE INDEX "reservations_check_in_check_out_idx" ON "reservations"("check_in", "check_out");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_ical_source_id_ical_uid_key" ON "reservations"("ical_source_id", "ical_uid");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
