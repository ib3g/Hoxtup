# Story 3.3: Task Assignment & Manual Task Management

## Epic: 3 - Task Management & Team Coordination

As an **owner, admin, or manager**,
I want to assign tasks to team members and create tasks manually,
So that I can coordinate my team's work and handle tasks not covered by auto-generation.

## Requirements Covered

- FR15: Task lifecycle (partial — assignment and manual creation flows)

## Acceptance Criteria

**Given** I am an Owner/Admin/Manager viewing a task in TODO state
**When** I click "Assign"
**Then** I see a list of eligible staff members (filtered by property assignment for Managers)
**And** selecting a staff member assigns the task immediately (optimistic UI)
**And** a `task_assigned` event is emitted

**Given** I want to assign multiple tasks at once
**When** I enter multi-select mode (long press on mobile, Ctrl+click on desktop)
**Then** I can select multiple tasks and bulk-assign them to a staff member
**And** all selected tasks are assigned in a single operation

**Given** I want to create a task manually
**When** I click "New Task"
**Then** I see a form with: title (required), property (required), type (required), description (optional), scheduled date/time (required), assigned staff (optional), reservation link (optional)
**And** the task is created in `PENDING_VALIDATION` state

**Given** I am a Manager
**When** I assign tasks
**Then** I can only assign to staff members linked to my assigned properties
**And** I cannot create tasks for properties outside my scope

**Given** a task is assigned to a Staff Autonomous user
**When** the assignment is saved
**Then** the staff member can see the task in their "My Tasks" view
**And** a `task_assigned` event is emitted for notification

**Given** a task is assigned to a Staff Managed member
**When** the assignment is saved
**Then** the task appears linked to that staff profile
**And** only Owner/Admin/Manager can update the task status on their behalf

**Given** the task list on mobile
**When** I view my assigned tasks
**Then** tasks are displayed as TaskCards sorted by scheduled time
**And** the next task uses the Prominent variant (140px, full-width CTA)
**And** subsequent tasks use the Default variant (72px)

**Given** I swipe right on a task card (mobile)
**When** the swipe gesture completes
**Then** the task is marked as completed (optimistic UI with undo toast)

**Given** I swipe left on a task card (mobile)
**When** the swipe gesture completes
**Then** a contextual action panel appears (assign, edit, details)

## Technical Notes

- API endpoints:
  - `POST /api/v1/tasks` — create manual task
  - `PATCH /api/v1/tasks/:id/assign` — assign to staff
  - `POST /api/v1/tasks/bulk-assign` — bulk assignment
  - `GET /api/v1/tasks/my` — list tasks for current user (staff view)
  - `GET /api/v1/tasks` — list all tasks (manager view, filtered by scope)
- Bulk assign: array of task IDs + assignee ID in single request
- Mobile gestures: swipe handlers with haptic feedback
- Sort: tasks ordered by `scheduled_at` ASC, then `status` priority
- Staff view filter: `assigned_user_id = current_user_id`
