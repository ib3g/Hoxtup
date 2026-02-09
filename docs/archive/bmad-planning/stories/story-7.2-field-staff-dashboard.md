# Story 7.2: Field Staff Dashboard

## Epic: 7 - Dashboard & Operational Intelligence

As a **staff member**,
I want to see my tasks for today with the next task prominently highlighted and quick action buttons,
So that I can start working immediately without navigating through menus.

## Requirements Covered

- FR47: Field staff dashboard ("My Tasks Today" with property photo, time, status, quick actions)

## Acceptance Criteria

**Given** I am a Staff Autonomous user and I log in
**When** the field dashboard loads
**Then** I see a simplified header with my name and task count ("3 tâches aujourd'hui")
**And** my next task is displayed using the Prominent TaskCard variant (140px)

**Given** the Prominent TaskCard for my next task
**When** it renders
**Then** it shows: task title (large), property name + photo thumbnail, scheduled time, full-width CTA button (56px height)
**And** the CTA is contextual: "Commencer" (if TODO), "Terminer" (if IN_PROGRESS)
**And** the CTA uses terra cotta `#a06050`

**Given** the remaining tasks below my next task
**When** they render
**Then** they use the Default TaskCard variant (72px) ordered by scheduled time
**And** each shows: title, property color dot, time, status indicator

**Given** I tap "Commencer" on my next task
**When** the action processes
**Then** the task transitions to IN_PROGRESS (optimistic UI)
**And** the CTA changes to "Terminer"
**And** "Report Problem" button becomes accessible

**Given** I complete all my tasks for today
**When** no tasks remain
**Then** the ZenStateIndicator appears: sun icon ☀️, "Tout est sous contrôle"
**And** the dashboard background shifts to a calm state (green tint, expanded whitespace)

**Given** some tasks are complete but others remain
**When** partial completion
**Then** the ZenStateIndicator shows partial: cloud-sun icon 🌤️, "En bonne voie"

**Given** I am in the field with poor connectivity
**When** I tap "Commencer" or "Terminer"
**Then** the action is queued locally and synced when connection returns
**And** a thin amber banner appears: "Mode hors ligne — vos actions seront synchronisées"
**And** I am never blocked from working

**Given** the field dashboard on mobile
**When** I view it
**Then** the BottomNavBar shows 3 tabs: Tasks, Planning, Incident
**And** the layout is single column, touch-optimized

## Technical Notes

- API endpoint: `GET /api/v1/dashboard/field` — staff-specific home feed
- Response: `{ taskCount, nextTask, remainingTasks, zenState }`
- ZenStateIndicator: 3 levels (zen_complete, zen_partial, attention)
- Zen logic: server-side based on task completion ratio for today
- Offline: service worker + IndexedDB for task action queue
- Sync: background sync API for queued mutations
- Prominent TaskCard: larger title, property photo, full-width CTA
- CTA rule: only ONE terra cotta button visible (the next action)
