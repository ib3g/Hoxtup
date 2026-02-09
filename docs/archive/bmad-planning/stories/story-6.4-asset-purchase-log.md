# Story 6.4: Permanent Asset Purchase Log

## Epic: 6 - Inventory & Cost Management

As an **owner or admin**,
I want to log permanent asset purchases per property (linens, furniture, appliances),
So that I can track what I own, where it is, and how much it cost.

## Requirements Covered

- FR24: Permanent asset purchase log
- FR25: Asset data model (name, property, purchase date, cost, supplier, category)
- FR26: No rotation/cycle tracking in MVP (logged once at purchase)

## Acceptance Criteria

**Given** I navigate to Assets for a property
**When** the page loads
**Then** I see a list of all permanent assets with: name, category, purchase date, cost, supplier

**Given** I click "Add Asset"
**When** I fill in the form
**Then** required fields are: name, category, purchase date, cost
**And** optional fields are: supplier, notes
**And** the cost is entered in org currency and stored as integer centimes

**Given** the asset categories
**When** I select a category
**Then** available categories include: Linens, Furniture, Appliances, Electronics, Kitchenware, Outdoor, Other

**Given** I submit a new asset
**When** it is saved
**Then** the asset appears in the property's asset list
**And** the cost is immediately reflected in the property's financial reports

**Given** I want to edit an asset
**When** I modify the details
**Then** changes are saved with optimistic UI + undo toast

**Given** I want to remove an asset
**When** I click "Remove" and confirm
**Then** the asset is soft-deleted
**And** its cost is preserved in historical financial reports

**Given** the asset list on mobile
**When** I view it
**Then** assets display as compact cards grouped by category
**And** total cost per category is shown as a summary

**Given** there is no rotation tracking in MVP
**When** an asset is logged
**Then** it is logged once at purchase time
**And** no lifecycle, maintenance schedule, or replacement tracking exists

## Technical Notes

- Prisma model: `Asset` with `organization_id`, `property_id`, `name`, `category`, `purchase_date`, `cost_centimes`, `supplier`, `notes`, `deleted_at`
- Categories enum: `LINENS`, `FURNITURE`, `APPLIANCES`, `ELECTRONICS`, `KITCHENWARE`, `OUTDOOR`, `OTHER`
- API endpoints:
  - `GET /api/v1/properties/:id/assets` — list assets
  - `POST /api/v1/assets` — create asset
  - `PATCH /api/v1/assets/:id` — update asset
  - `DELETE /api/v1/assets/:id` — soft-delete
- Cost stored as integer centimes, displayed with org currency formatting
- No depreciation or lifecycle tracking (MVP scope)
