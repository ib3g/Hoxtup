# Story 7.3: Activity Summary & Daily Recap

## Epic: 7 - Dashboard & Operational Intelligence

As an **owner or admin**,
I want an end-of-day recap showing completed tasks, processed alerts, and daily costs,
So that I can review the day's operations and track trends over time.

## Requirements Covered

- FR48: Activity summary (end-of-day recap: completed tasks, processed alerts, daily costs; available for current day and previous 7 days)

## Acceptance Criteria

**Given** I access the Activity Summary
**When** the summary loads for today
**Then** I see: tasks completed (count + list), tasks incomplete (count + list), incidents reported and resolved, alerts processed, daily cost total (consumable exits + manual expenses)

**Given** the tasks completed section
**When** I view it
**Then** completed tasks show: title, property, completed by, completion time
**And** tasks completed via proxy show a distinct "proxy" indicator

**Given** the daily cost total
**When** it is calculated
**Then** it sums: consumable stock exits (with cost), revenue entries (if any), showing net cost for the day
**And** amounts display in org currency

**Given** I want to view a previous day
**When** I navigate to a past date (up to 7 days back)
**Then** the summary loads for that date with the same information
**And** I can swipe between days or use a date selector

**Given** the activity summary includes a trend indicator
**When** I view today's summary
**Then** I see comparison with the same day last week: "3 more tasks than last [day]"
**And** the comparison uses green (improvement) or neutral (same/worse) color coding

**Given** the activity summary on mobile
**When** I view it
**Then** the summary is organized as collapsible sections
**And** the cost section shows a simple total with expandable breakdown

**Given** the temporal dashboard adaptation (evening mode)
**When** I access the main dashboard after 17:00
**Then** the activity summary is prominently shown at the top of the dashboard
**And** it replaces the morning's planning-focused layout

## Technical Notes

- API endpoint: `GET /api/v1/dashboard/activity?date=YYYY-MM-DD`
- Response: `{ date, tasksCompleted, tasksIncomplete, incidents, alerts, costs, comparison }`
- Cost calculation: SQL aggregation of StockMovement (exits) + Revenue entries for the date
- 7-day history: client can fetch any date within last 7 days
- Comparison: server calculates delta with same weekday previous week
- Collapsible sections: shadcn/ui Collapsible component
- Temporal routing: dashboard shows summary prominently in evening context
