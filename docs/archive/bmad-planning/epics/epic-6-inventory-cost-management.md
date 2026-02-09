# Epic 6: Inventory & Cost Management

Users can track consumable stock levels with automatic alerts, log permanent asset purchases, and see comprehensive per-property cost analysis — so they never run out of supplies and know exactly what each property costs.

**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR30, FR31

**NFRs addressed:** NFR7 (encryption for financial data), NFR13 (multi-currency in reports)

**Technical scope:**

- Consumable categories (Guest Kits, Cleaning Kits) with entries/exits tracking
- Configurable stock thresholds + automatic low-stock alerts
- Mobile feedback loop (staff adjust real consumption at task completion)
- Permanent asset purchase log (name, property, date, cost, supplier, category)
- Visual distinction: consumables (recurring) vs assets (one-time) with separate sections and icons
- Per-property financial reporting (consumable usage + asset purchases)
- Light accounting (revenue tracking, expense tracking, cost-per-property views)
- Money stored as integers (centimes) with org currency formatting

**Dependencies:** Epic 1 (auth, org, currency) + Epic 2 (properties). Enhanced by Epic 3 (Story 6.3 task completion integration) + Epic 4 (Story 6.2 notification integration)

## Stories

- [Story 6.1: Consumable Categories & Stock Tracking](../stories/story-6.1-consumable-stock-tracking.md)
- [Story 6.2: Stock Alerts & Threshold Management](../stories/story-6.2-stock-alerts-thresholds.md)
- [Story 6.3: Mobile Consumption Feedback](../stories/story-6.3-mobile-consumption-feedback.md)
- [Story 6.4: Permanent Asset Purchase Log](../stories/story-6.4-asset-purchase-log.md)
- [Story 6.5: Asset & Consumable Visual Distinction](../stories/story-6.5-asset-consumable-distinction.md)
- [Story 6.6: Per-Property Financial Reporting](../stories/story-6.6-financial-reporting.md)
