# Story 3.5: Task Conflict Detection & Resolution

## Epic: 3 - Task Management & Team Coordination

As an **owner or admin**,
I want to be alerted when tasks overlap on the same property or staff member,
So that I can resolve scheduling conflicts before they cause operational issues.

## Requirements Covered

- FR19: Conflict detection (alert on overlapping tasks for same property/time slot with user-driven resolution)

## Acceptance Criteria

**Given** a new task is created or rescheduled on a property
**When** it overlaps with an existing task on the same property at the same time
**Then** a conflict warning is displayed immediately
**And** the warning shows both tasks with their times and assigned staff

**Given** a conflict is detected
**When** I view the conflict alert
**Then** I have three resolution options:
- "Create anyway" — both tasks remain as-is
- "Adjust time" — opens the task edit form to change the schedule
- "Cancel" — cancels the new/modified task

**Given** a staff member is assigned to two tasks at overlapping times
**When** the system detects the overlap
**Then** a staff conflict warning is shown on both tasks
**And** the conflict badge appears on the calendar view for that time slot

**Given** conflict detection runs
**When** it finds overlapping tasks
**Then** a `task_conflict_detected` event is emitted
**And** the conflict is stored for display in the calendar and task list views

**Given** a conflict has been resolved (user chose "Create anyway")
**When** the same pair is evaluated again
**Then** no duplicate warning is generated (conflict is marked as acknowledged)

**Given** the task list or calendar view
**When** conflicting tasks exist
**Then** they are visually marked with a warning icon
**And** hovering/tapping shows the conflict details

## Technical Notes

- Conflict detection: SQL query checking `scheduled_at` + `duration` overlap on same `property_id` or same `assigned_user_id`
- Detection triggers: task creation, task update (date/time change), task assignment
- Conflict model: `task_conflicts` table with `task_a_id`, `task_b_id`, `conflict_type` (property/staff), `status` (detected/acknowledged/resolved)
- Resolution tracking: `acknowledged_at`, `resolution` enum (kept/adjusted/cancelled)
- Visual: warning triangle icon on TaskCard, amber highlight on calendar
