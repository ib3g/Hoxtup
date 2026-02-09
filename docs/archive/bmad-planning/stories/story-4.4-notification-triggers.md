# Story 4.4: Notification Trigger Configuration

## Epic: 4 - Notifications & Alerts

As a **platform operator**,
I want all notification triggers mapped and firing correctly for every event type,
So that no important event goes unnoticed across the system.

## Requirements Covered

- FR44: Notification triggers (7+ event types: new reservation, task assigned, task overdue, task completed, incident reported, stock below threshold, iCal sync failure)

## Acceptance Criteria

**Given** a new reservation is created (iCal sync or manual)
**When** the `reservation_created` event fires
**Then** the Owner and assigned Managers receive an in-app notification
**And** the notification includes: guest name (if available), property, check-in/check-out dates

**Given** a task is assigned to a staff member
**When** the `task_assigned` event fires
**Then** the assigned staff receives an in-app notification and email (if enabled)
**And** the notification includes: task title, property, scheduled time, deep link to task

**Given** a task is overdue (scheduled_at + duration < now, status still TODO or IN_PROGRESS)
**When** the overdue check job runs (every 15 minutes)
**Then** the assigned staff and their manager receive an in-app notification
**And** the task is flagged as overdue in the UI (visual indicator)

**Given** a task is completed
**When** the `task_completed` event fires
**Then** the task creator and property manager receive an in-app notification
**And** the notification includes: task title, completed by, completion time

**Given** an incident is reported
**When** the `task_incident_reported` event fires
**Then** ALL Owners and Admins in the organization receive in-app + email notifications
**And** the notification includes: reporter name, incident type, property, photo thumbnail (if any)
**And** the email has highest priority

**Given** stock falls below threshold
**When** the `stock_alert` event fires (from Epic 6)
**Then** the Owner and inventory managers receive in-app + email
**And** the notification includes: item name, current quantity, threshold, property

**Given** iCal sync has been failing for 6+ hours
**When** the `sync_failure_alert` event fires
**Then** the Owner and Admin receive in-app + email
**And** the notification includes: property name, iCal source, last successful sync, error details

**Given** the overdue detection
**When** it runs as a BullMQ scheduled job
**Then** it checks all TODO and IN_PROGRESS tasks where `scheduled_at + duration < now`
**And** it only creates one overdue notification per task (not repeated on each check)

## Technical Notes

- Trigger mapping: `notification-triggers.config.ts` mapping event types → recipient resolution → channels
- Recipient resolution per event:
  - `reservation_created` → org owners + property managers
  - `task_assigned` → assigned staff
  - `task_overdue` → assigned staff + property managers
  - `task_completed` → task creator + property managers
  - `incident_reported` → all owners + admins
  - `stock_alert` → owners + inventory managers
  - `sync_failure` → owners + admins
- Overdue check: BullMQ repeatable job, every 15 min
- Deduplication: `notification_dedup` key per task for overdue (only one notification)
- All triggers respect user notification preferences (Story 4.5)
