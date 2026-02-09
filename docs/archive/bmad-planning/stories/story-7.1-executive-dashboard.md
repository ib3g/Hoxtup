# Story 7.1: Executive Dashboard & KPIs

## Epic: 7 - Dashboard & Operational Intelligence

As an **owner or admin**,
I want an executive dashboard showing today's overview with key performance indicators,
So that I can assess my operational state at a glance and prioritize my actions.

## Requirements Covered

- FR46: Executive dashboard (arrivals, departures, active tasks, alerts, KPIs, pending validations, unresolved incidents)

## Acceptance Criteria

**Given** I am an Owner or Admin and I log in
**When** the dashboard loads
**Then** the DashboardHeader shows a personalized greeting ("Bonjour [Name]") with today's date
**And** a contextual message adapts based on time and state (morning: planning, midday: alerts, evening: review)

**Given** the KPIBar component
**When** the dashboard renders
**Then** I see 3-4 key metrics: Tasks today (total), Check-ins today, Check-outs today, Active alerts
**And** values use functional colors: green `#2D8A6E` for 0 alerts, red `#C45B4A` for >0 incidents, teal `#2c4f5c` for neutral counts
**And** KPIs use Outfit font (large value) + Inter font (small label)

**Given** there are tasks in PENDING_VALIDATION state
**When** the dashboard renders
**Then** the TaskValidationBanner appears: amber bg, bell icon, count, "Voir" CTA
**And** tapping "Voir" navigates to the pending validation task list

**Given** there are unresolved incidents
**When** the dashboard renders
**Then** an incident alert section appears with red `#C45B4A` accent
**And** each incident shows: property, type, reporter, time ago
**And** tapping navigates to the incident detail

**Given** the dashboard content area
**When** I scroll below the KPIs
**Then** I see today's task list ordered by scheduled time
**And** tasks use the TaskCard Default variant (72px)
**And** the list follows the "Tasks First + Mini-Dashboard" UX pattern

**Given** the temporal adaptation
**When** I access the dashboard in the morning (before 12:00)
**Then** unassigned tasks are shown first, followed by the day's schedule
**When** I access at midday (12:00-17:00)
**Then** alerts and in-progress tasks are prioritized
**When** I access in the evening (after 17:00)
**Then** the activity summary is shown first with completion stats

**Given** the dashboard on mobile (< 768px)
**When** I view it
**Then** the KPIBar scrolls horizontally if >3 KPIs
**And** the DashboardHeader is compact (greeting + 1 context line)

**Given** the dashboard on desktop (> 1024px)
**When** I view it
**Then** the DashboardHeader is extended (greeting + date + property summary)
**And** KPIs show inline with optional sparklines

## Technical Notes

- API endpoint: `GET /api/v1/dashboard/home` — aggregated "home feed" endpoint
- Response: `{ greeting, kpis, pendingValidations, incidents, tasks, contextMessage }`
- Server-side aggregation: single endpoint to minimize client requests (NFR2: < 2s load)
- Caching: Redis cache for KPIs (1-5min TTL)
- Temporal logic: server determines context based on request time + org timezone
- DashboardHeader: greeting + date + contextual message component
- KPIBar: 3-4 items, horizontal layout, functional colors
- P95 latency target: < 800ms (NFR3 analytics)
