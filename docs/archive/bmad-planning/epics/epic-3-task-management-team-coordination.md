# Epic 3: Task Management & Team Coordination

Users can manage the full task lifecycle — auto-generated from reservations, manually created, intelligently fused, assigned to team, tracked through completion — with incident reporting and proxy management for staff without phones.

**FRs covered:** FR15, FR16, FR17, FR18, FR19, FR20

**NFRs addressed:** NFR1 (< 200ms feedback), NFR8 (media privacy for incident photos), NFR16 (async resilience)

**Technical scope:**

- Task state machine (Pending Validation → To Do → In Progress → Completed / Incident / Fusion Suggested)
- Auto-generation rules engine (Before Arrival / After Departure / Turnover per property)
- Task Fusion Engine (overlap detection, turnover merge suggestion, accept/reject)
- Conflict detection (same property/time, user-driven resolution)
- Incident reporting (type dropdown, optional photo via Camera API, optional description)
- Proxy task management (act on behalf of Staff Managed, full audit trail)
- TaskCard component (5 states, 2 size variants)
- TaskValidationBanner + TaskFusionSuggestion components
- Optimistic UI with undo toast (5s) for constructive actions

**Dependencies:** Epic 1 (auth, RBAC) + Epic 2 (properties, reservations)

## Stories

- [Story 3.1: Task Model & Lifecycle State Machine](../stories/story-3.1-task-model-lifecycle.md)
- [Story 3.2: Task Auto-Generation Rules Engine](../stories/story-3.2-auto-generation-rules.md)
- [Story 3.3: Task Assignment & Manual Task Management](../stories/story-3.3-task-assignment-manual.md)
- [Story 3.4: Task Fusion Engine](../stories/story-3.4-task-fusion-engine.md)
- [Story 3.5: Task Conflict Detection & Resolution](../stories/story-3.5-conflict-detection.md)
- [Story 3.6: Incident Reporting](../stories/story-3.6-incident-reporting.md)
- [Story 3.7: Proxy Task Management](../stories/story-3.7-proxy-task-management.md)
