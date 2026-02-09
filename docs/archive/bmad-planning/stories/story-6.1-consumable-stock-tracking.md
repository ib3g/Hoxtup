# Story 6.1: Consumable Categories & Stock Tracking

## Epic: 6 - Inventory & Cost Management

As an **owner or admin**,
I want to define consumable categories and track stock entries and exits per property,
So that I know exactly what supplies I have and where they are.

## Requirements Covered

- FR21: Consumable tracking (managed categories — Guest Kits, Cleaning Kits; entries/exits; thresholds)

## Acceptance Criteria

**Given** I navigate to Inventory for a property
**When** the page loads
**Then** I see consumable categories (Guest Kits, Cleaning Kits) with current stock levels per item
**And** each item shows: name, current quantity, unit, threshold level, last updated date

**Given** I want to add a new consumable item
**When** I click "Add Item"
**Then** I see a form with: name (required), category (required), unit (e.g., piece, liter), initial quantity, threshold level, property
**And** the item is created and appears in the inventory list

**Given** I receive new stock (purchase or restocking)
**When** I record an entry
**Then** I enter: quantity added, date, cost (optional), supplier (optional), note (optional)
**And** the current stock level increases by the entered quantity
**And** the cost is stored in centimes (integer) with org currency

**Given** stock is consumed (used during task execution or waste)
**When** I record an exit
**Then** I enter: quantity removed, date, reason (consumption/waste/other), note (optional)
**And** the current stock level decreases by the entered quantity

**Given** the inventory list
**When** items are displayed
**Then** items below their threshold are highlighted with amber `#E6A347` background
**And** items at zero are highlighted with red `#C45B4A` background
**And** healthy stock levels show green `#2D8A6E` indicator

**Given** I am a Manager
**When** I access Inventory
**Then** I see stock for my assigned properties only
**And** I can record entries and exits but not create new categories

**Given** the inventory on mobile
**When** I view it
**Then** items are displayed as compact cards with visual stock level indicators
**And** entry/exit forms open as bottom sheets

## Technical Notes

- Prisma models:
  - `ConsumableItem`: `organization_id`, `property_id`, `name`, `category`, `unit`, `current_quantity`, `threshold`, `cost_per_unit`
  - `StockMovement`: `item_id`, `type` (entry/exit), `quantity`, `cost_centimes`, `reason`, `note`, `recorded_by_id`, `recorded_at`
- Categories enum: `GUEST_KIT`, `CLEANING_KIT`, `OTHER`
- Stock level: computed from sum of movements (or denormalized `current_quantity` updated on each movement)
- API endpoints:
  - `GET /api/v1/properties/:id/inventory` — list items with current stock
  - `POST /api/v1/inventory/items` — create item
  - `POST /api/v1/inventory/items/:id/movements` — record entry/exit
