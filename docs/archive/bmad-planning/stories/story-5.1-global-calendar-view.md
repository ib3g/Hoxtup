# Story 5.1: Global Calendar View

## Epic: 5 - Calendar & Scheduling

As an **owner or admin**,
I want to see all reservations and tasks across all my properties in a single calendar,
So that I have a complete overview of my operations and can plan effectively.

## Requirements Covered

- FR36: Global calendar view (all properties)
- FR40: Calendar interactions (tap to detail, day/week/month navigation)

## Acceptance Criteria

**Given** I navigate to the Calendar screen
**When** the calendar loads
**Then** I see all reservations and tasks across all my properties displayed on a timeline
**And** the default view is "Today" (day view)

**Given** the calendar day view
**When** I view today's events
**Then** events are displayed as TimelineItem components in chronological order
**And** each item shows: time label, vertical line, property color dot, content card (title + meta)

**Given** the calendar navigation
**When** I use the PillToggle (Aujourd'hui / Semaine / Mois)
**Then** the view switches between day, week, and month views
**And** transitions use crossfade animation (150ms)

**Given** the week view
**When** I view a week
**Then** each day column shows event counts and key events
**And** I can swipe left/right to navigate between weeks

**Given** the month view
**When** I view a month
**Then** each day cell shows a dot indicator for days with events
**And** tapping a day navigates to the day view for that date

**Given** I tap on a calendar event
**When** the detail opens
**Then** a sheet (bottom drawer on mobile) shows full event details
**And** for tasks: title, status, property, assigned staff, time, actions
**And** for reservations: guest name, property, check-in/out, linked tasks

**Given** the calendar on mobile (< 768px)
**When** I view it
**Then** the day view is the primary view (single column timeline)
**And** week/month views use compact representations

**Given** the calendar on desktop (> 1024px)
**When** I view it
**Then** a split panel shows the calendar on the left and event details on the right

## Technical Notes

- API endpoint: `GET /api/v1/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD&view=day|week|month`
- Response: array of events (reservations + tasks) with type discriminator
- TimelineItem component: time label + vertical line + colored dot + content card
- PillToggle component: segmented control with 3 options
- Caching: TanStack Query with 1min stale time for calendar data
- Responsive: day view default on mobile, week view default on desktop
- Navigation: URL params for date and view type (shareable links)
