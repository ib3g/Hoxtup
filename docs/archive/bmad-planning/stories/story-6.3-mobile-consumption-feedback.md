# Story 6.3: Mobile Consumption Feedback

## Epic: 6 - Inventory & Cost Management

As a **staff member**,
I want to adjust real consumption when I complete a task,
So that the inventory reflects actual usage instead of estimates.

## Requirements Covered

- FR22: Mobile feedback loop (staff adjust real consumption at task completion)

## Acceptance Criteria

**Given** I am a Staff Autonomous completing a task
**When** I tap "Terminer" on a task
**Then** before the task is marked complete, a consumption feedback form appears
**And** it shows pre-filled estimated consumption for each consumable item linked to the task type

**Given** the consumption feedback form
**When** I view the pre-filled items
**Then** each item shows: name, estimated quantity, and an editable quantity field
**And** I can adjust up or down (e.g., "only 1 water used" instead of estimated 2)
**And** I can add items not in the estimate or remove unused items

**Given** I submit the consumption feedback
**When** the form is submitted
**Then** stock exit movements are created for each item with actual quantities
**And** the task is marked as COMPLETED
**And** the consumption data is linked to the task for reporting

**Given** I want to skip the consumption feedback
**When** I tap "Skip" or swipe away the form
**Then** the estimated consumption is used as default
**And** the task is still marked as COMPLETED

**Given** the consumption form on mobile
**When** I interact with it
**Then** quantity adjusters use large +/- buttons (48px minimum touch targets)
**And** the form opens as a bottom sheet (not a full page redirect)
**And** the form works offline (queued with the task completion)

**Given** the task type has no linked consumables
**When** I complete the task
**Then** no consumption feedback form appears
**And** the task is completed immediately

## Technical Notes

- Consumption defaults: `TaskType` → linked `ConsumableItem` list with default quantities
- Configuration: `task_type_consumables` join table mapping task types to items + default quantity
- API: `POST /api/v1/tasks/:id/complete` with optional `consumptions: [{ itemId, quantity }]` body
- If no consumptions provided, defaults are used
- Stock movements created atomically with task completion (Prisma `$transaction`)
- Offline: consumption data included in the offline task completion queue
- Form: React Hook Form with dynamic field array for consumable items
