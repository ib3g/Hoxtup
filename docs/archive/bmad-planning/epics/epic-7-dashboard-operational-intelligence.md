# Epic 7: Dashboard & Operational Intelligence

Users can see their complete operational state at a glance — executive KPIs for planning, field task view for execution, daily activity summaries — with the ability to switch between manager and field perspectives.

**FRs covered:** FR46, FR47, FR48, FR49, FR50, FR51

**NFRs addressed:** NFR2 (< 2s page load, "home feed" endpoint), NFR3 (< 800ms analytics)

**Technical scope:**

- Executive dashboard (today's arrivals/departures, active tasks, alerts, KPIs)
- Field staff dashboard ("My Tasks Today", prominent next task, quick actions)
- Activity summary (end-of-day recap, 7-day history)
- Role Switcher toggle (Manager Mode ↔ Field Mode)
- Persistent mode preference per session
- Access control (toggle for Owner/Admin/Manager only; Staff = Field Mode)
- Temporal dashboard adaptation (morning/midday/evening context)
- KPIBar + DashboardHeader + ZenStateIndicator components
- Server-side "home feed" aggregation endpoint

**Dependencies:** Epic 1 (auth, RBAC) + Epic 2 (properties) + Epic 3 (tasks). Enhanced by Epic 4 (alerts), Epic 6 (costs)

## Stories

- [Story 7.1: Executive Dashboard & KPIs](../stories/story-7.1-executive-dashboard.md)
- [Story 7.2: Field Staff Dashboard](../stories/story-7.2-field-staff-dashboard.md)
- [Story 7.3: Activity Summary & Daily Recap](../stories/story-7.3-activity-summary.md)
- [Story 7.4: Role Switcher Mode Toggle](../stories/story-7.4-role-switcher.md)
