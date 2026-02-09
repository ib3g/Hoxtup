# Story 6.6: Per-Property Financial Reporting

## Epic: 6 - Inventory & Cost Management

As an **owner or admin**,
I want to see comprehensive cost-per-property reports combining consumable usage and asset purchases,
So that I know exactly how much each property costs me and can make informed business decisions.

## Requirements Covered

- FR27: Asset cost integration in per-property financial reports
- FR30: Per-property financial reporting (consumables + assets)
- FR31: Light accounting (revenue tracking, expense tracking, cost-per-property views)

## Acceptance Criteria

**Given** I navigate to Financial Reports for a property
**When** the report loads
**Then** I see a cost breakdown with: consumable costs (period), asset costs (period), total costs
**And** the period is selectable: this month, last month, custom range
**And** all amounts display in org currency (EUR or MAD) with proper formatting

**Given** the consumable costs section
**When** I view it
**Then** I see: total consumable spend, top items by cost, consumption trend (chart)
**And** costs are calculated from StockMovement entries with cost data

**Given** the asset costs section
**When** I view it
**Then** I see: total asset investment, recent purchases, cost by category (pie/bar chart)
**And** costs include only assets purchased within the selected period

**Given** the revenue tracking
**When** I add revenue entries
**Then** I can manually enter: amount, date, source (Airbnb, Booking, Direct), notes
**And** revenue is stored as integer centimes with org currency

**Given** the cost-per-property view
**When** I view the organization-wide financial summary
**Then** I see all properties compared: revenue, expenses, profit/loss per property
**And** properties are sortable by any column
**And** a summary row shows organization totals

**Given** I want to view historical data for an archived property
**When** I access its financial reports
**Then** all historical cost data is still available
**And** the property is marked as archived in the report

**Given** the financial report on mobile
**When** I view it
**Then** the report uses compact card layouts with expandable sections
**And** charts are responsive and touch-friendly

**Given** the financial reports
**When** data is displayed
**Then** all amounts use the org's currency formatting utilities from Story 1.7
**And** negative values (losses) are shown in red `#C45B4A`
**And** positive values (profits) are shown in green `#2D8A6E`

## Technical Notes

- API endpoints:
  - `GET /api/v1/properties/:id/financials?start=DATE&end=DATE` — property financial report
  - `GET /api/v1/financials/summary?start=DATE&end=DATE` — org-wide summary
  - `POST /api/v1/properties/:id/revenue` — add revenue entry
  - `GET /api/v1/properties/:id/revenue` — list revenue entries
- Prisma model: `Revenue` with `organization_id`, `property_id`, `amount_centimes`, `date`, `source`, `notes`
- Revenue sources enum: `AIRBNB`, `BOOKING`, `DIRECT`, `OTHER`
- Cost aggregation: SQL queries joining StockMovement (consumables) + Asset (assets) by property and date range
- Charts: lightweight chart library (e.g., recharts) for consumption trends and category breakdown
- Caching: Redis cache for financial summaries (5min TTL)
- P95 latency target: < 800ms for analytics queries (NFR3)
