# Story 2.3: iCal Source Management

## Epic: 2 - Property Management & Reservations

As an **owner or admin**,
I want to add, update, and remove iCal feed URLs for each property,
So that I can connect my Airbnb and Booking.com calendars to automatically import reservations.

## Requirements Covered

- FR34: iCal source management (add, remove, update per property; multiple sources supported)

## Acceptance Criteria

**Given** I am on a property profile page
**When** I click "Add iCal Source"
**Then** I see a form with fields: source name (e.g., "Airbnb"), iCal URL, and sync interval selector

**Given** I paste a valid iCal URL
**When** the system validates it
**Then** it fetches the URL to confirm it returns valid iCalendar data
**And** a success indicator appears with the number of events found
**And** the source is saved and sync begins immediately

**Given** I paste an invalid or unreachable URL
**When** the system validates it
**Then** I see an error message: "URL inaccessible ou format invalide"
**And** the source is not saved

**Given** a property has multiple iCal sources (e.g., Airbnb + Booking.com)
**When** I view the property profile
**Then** each source is listed with: name, URL (truncated), last sync time, sync status (ok/warning/error)

**Given** I want to update a source URL
**When** I edit the URL and save
**Then** the old URL is replaced and an immediate re-sync is triggered
**And** existing reservations from the old URL are matched and updated (not duplicated)

**Given** I want to remove an iCal source
**When** I click "Remove" and confirm
**Then** the source is deleted
**And** reservations imported from this source are marked as "Source removed" but not deleted
**And** the corresponding sync job is cancelled

**Given** a Manager with assigned properties
**When** they view a property's iCal sources
**Then** they can see source status but cannot add, edit, or remove sources

## Technical Notes

- API endpoints:
  - `GET /api/v1/properties/:id/ical-sources` — list sources
  - `POST /api/v1/properties/:id/ical-sources` — add source (validates URL)
  - `PATCH /api/v1/properties/:propertyId/ical-sources/:sourceId` — update
  - `DELETE /api/v1/properties/:propertyId/ical-sources/:sourceId` — remove
- Prisma model: `ICalSource` with `property_id`, `name`, `url`, `sync_interval_minutes`, `last_sync_at`, `last_sync_status`, `error_message`
- URL validation: HEAD request + content-type check for `text/calendar`
- Sync interval: stored per source, default 15 minutes, configurable 15-30
