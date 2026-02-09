# Story 3.4: Task Fusion Engine

## Epic: 3 - Task Management & Team Coordination

As an **owner or admin**,
I want the system to detect overlapping tasks on the same property and suggest merging them into a single "Turnover" task,
So that my team works efficiently without redundant cleaning passes.

## Requirements Covered

- FR16: Task Fusion Engine (auto-detection of overlapping tasks, "Turnover" merge suggestions, user-driven acceptance)

## Acceptance Criteria

**Given** two tasks exist on the same property within a configurable time window (default: 4 hours)
**When** the fusion detection engine runs (on task creation or reservation sync)
**Then** both tasks transition to `FUSION_SUGGESTED` state
**And** a TaskFusionSuggestion card appears showing a before/after comparison

**Given** a fusion suggestion is displayed
**When** I view the TaskFusionSuggestion component
**Then** I see: the two original tasks (titles, times), the proposed merged task ("Turnover — [Property]"), estimated time savings
**And** I have two actions: "Accept" (merge) or "Reject" (keep separate)

**Given** I accept a fusion suggestion
**When** I click "Accept"
**Then** the two original tasks are replaced by a single `TURNOVER` task
**And** the new task inherits the earliest start time and latest end time
**And** the new task references both original reservations
**And** original tasks are archived with link to the fusion result

**Given** I reject a fusion suggestion
**When** I click "Reject"
**Then** both tasks return to their previous state (PENDING_VALIDATION or TODO)
**And** the same pair will not be suggested for fusion again

**Given** the fusion detection runs in the morning planning session
**When** there are multiple fusion candidates for the day
**Then** all suggestions are shown together in a dedicated "Suggestions" section
**And** the user can accept or reject each independently

**Given** a task is modified after fusion suggestion
**When** the dates no longer overlap
**Then** the fusion suggestion is automatically withdrawn
**And** tasks return to their previous state

## Technical Notes

- Fusion detection: SQL query finding tasks on same property with overlapping `scheduled_at` within configurable window
- Detection triggers: `reservation_created`, `task_created`, `reservation_updated` events
- Fusion state: `FUSION_SUGGESTED` with `fusion_pair_id` linking the two tasks
- Rejection tracking: `fusion_rejections` table to prevent re-suggesting same pair
- TaskFusionSuggestion component: before/after comparison layout, Accept (terra CTA) / Reject (ghost) buttons
- Merged task: new Task with `type: TURNOVER`, references to both source tasks
- Configurable window: `organization_settings.fusion_window_hours` (default: 4)
