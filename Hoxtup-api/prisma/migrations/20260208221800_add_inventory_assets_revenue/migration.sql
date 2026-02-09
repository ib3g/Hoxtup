-- CreateEnum
CREATE TYPE "consumable_category" AS ENUM ('GUEST_KIT', 'CLEANING_KIT', 'OTHER');

-- CreateEnum
CREATE TYPE "movement_type" AS ENUM ('ENTRY', 'EXIT');

-- CreateEnum
CREATE TYPE "asset_category" AS ENUM ('LINENS', 'FURNITURE', 'APPLIANCES', 'ELECTRONICS', 'KITCHENWARE', 'OUTDOOR', 'OTHER');

-- CreateEnum
CREATE TYPE "revenue_source" AS ENUM ('AIRBNB', 'BOOKING', 'DIRECT', 'OTHER');

-- CreateTable
CREATE TABLE "consumable_items" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "consumable_category" NOT NULL DEFAULT 'OTHER',
    "unit" TEXT NOT NULL DEFAULT 'unité',
    "current_quantity" INTEGER NOT NULL DEFAULT 0,
    "threshold" INTEGER NOT NULL DEFAULT 5,
    "cost_per_unit" INTEGER,
    "estimated_per_reservation" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumable_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "type" "movement_type" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cost_centimes" INTEGER,
    "reason" TEXT,
    "note" TEXT,
    "task_id" TEXT,
    "recorded_by_id" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "asset_category" NOT NULL DEFAULT 'OTHER',
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "cost_centimes" INTEGER NOT NULL,
    "supplier" TEXT,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenues" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "amount_centimes" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "source" "revenue_source" NOT NULL DEFAULT 'OTHER',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consumable_items_organization_id_idx" ON "consumable_items"("organization_id");

-- CreateIndex
CREATE INDEX "consumable_items_property_id_idx" ON "consumable_items"("property_id");

-- CreateIndex
CREATE INDEX "stock_movements_item_id_idx" ON "stock_movements"("item_id");

-- CreateIndex
CREATE INDEX "stock_movements_recorded_at_idx" ON "stock_movements"("recorded_at");

-- CreateIndex
CREATE INDEX "stock_movements_task_id_idx" ON "stock_movements"("task_id");

-- CreateIndex
CREATE INDEX "assets_organization_id_idx" ON "assets"("organization_id");

-- CreateIndex
CREATE INDEX "assets_property_id_idx" ON "assets"("property_id");

-- CreateIndex
CREATE INDEX "assets_category_idx" ON "assets"("category");

-- CreateIndex
CREATE INDEX "revenues_organization_id_idx" ON "revenues"("organization_id");

-- CreateIndex
CREATE INDEX "revenues_property_id_idx" ON "revenues"("property_id");

-- CreateIndex
CREATE INDEX "revenues_date_idx" ON "revenues"("date");

-- AddForeignKey
ALTER TABLE "consumable_items" ADD CONSTRAINT "consumable_items_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "consumable_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
