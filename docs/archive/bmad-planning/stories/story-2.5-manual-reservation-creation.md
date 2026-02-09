# Story 2.5: Manual Reservation Creation

## Epic: 2 - Property Management & Reservations

As an **owner or admin**,
I want to manually create reservations for direct bookings not captured by iCal,
So that all my reservations are tracked in one place and trigger the same auto-task generation as iCal imports.

## Requirements Covered

- FR9: Manual reservation creation (guest name optional, check-in/out dates, property, notes)

## Acceptance Criteria

**Given** I am on a property profile or global reservation view
**When** I click "Add Reservation"
**Then** I see a form with: property selector (pre-filled if from property page), guest name (optional), check-in date/time, check-out date/time, notes (optional)

**Given** I submit a valid manual reservation
**When** the server processes it
**Then** a Reservation record is created with `source_type: 'manual'`
**And** it follows the same auto-task generation rules as iCal imports
**And** a `reservation_created` event is emitted for downstream processing

**Given** I submit a reservation with check-out before check-in
**When** the form validates
**Then** an inline error appears: "La date de départ doit être après la date d'arrivée"

**Given** I submit a reservation overlapping an existing one on the same property
**When** the server checks for conflicts
**Then** a warning is displayed: "Chevauchement avec une réservation existante"
**And** I can choose to create it anyway or adjust dates

**Given** a manual reservation exists
**When** I view the reservation list
**Then** manual reservations show a "Manual" badge to distinguish them from iCal imports

**Given** I want to edit a manual reservation
**When** I modify dates or details
**Then** the same task update logic from Story 2.4 applies (linked tasks in PENDING/TODO states are updated)
**And** a `reservation_updated` event is emitted

**Given** I want to cancel a manual reservation
**When** I click "Cancel" and confirm
**Then** the reservation is marked as cancelled
**And** linked pending/todo tasks are cancelled with system note
**And** a `reservation_cancelled` event is emitted

## Technical Notes

- API endpoints:
  - `POST /api/v1/reservations` — create manual reservation
  - `PATCH /api/v1/reservations/:id` — update (manual only)
  - `DELETE /api/v1/reservations/:id` — cancel (manual only, soft delete)
- Reuses `Reservation` model from Story 2.4 with `source_type` discriminator
- iCal-imported reservations are read-only (changes come from iCal sync)
- Date picker: native date input on mobile, popover calendar on desktop
- Overlap detection: SQL query checking date range intersection on same property
