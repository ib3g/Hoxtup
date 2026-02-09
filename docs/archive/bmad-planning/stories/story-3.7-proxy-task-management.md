# Story 3.7: Proxy Task Management

## Epic: 3 - Task Management & Team Coordination

As an **owner, admin, or manager**,
I want to update task status on behalf of staff members (especially Staff Managed without app access),
So that all tasks are tracked accurately even when staff can't update the system themselves.

## Requirements Covered

- FR20: Proxy task management (act on behalf of any assigned staff for past/current/future tasks; all proxy actions logged with acting user, assigned staff, and timestamp)

## Acceptance Criteria

**Given** I am an Owner/Admin/Manager viewing a task assigned to any staff member
**When** I click on the task actions
**Then** I see a "Act on behalf" option that lets me start, complete, or report an incident for the task
**And** the action is clearly labeled as a proxy action

**Given** I perform a proxy action (e.g., mark as completed)
**When** the action is processed
**Then** the task state updates normally
**And** the task history records: acting user (me), assigned staff (them), action, timestamp
**And** a distinct audit entry is created: "Completed by [Admin] on behalf of [Staff]"

**Given** I am a Manager
**When** I perform proxy actions
**Then** I can only act on behalf of staff assigned to my properties
**And** I cannot perform proxy actions for staff outside my scope

**Given** a task is in the past (scheduled_at < now)
**When** I perform a proxy action
**Then** the system accepts the action and records the actual timestamp
**And** a note is added: "Retroactive update by [Admin]"

**Given** a task assigned to a Staff Managed member
**When** the task needs status updates
**Then** only Owner/Admin/Manager can update it via proxy
**And** the Staff Managed member has no ability to self-update

**Given** the task history view
**When** I view a task with proxy actions
**Then** each entry clearly shows who performed the action and on whose behalf
**And** proxy entries are visually distinct from self-performed actions (different icon/color)

**Given** any proxy action
**When** it is executed
**Then** the same events are emitted as normal actions (task_state_changed, task_assigned, etc.)
**And** the event payload includes both `actor_id` (proxy user) and `assigned_user_id` (staff)

## Technical Notes

- API: all task state endpoints accept optional `on_behalf_of` parameter
- Authorization: proxy actions require `task:proxy` permission (Owner, Admin, Manager)
- Manager scope: filtered by property assignments — can only proxy for staff on their properties
- Audit: `task_history` entries with `actor_id` (who did it) + `on_behalf_of_id` (for whom) + `is_proxy: true`
- Past tasks: no time restriction on proxy actions (retroactive updates allowed)
- Events: standard events with extended payload including proxy metadata
