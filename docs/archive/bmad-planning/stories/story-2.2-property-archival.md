# Story 2.2: Property Archival & Soft Delete

## Epic: 2 - Property Management & Reservations

As an **owner or admin**,
I want to archive properties I no longer manage while preserving their historical data,
So that my active property list stays clean but I can still access past financial reports and task history.

## Requirements Covered

- FR35: Property archival (soft-delete preserving historical data for financial reports)

## Acceptance Criteria

**Given** I am an Owner or Admin viewing a property profile
**When** I click "Archive Property"
**Then** a confirmation dialog appears (destructive action pattern)
**And** the dialog explains that archived properties retain historical data but are hidden from active views

**Given** I confirm archival
**When** the property is archived
**Then** it disappears from the active property list
**And** its iCal sync jobs are stopped
**And** its pending/active tasks are cancelled with a system note
**And** assigned staff are unlinked

**Given** archived properties exist
**When** I toggle "Show archived" in the property list
**Then** archived properties appear with a visual indicator (muted opacity, "Archived" badge)
**And** I can view their profile and historical data (read-only)

**Given** I view an archived property's profile
**When** I access financial reports for that property
**Then** all historical consumable usage, asset purchases, and cost data is available
**And** the property appears in organization-wide financial reports for its active period

**Given** I want to reactivate an archived property
**When** I click "Reactivate" on an archived property
**Then** it returns to the active property list
**And** I need to manually re-add iCal sources and reassign staff

## Technical Notes

- Soft delete: `archived_at` timestamp column (null = active)
- Default query filter: `WHERE archived_at IS NULL`
- Archive cascade: cancel BullMQ recurring iCal jobs, update task statuses
- Financial data preservation: no foreign key CASCADE delete on reports/costs
- Reactivation resets `archived_at` to null but does not restore iCal/staff links
