# Story 2.4: iCal Sync Engine

## Epic: 2 - Property Management & Reservations

As an **owner or admin**,
I want my iCal feeds to sync automatically at configurable intervals with clear status indicators,
So that my reservations are always up-to-date and I'm alerted when sync fails.

## Requirements Covered

- FR10: iCal provider integration (one-way sync from Airbnb/Booking.com)
- FR11: Configurable sync interval (15-30 min per property)
- FR12: Sync failure alerting (alert after 6+ hours)
- FR14: Sync status indicator ("Last sync: X min ago" + failure alert)

## Acceptance Criteria

**Given** an iCal source is configured for a property
**When** the sync interval elapses (default: 15 minutes)
**Then** a BullMQ recurring job fetches the iCal URL
**And** new VCALENDAR events are parsed and stored as Reservation records
**And** the `last_sync_at` and `last_sync_status` are updated

**Given** the iCal feed contains new events not yet in the database
**When** the sync runs
**Then** new Reservation records are created with: guest name (from SUMMARY, optional), check-in date/time, check-out date/time, property reference, source reference
**And** duplicate detection uses the iCal UID field to prevent duplicates

**Given** the iCal feed contains modified events (changed dates)
**When** the sync detects changes via UID matching
**Then** the Reservation record is updated with new dates
**And** a `reservation_updated` event is emitted for downstream processing

**Given** the iCal feed contains cancelled events
**When** the sync detects a missing UID
**Then** the Reservation is marked as cancelled (not deleted)
**And** a `reservation_cancelled` event is emitted

**Given** an Owner or Admin views a property profile
**When** they check the iCal section
**Then** each source shows "Last sync: X min ago" with relative time
**And** successful syncs show a green checkmark
**And** failed syncs show an amber warning icon with error details

**Given** a sync has been failing for more than 6 hours
**When** the system detects consecutive failures
**Then** the source status changes to "error" (red indicator)
**And** a `sync_failure_alert` event is emitted for the notification system

**Given** the Owner wants to adjust sync frequency
**When** they change the interval from 15 to 30 minutes on a source
**Then** the BullMQ recurring job is rescheduled with the new interval
**And** the change takes effect on the next sync cycle

**Given** a network error during iCal fetch
**When** the sync job fails
**Then** the error is logged with context (source ID, URL, error type)
**And** the job will retry on the next scheduled interval
**And** `last_sync_status` is set to "error" with the error message

## Technical Notes

- BullMQ worker: `ical-sync` queue with repeatable jobs per iCal source
- iCal parsing: `ical.js` or `node-ical` library for VCALENDAR parsing
- Deduplication: iCal UID stored on Reservation record for matching
- Event emission: EventEmitter for `reservation_created`, `reservation_updated`, `reservation_cancelled`, `sync_failure_alert`
- Prisma model: `Reservation` with `organization_id`, `property_id`, `ical_source_id`, `ical_uid`, `guest_name`, `check_in`, `check_out`, `status`, `source_type` (ical/manual)
- Retry strategy: no immediate retry (next scheduled interval handles it)
- Monitoring: pino structured logs with sync job metadata
