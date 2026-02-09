# Story 2.6: Dynamic Reservation Updates & Task Linking

## Epic: 2 - Property Management & Reservations

As an **owner or admin**,
I want modified or cancelled reservations to automatically update their linked tasks,
So that my task schedule always reflects the current reservation state without manual intervention.

## Requirements Covered

- FR13: Dynamic task updates — modified iCal reservations auto-update linked tasks in PENDING/TODO states

## Acceptance Criteria

**Given** a reservation has linked tasks in PENDING_VALIDATION or TODO state
**When** the reservation dates are modified (via iCal sync or manual edit)
**Then** linked tasks are automatically rescheduled to match the new dates
**And** tasks in IN_PROGRESS or COMPLETED state are not modified
**And** a system note is added to each updated task: "Rescheduled: reservation dates changed"

**Given** a reservation is cancelled
**When** linked tasks exist in PENDING_VALIDATION or TODO state
**Then** those tasks are automatically cancelled with system note: "Cancelled: reservation removed"
**And** tasks in IN_PROGRESS state receive an alert but are not auto-cancelled

**Given** a reservation date change causes a task time conflict
**When** the system detects overlapping tasks for the same property
**Then** the tasks are still rescheduled but flagged with a conflict warning
**And** a `task_conflict_detected` event is emitted

**Given** the system processes a reservation update
**When** linked tasks are modified
**Then** an audit log entry is created with: reservation ID, affected task IDs, previous dates, new dates, update source (ical_sync or manual)

**Given** a reservation update arrives from iCal sync
**When** the update is processed
**Then** the entire update-and-cascade happens within a single database transaction
**And** if any step fails, the entire operation is rolled back

## Technical Notes

- Event-driven: `reservation_updated` and `reservation_cancelled` events trigger task cascade
- Task state filter: only PENDING_VALIDATION and TODO tasks are auto-updated
- Transaction: Prisma `$transaction` for atomic reservation + task updates
- Audit: `reservation_task_audit` table tracking all cascaded changes
- Task linkage: `task.reservation_id` foreign key connecting tasks to reservations
- This story creates the Task model schema (needed for linkage) but the full task lifecycle is Epic 3
