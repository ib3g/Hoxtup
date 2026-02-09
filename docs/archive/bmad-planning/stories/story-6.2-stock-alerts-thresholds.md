# Story 6.2: Stock Alerts & Threshold Management

## Epic: 6 - Inventory & Cost Management

As an **owner or admin**,
I want automatic alerts when stock falls below configurable thresholds,
So that I can restock before running out, especially before upcoming bookings.

## Requirements Covered

- FR23: Stock alert levels (automatic low-stock warnings based on thresholds and upcoming bookings)

## Acceptance Criteria

**Given** a consumable item's quantity falls below its threshold
**When** a stock exit is recorded
**Then** a `stock_alert` event is emitted immediately
**And** the Owner and property managers receive an in-app notification
**And** the alert includes: item name, current quantity, threshold, property name

**Given** upcoming reservations for a property in the next 7 days
**When** the predictive stock check runs (daily BullMQ job)
**Then** the system estimates required stock based on default consumption per reservation
**And** if current stock won't cover upcoming needs, a preemptive alert is generated
**And** the alert says: "Stock de [Item] insuffisant pour les [N] réservations à venir sur [Property]"

**Given** I want to configure thresholds
**When** I edit a consumable item
**Then** I can set a custom threshold level
**And** the threshold is used for both immediate alerts and predictive checks

**Given** a stock alert has been generated
**When** I restock above the threshold
**Then** the alert is automatically resolved
**And** the alert status changes from "active" to "resolved"

**Given** the inventory dashboard
**When** alerts exist
**Then** a summary badge shows the count of active stock alerts
**And** alerts are sorted by urgency (zero stock first, then below threshold, then predictive)

**Given** stock alerts
**When** they are generated
**Then** they respect the user's notification preferences (Story 4.5)
**And** email notifications are sent for critical alerts (zero stock)

## Technical Notes

- Alert trigger: checked on every `StockMovement` creation (exit type)
- Predictive check: BullMQ repeatable job, daily at 06:00
- Prediction: `upcoming_reservations_count × default_consumption_per_reservation` per item
- Default consumption: configurable per item (`estimated_per_reservation` field)
- Alert model: reuses notification system from Epic 4 with `type: STOCK_ALERT`
- Event: `stock_alert` → notification worker
- Resolution: background check on stock entry movements
