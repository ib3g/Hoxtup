# Story 6.5: Asset & Consumable Visual Distinction

## Epic: 6 - Inventory & Cost Management

As an **owner or admin**,
I want consumables and assets displayed in clearly separate sections with distinct visual treatment,
So that I can quickly distinguish between recurring expenses (consumables) and one-time purchases (assets).

## Requirements Covered

- FR28: Visual distinction — consumables (recurring) and assets (one-time) displayed in separate sections with distinct icons and color coding

## Acceptance Criteria

**Given** I navigate to a property's Inventory page
**When** the page loads
**Then** I see two distinct sections: "Consommables" and "Actifs permanents"
**And** each section has its own header, icon, and visual treatment

**Given** the Consumables section
**When** items are displayed
**Then** they use a circular arrow icon (recurring) in teal `#2c4f5c`
**And** items show current quantity, threshold status, and consumption trend

**Given** the Assets section
**When** items are displayed
**Then** they use a tag/purchase icon (one-time) in terra cotta `#a06050`
**And** items show purchase date, cost, and category

**Given** the property inventory summary
**When** I view the top of the page
**Then** I see two summary cards side by side:
- Consumables: total items, items below threshold, monthly consumption cost
- Assets: total items, total investment, last purchase date

**Given** a global inventory view (across all properties)
**When** I access it from the main navigation
**Then** consumables and assets are separated with property groupings within each section
**And** I can filter by property using the PropertySelector

**Given** the inventory on mobile
**When** I view it
**Then** the two sections stack vertically (consumables first, then assets)
**And** each section is collapsible with a tap on the header

## Technical Notes

- UI: two distinct Card components with different accent colors
- Consumable card: teal accent, circular arrow icon, quantity + threshold bar
- Asset card: terra cotta accent, tag icon, cost + date display
- Summary endpoint: `GET /api/v1/properties/:id/inventory/summary`
- Global view: `GET /api/v1/inventory?groupBy=property`
- Collapsible sections: shadcn/ui Collapsible component
