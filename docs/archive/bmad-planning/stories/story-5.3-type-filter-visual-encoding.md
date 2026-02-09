# Story 5.3: Type-Filtered Calendar & Visual Encoding

## Epic: 5 - Calendar & Scheduling

As an **owner or admin**,
I want to filter the calendar by task type and see color-coded events,
So that I can quickly distinguish between cleanings, maintenance, check-ins, and other events.

## Requirements Covered

- FR39: Type-filtered calendar (filter by task type: cleaning, maintenance, inspection, check-in/out)
- FR41: Visual encoding (color-coded by type and property, distinct treatment for pending vs confirmed)

## Acceptance Criteria

**Given** I am on the calendar view
**When** I open the type filter
**Then** I can filter by task types: Cleaning, Maintenance, Inspection, Check-In, Check-Out, Turnover, Other
**And** I can select multiple types simultaneously
**And** reservations are always visible (not filtered by type)

**Given** the calendar displays events
**When** events are rendered
**Then** each event is color-coded by its property color (from PropertyColorDot palette)
**And** task type is indicated by a small icon on the event card (broom for cleaning, wrench for maintenance, etc.)

**Given** a task is in PENDING_VALIDATION state
**When** it appears on the calendar
**Then** it has a dashed border and reduced opacity (0.7)
**And** it is visually distinct from confirmed/validated tasks which have solid borders and full opacity

**Given** a task is in INCIDENT state
**When** it appears on the calendar
**Then** it has a red `#C45B4A` border and a warning icon
**And** it visually stands out from other events

**Given** a task is COMPLETED
**When** it appears on the calendar
**Then** it has reduced opacity (0.5), strikethrough on the title, and green `#2D8A6E` left border
**And** it does not distract from active tasks

**Given** conflicting tasks exist on the calendar
**When** they overlap in the same time slot
**Then** a warning icon appears on the time slot
**And** tapping shows both conflicting events with the conflict details

**Given** the type filter and property filter are both active
**When** the calendar updates
**Then** both filters are combined (AND logic): only events matching both property AND type are shown
**And** active filters are shown as removable badges

**Given** the calendar on any viewport
**When** events use color coding
**Then** color is never the sole indicator — icons + color are always paired
**And** the visual encoding is tested for deuteranopia, protanopia, and tritanopia

## Technical Notes

- API: calendar endpoint with `?types=CLEANING,MAINTENANCE` query param
- Type icons: Lucide icons mapped per task type
- Visual states:
  - PENDING_VALIDATION: dashed border, opacity 0.7
  - TODO/ASSIGNED: solid border (property color), opacity 1.0
  - IN_PROGRESS: property color border + subtle glow
  - COMPLETED: green border, opacity 0.5, strikethrough
  - INCIDENT: red border, warning icon
- Color blindness: all statuses use icon + color (never color alone)
- Combined filters: client-side intersection of property + type + user filters
- Conflict overlay: shared time slot detection on the calendar grid
