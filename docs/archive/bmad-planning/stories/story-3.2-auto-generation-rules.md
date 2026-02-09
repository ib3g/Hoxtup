# Story 3.2: Task Auto-Generation Rules Engine

## Epic: 3 - Task Management & Team Coordination

As an **owner or admin**,
I want configurable rules that auto-generate tasks from reservations,
So that cleaning and preparation tasks are created automatically when new bookings arrive.

## Requirements Covered

- FR18: Auto-generation rules (configurable per property: Before Arrival / After Departure / Turnover)

## Acceptance Criteria

**Given** I am on a property's settings page
**When** I configure auto-generation rules
**Then** I can enable/disable task generation for: Before Arrival, After Departure, and Turnover
**And** for each rule I can set: task type, default title, time offset (hours before/after event), estimated duration

**Given** a new reservation is created (iCal sync or manual)
**When** the property has "Before Arrival" rule enabled
**Then** a cleaning task is auto-generated scheduled X hours before check-in
**And** the task is in `PENDING_VALIDATION` state
**And** the task title follows the rule template (e.g., "Nettoyage avant arrivée — [Property Name]")

**Given** a new reservation is created
**When** the property has "After Departure" rule enabled
**Then** a cleaning task is auto-generated scheduled at or after check-out time
**And** the task references the reservation

**Given** consecutive reservations on the same property (departure + arrival same day)
**When** both "After Departure" and "Before Arrival" rules are active
**Then** BOTH tasks are generated (fusion detection happens in Story 3.4)

**Given** a property has no auto-generation rules configured
**When** a reservation is created
**Then** no tasks are auto-generated
**And** the owner can still create tasks manually

**Given** the auto-generation rules
**When** a reservation is updated (dates changed)
**Then** linked auto-generated tasks in PENDING_VALIDATION/TODO are rescheduled per the rules
**And** the rescheduling reuses the logic from Story 2.6

**Given** the auto-generation rules
**When** a reservation is cancelled
**Then** linked auto-generated tasks in PENDING_VALIDATION/TODO are cancelled

**Given** the TaskValidationBanner component
**When** there are tasks in PENDING_VALIDATION state
**Then** a prominent amber banner appears at the top: "5 tâches à valider"
**And** clicking "Voir" navigates to the pending validation list
**And** the banner dismisses when all pending tasks are validated

## Technical Notes

- Prisma model: `TaskAutoRule` with `property_id`, `trigger_type` (BEFORE_ARRIVAL, AFTER_DEPARTURE, TURNOVER), `task_type`, `title_template`, `time_offset_hours`, `duration_minutes`, `enabled`
- Event listener: `reservation_created` → check rules → generate tasks
- Task linkage: `task.reservation_id` + `task.auto_rule_id` for traceability
- Template variables: `{property_name}`, `{guest_name}`, `{date}`
- Default rules created when property is created (disabled by default)
- TaskValidationBanner: amber bg `#FEF9E7`, bell icon, count, "Voir" CTA
