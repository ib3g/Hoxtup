# Story 3.1: Task Model & Lifecycle State Machine

## Epic: 3 - Task Management & Team Coordination

As an **owner or admin**,
I want a structured task lifecycle with clear states and transitions,
So that every task follows a predictable workflow from creation to completion.

## Requirements Covered

- FR15: Task lifecycle state machine (6 states: Pending Validation, To Do, In Progress, Completed, Incident, Fusion Suggested)

## Acceptance Criteria

**Given** the task system
**When** a task is created (manually or auto-generated)
**Then** it starts in `PENDING_VALIDATION` state
**And** it has: title, description, property, reservation (optional), type, scheduled date/time, assigned staff (optional)

**Given** a task in `PENDING_VALIDATION` state
**When** an Owner/Admin/Manager clicks "Valider"
**Then** the task transitions to `TODO` state
**And** if a staff member is assigned, they are notified

**Given** a task in `TODO` state
**When** the assigned staff clicks "Commencer"
**Then** the task transitions to `IN_PROGRESS` state
**And** the start timestamp is recorded

**Given** a task in `IN_PROGRESS` state
**When** the assigned staff clicks "Terminer"
**Then** the task transitions to `COMPLETED` state
**And** the completion timestamp is recorded
**And** an optimistic UI update shows the task as completed with undo toast (5s)

**Given** a task in `IN_PROGRESS` state
**When** the assigned staff reports an incident
**Then** the task transitions to `INCIDENT` state
**And** a `task_incident_reported` event is emitted

**Given** a task in `INCIDENT` state
**When** an Owner/Admin/Manager resolves the incident
**Then** the task can transition back to `IN_PROGRESS` or to `COMPLETED`

**Given** a task receives a fusion suggestion
**When** the system detects overlapping tasks
**Then** the task transitions to `FUSION_SUGGESTED` state
**And** the owner can accept (merge) or reject (keep separate)

**Given** the TaskCard component
**When** rendering a task
**Then** the card displays the correct visual state:
- `PENDING_VALIDATION`: amber left border `#E6A347`, amber tint bg, "Valider" terra CTA
- `TODO` / assigned: property color border, white bg
- `IN_PROGRESS`: terra cotta border `#a06050`, subtle glow, "Terminer" terra CTA
- `COMPLETED`: green border `#2D8A6E`, 0.5 opacity, strikethrough
- `INCIDENT`: red border `#C45B4A`, red tint bg, "Résoudre" red CTA

**Given** any state transition
**When** it is processed
**Then** a `task_state_changed` event is emitted with previous state, new state, actor, and timestamp
**And** the transition is logged in the task history

**Given** an invalid state transition (e.g., COMPLETED → TODO)
**When** attempted via API
**Then** a 422 error is returned with allowed transitions for the current state

## Technical Notes

- Prisma model: `Task` with `organization_id`, `property_id`, `reservation_id`, `title`, `description`, `type`, `status`, `assigned_user_id`, `scheduled_at`, `started_at`, `completed_at`
- Task types enum: `CLEANING`, `MAINTENANCE`, `INSPECTION`, `CHECK_IN`, `CHECK_OUT`, `TURNOVER`, `OTHER`
- State machine: explicit transition map validating allowed state changes
- TaskCard: 2 variants — Default (72px, list view) and Prominent (140px, staff next task)
- Task history: `task_history` table with `task_id`, `from_status`, `to_status`, `actor_id`, `timestamp`, `note`
- EventEmitter: `task_state_changed`, `task_incident_reported`
- Animation: color bar slide + fade (300ms ease-out) on state change
