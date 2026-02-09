---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# Hoxtup - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Hoxtup, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Multi-tenant self-service registration flow creating a unique Organization ID with automated onboarding checklist
FR2: Role-Based Access Control (RBAC) with 5 roles — Owner, Admin, Manager, Staff (Autonomous + Managed), Property Owner Client (Post-MVP)
FR3: Owner exclusive rights — delete organization, transfer ownership, delegate specific rights to Admin (delegation deferred to v1.1)
FR4: Admin full operational access — properties, staff, tasks, analytics, billing; cannot delete org or transfer ownership unless delegated
FR5: Manager access — property/staff management for assigned properties, task validation, cost viewing; no billing access
FR6: Staff Autonomous — mobile-optimized view of assigned tasks, status updates, incident reporting (with account)
FR7: Staff Managed — no app access required; represented as staff profile; Manager/Admin handles all task updates on their behalf via proxy management
FR8: Secure authentication — JWT token-based login with automatic credential refresh (access token 15min, refresh token 7d HttpOnly cookie) and persistent sessions
FR9: Manual reservation creation — guest name (optional), check-in/out date/time, property, notes; follows same auto-task generation rules as iCal imports
FR10: iCal provider integration — one-way sync from Airbnb/Booking.com
FR11: Configurable sync interval — user-adjustable between 15-30 minutes per property
FR12: Sync failure alerting — alert if sync fails for more than 6 hours (avoids false positives)
FR13: Dynamic task updates — if iCal reservation is modified, linked tasks in PENDING or TODO states are automatically updated
FR14: Sync status indicator — "Last sync: X min ago" display per property + failure alert after 6+ hours
FR15: Task lifecycle state machine — 6 states: Pending Validation, To Do, In Progress, Completed, Incident, Fusion Suggested
FR16: Task Fusion Engine — auto-detection of overlapping tasks on same property with "Turnover" merge suggestions; user-driven acceptance
FR17: Incident reporting — staff can flag Incident with feedback (problem type dropdown, optional photo, optional text description); instant notification to Manager/Admin
FR18: Auto-generation rules — configurable cleaning rules per property (Before Arrival / After Departure / Turnover) triggered by reservations
FR19: Conflict detection — alert on overlapping tasks for same property/time slot with user-driven resolution (create anyway, adjust, cancel)
FR20: Proxy task management — Owner/Admin/Manager can update task status (start, complete, report incident) on behalf of any assigned staff for past, current, and future tasks; all proxy actions logged with acting user, assigned staff, and actual timestamp
FR21: Consumable tracking — managed categories (Guest Kits, Cleaning Kits); entries (purchases/restocking), exits (consumption/waste); threshold-based automatic alerts
FR22: Mobile feedback loop — staff adjust real consumption at task completion (e.g., "only 1 water used")
FR23: Stock alert levels — automatic low-stock warnings based on configurable thresholds and upcoming bookings
FR24: Permanent asset purchase log — track durable purchases per property (linens, furniture, appliances, equipment)
FR25: Asset data model — item name, property, purchase date, cost, supplier (optional), category
FR26: No rotation/cycle tracking for assets in MVP — logged once at purchase
FR27: Asset cost integration — asset costs appear in per-property financial reports alongside consumable costs
FR28: Visual distinction — consumables (recurring) and assets (one-time) displayed in separate sections with distinct icons and color coding
FR29: Subscription engine — automated Stripe billing based on property count tiers (Free, Starter 69 EUR, Pro 199 EUR, Scale 399 EUR, Agency custom) with 30-day free trial
FR30: Financial reporting — per-property cost analysis combining consumable usage and asset purchases
FR31: Light accounting — revenue tracking (manual or import), expense tracking, cost-per-property views
FR32: Property CRUD — create, view, update, archive properties; required fields: name, address, capacity, property type
FR33: Property profile — summary displaying photo, address, capacity, linked iCal sources, assigned staff, active reservations count
FR34: iCal source management — add, remove, update iCal feed URLs per property; each property supports multiple iCal sources
FR35: Property archival — soft-delete preserving historical data for financial reports
FR36: Global calendar view — all reservations and tasks across all properties in a single timeline
FR37: Property calendar — filtered view showing reservations and tasks for a single property
FR38: Employee calendar — filtered view showing all tasks assigned to a specific staff member
FR39: Type-filtered calendar — filter by task type (cleaning, maintenance, inspection, check-in/out)
FR40: Calendar interactions — tap/click on event opens detail view; navigation by day, week, and month
FR41: Visual encoding — color-coded events by type and property color; distinct visual treatment for pending-validation vs confirmed tasks
FR42: In-app notifications — real-time notification feed accessible from any screen; badge count for unread
FR43: Email notifications — configurable email alerts for critical events (new reservation, task assigned, incident reported, stock alert)
FR44: Notification triggers — 7+ triggers: new reservation (iCal or manual), task assigned, task overdue, task completed, incident reported, stock below threshold, iCal sync failure (6+ hours)
FR45: Notification preferences — users can enable/disable specific notification types per channel (in-app, email) at user level
FR46: Executive dashboard — today's overview (arrivals, departures, active tasks, alerts count); KPIs (tasks completed rate, stock alerts, costs this period); quick-access to pending validations and unresolved incidents
FR47: Field staff dashboard — "My Tasks Today" ordered list with property photo, time, status; next task highlighted; quick-action buttons (Start, Complete, Report Problem)
FR48: Activity summary — end-of-day recap showing completed tasks, processed alerts, daily cost total; available for current day and previous 7 days
FR49: Role switcher mode toggle — switch between Manager Mode (executive dashboard, analytics, assignment) and Field Mode (task list, quick actions)
FR50: Persistent mode preference — last selected mode remembered per session; defaults to role-appropriate mode on login
FR51: Role switcher access control — mode toggle only available to Owner/Admin/Manager; Staff users see Field Mode only
FR52: Translation infrastructure — all user-facing text via translation keys (zero hardcoded strings); JSON translation files by namespace (common, dashboard, tasks, inventory, settings, auth, properties, calendar, billing, notifications)
FR53: Language selection — French at launch; user-level language preference stored in profile settings
FR54: i18n extensibility — adding a language requires only a new JSON file, no code changes; backend error messages and email templates also internationalized
FR55: Organization currency — each org selects primary currency during onboarding (EUR or MAD at launch)
FR56: Currency display — all financial data displayed in org's currency with proper formatting (symbol, decimal separator)
FR57: Currency extensibility — adding a currency requires only a configuration entry (symbol, code, formatting rules), no schema changes

### NonFunctional Requirements

NFR1: UI responsiveness — < 200ms for visual feedback on user interactions
NFR2: Page load time — < 2 seconds on 4G mobile networks; single "home feed" endpoint for server-side aggregation
NFR3: API latency — P95 < 200ms for standard CRUD operations; P95 < 800ms for analytical dashboard queries
NFR4: iCal sync performance — configurable 15-30 min interval; failure alert after 6 hours
NFR5: Multi-tenant isolation — strict logical data separation via PostgreSQL Row-Level Security (RLS)
NFR6: Authentication security — JWT with HttpOnly cookies on .hoxtup.com; access token 15min (memory) + refresh token 7d (cookie) with rotation
NFR7: Data protection — TLS 1.3 for data in transit; AES-256-GCM for data at rest (financial data and PII)
NFR8: Media privacy — incident photos protected by standard user authentication; no pre-signed URLs for MVP
NFR9: GDPR compliance — data retention policies (15-day grace, 6-month archive, permanent deletion), user data export/delete, audit trails
NFR10: Owner safeguards — destructive operations (delete org, transfer ownership) require explicit confirmation + re-authentication
NFR11: Initial capacity — support for 100 concurrent users
NFR12: Growth path — architecture designed for 10x scaling (1000+ users) without structural refactoring
NFR13: International readiness — multi-currency (EUR + MAD), architecture ready for additional currencies and languages
NFR14: Uptime target — 99.5% availability with health checks and auto-restart
NFR15: Data integrity — daily automated backups with 30-day retention to Cloudflare R2 (GDPR-compliant, off-site)
NFR16: Async resilience — reliable async job processing (BullMQ) with automatic retry and message durability
NFR17: Accessibility — WCAG 2.1 Level AA target (UX spec); shadcn/ui + Radix UI provide accessible primitives by default
NFR18: Field usability — high-contrast interface for mobile use in bright sunlight (field staff optimization)
NFR19: Touch targets — minimum 48x48px touch targets for all mobile interactive elements
NFR20: Readable typography — clear hierarchy, large text for key information on mobile; all typography in rem units respecting browser font size

### Additional Requirements

**From Architecture:**
- Polyrepo co-located repository structure — Hoxtup-api/ + Hoxtup-app/ in same Git repo, independent projects, separate hosts (Coolify VPS + Vercel)
- Frontend starter: create-next-app (Next.js 16, App Router, Turbopack, TypeScript strict, Tailwind v4, shadcn/ui)
- Backend starter: manual Express setup (Node.js 22 LTS, TypeScript strict, ESM)
- OpenAPI 3.1 contract-first development — openapi.yaml as single source of truth for API contract
- express-openapi-validator for runtime API contract enforcement
- openapi-typescript + openapi-fetch for type-safe frontend API client (auto-generated, zero manual types)
- Prisma 7 ORM with RLS via $extends for multi-tenant data isolation
- JWT auth via jose library + argon2 password hashing
- HttpOnly cookies on .hoxtup.com subdomain strategy for cross-origin auth
- RFC 7807 Problem Details for all API error responses
- EventEmitter (dispatch) → BullMQ (async execution) for notification event system
- pino + pino-http for structured JSON logging
- Docker Compose at repo root for local dev (PostgreSQL + Redis)
- Hoxtup-app deployed to Vercel (app.hoxtup.com); Hoxtup-api deployed to Coolify VPS (api.hoxtup.com)
- GitHub Actions CI/CD with separate pipelines per project
- Nodemailer + Brevo SMTP for email (300 emails/day free tier)
- PostHog for analytics (free tier)
- UptimeRobot for uptime monitoring (free)
- testcontainers for ephemeral PostgreSQL + Redis in CI integration tests
- Vitest for unit/integration tests; Playwright for E2E
- Implementation sequence: scaffolding → DB schema + Prisma + RLS → auth → API foundation → frontend foundation → feature modules
- Money stored as integers (centimes), never floats; currency code as separate column per organization
- Naming conventions: camelCase (code/JSON), snake_case (DB), kebab-case (URLs), PascalCase (components/types)
- WCAG gap to resolve: PRD says Level A, UX says Level AA — Architecture supports both (shadcn/ui accessible by default); target Level AA
- Stripe webhooks integration for subscription billing
- BullMQ workers: email, notification, iCal sync (recurring), backup (daily cron)
- Rate limiting: express-rate-limit + rate-limit-redis (Redis-backed)
- CORS whitelist: app.hoxtup.com + localhost:3000 (credentials allowed)
- Caching strategy: Redis for sessions (JWT refresh TTL), dashboard KPIs (1-5min TTL), iCal polling results (15-30min TTL)

**From UX Design:**
- Adaptive Focus Mode — context-driven interface adaptation (not a binary toggle); navigation changes based on context, explicit toggle only for dual-role users
- Dual Staff Model — Autonomous (with account, uses app) + Managed (no account, proxy-managed by Manager/Admin)
- "Tasks First + Mini-Dashboard" unified home screen — compact KPI header (3 max) followed by task list
- Zen State design — positive empty state when all tasks completed ("Tout est sous contrôle"); calm visual treatment (green tint, expanded whitespace)
- Optimistic UI with undo toast (5s) for all constructive actions; confirmation dialogs for destructive actions only
- Skeleton loading pattern — never use spinners; structured loading states mimicking layout shape
- Camera API for incident photos — photo upload/resize/storage via multipart/form-data → API → local VPS
- 14 custom components across 4 implementation phases (Phase 0: AppShell/BottomNavBar; Phase 1: TaskCard/DashboardHeader/KPIBar/TaskValidationBanner/PropertySelector/NotificationBadge; Phase 2: IncidentReportForm/ZenStateIndicator/PropertyColorDot; Phase 3: TimelineItem/PillToggle/TaskFusionSuggestion)
- Temporal dashboard adaptation — morning (unassigned tasks first), midday (alerts first), evening (summary first)
- Terra cotta CTA rule — only ONE primary action per screen uses terra cotta #a06050; secondaries use teal outline; ghosts use text only
- Offline queue for task start/complete actions — mutations queued locally, retry on network reconnect; thin amber banner "Mode hors ligne"
- Property color-coding system — 8 auto-assigned distinctive colors for visual identification across calendar and task views
- Typography: Outfit (headings, 500-600 weight) + Inter (body, 400-500 weight); self-hosted woff2 (~65ko total); font-display: swap
- 4px base spacing grid; card border-radius 8px; minimal shadows (level-1 only)
- Bottom navigation: 4 tabs for Owner/Admin (Home/Calendar/Team/More), 3 tabs for Staff (Tasks/Planning/Incident); height 56px
- Button hierarchy: Primary (solid terra cotta), Secondary (teal outline), Ghost (text-only teal), Destructive (solid red)
- Form patterns: one field per row on mobile, auto-focus first field, sticky submit button, no red asterisks
- Responsive breakpoints: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px); mobile-first CSS
- Onboarding "Time to Wow" target: 2 minutes from signup to populated calendar
- Role-based entry points: Owner/Admin → Dashboard, Staff → Next Task
- axe-core + Lighthouse for automated accessibility testing in CI/CD
- RTL readiness via logical CSS properties for future Arabic support
- prefers-reduced-motion support — all animations disabled when set
- Micro-animations: task completion checkmark (400ms spring), toast slide (200ms), tab crossfade (150ms)

### FR Coverage Map

FR1: Epic 1 - Multi-tenant self-service registration with Organization ID
FR2: Epic 1 - RBAC with 5 roles (Owner, Admin, Manager, Staff Autonomous, Staff Managed)
FR3: Epic 1 - Owner exclusive rights (delete org, transfer ownership)
FR4: Epic 1 - Admin full operational access
FR5: Epic 1 - Manager scoped access for assigned properties
FR6: Epic 1 - Staff Autonomous mobile-optimized task access
FR7: Epic 1 - Staff Managed proxy representation
FR8: Epic 1 - Secure JWT authentication with refresh tokens
FR9: Epic 2 - Manual reservation creation
FR10: Epic 2 - iCal provider integration (Airbnb/Booking.com)
FR11: Epic 2 - Configurable sync interval (15-30 min)
FR12: Epic 2 - Sync failure alerting (6+ hours)
FR13: Epic 2 - Dynamic task updates from modified iCal reservations
FR14: Epic 2 - Sync status indicator per property
FR15: Epic 3 - Task lifecycle state machine (6 states)
FR16: Epic 3 - Task Fusion Engine (turnover merge suggestions)
FR17: Epic 3 - Incident reporting (type, photo, description)
FR18: Epic 3 - Auto-generation rules from reservations
FR19: Epic 3 - Conflict detection for overlapping tasks
FR20: Epic 3 - Proxy task management with audit logging
FR21: Epic 6 - Consumable tracking (categories, entries/exits, thresholds)
FR22: Epic 6 - Mobile feedback loop (adjust consumption at task completion)
FR23: Epic 6 - Stock alert levels based on thresholds and upcoming bookings
FR24: Epic 6 - Permanent asset purchase log
FR25: Epic 6 - Asset data model (name, property, date, cost, supplier, category)
FR26: Epic 6 - No rotation tracking for assets in MVP
FR27: Epic 6 - Asset cost integration in financial reports
FR28: Epic 6 - Visual distinction consumables vs assets
FR29: Epic 8 - Subscription engine (Stripe, property-count tiers, 30-day trial)
FR30: Epic 6 - Per-property financial reporting (consumables + assets)
FR31: Epic 6 - Light accounting (revenue, expenses, cost-per-property)
FR32: Epic 2 - Property CRUD (create, view, update, archive)
FR33: Epic 2 - Property profile (photo, address, capacity, iCal, staff, reservations)
FR34: Epic 2 - iCal source management (add, remove, update per property)
FR35: Epic 2 - Property archival (soft-delete preserving history)
FR36: Epic 5 - Global calendar view (all properties)
FR37: Epic 5 - Property calendar (single property filter)
FR38: Epic 5 - Employee calendar (single staff filter)
FR39: Epic 5 - Type-filtered calendar (by task type)
FR40: Epic 5 - Calendar interactions (tap to detail, day/week/month nav)
FR41: Epic 5 - Visual encoding (color-coded by type and property)
FR42: Epic 4 - In-app notifications (real-time feed, badge count)
FR43: Epic 4 - Email notifications (configurable alerts)
FR44: Epic 4 - Notification triggers (7+ event types)
FR45: Epic 4 - Notification preferences (per type, per channel, per user)
FR46: Epic 7 - Executive dashboard (KPIs, arrivals, departures, alerts)
FR47: Epic 7 - Field staff dashboard (My Tasks Today, quick actions)
FR48: Epic 7 - Activity summary (end-of-day recap, 7-day history)
FR49: Epic 7 - Role switcher mode toggle (Manager Mode / Field Mode)
FR50: Epic 7 - Persistent mode preference per session
FR51: Epic 7 - Role switcher access control (Owner/Admin/Manager only)
FR52: Epic 1 - Translation infrastructure (zero hardcoded strings, JSON namespaces)
FR53: Epic 1 - Language selection (French at launch, user preference)
FR54: Epic 1 - i18n extensibility (new language = new JSON file only)
FR55: Epic 1 - Organization currency selection (EUR or MAD)
FR56: Epic 1 - Currency display formatting (symbol, decimal separator)
FR57: Epic 1 - Currency extensibility (config entry only)

## Epic List

### Epic 1: Foundation & Secure Access

Users can register, create their organization, invite team members with proper roles, and securely access the platform — in their language and currency.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR52, FR53, FR54, FR55, FR56, FR57

**NFRs addressed:** NFR5 (RLS multi-tenant), NFR6 (JWT auth), NFR7 (TLS + AES-256), NFR9 (GDPR), NFR10 (owner safeguards), NFR11 (100 users), NFR12 (10x growth path), NFR13 (i18n + multi-currency), NFR17 (WCAG AA), NFR18 (field usability), NFR19 (48px touch targets), NFR20 (rem typography)

**Technical scope:**
- Project scaffolding (polyrepo: Hoxtup-api + Hoxtup-app, Docker Compose, CI/CD)
- Database schema + Prisma 7 + RLS policies
- JWT auth (jose + argon2, HttpOnly cookies, refresh rotation)
- RBAC engine (5 roles with permission matrix)
- i18n infrastructure (react-i18next, JSON namespaces, French)
- Multi-currency infrastructure (EUR + MAD, integer centimes)
- App Shell (layout, BottomNavBar, DashboardHeader skeleton)
- Design system (Tailwind v4, shadcn/ui, Palette C tokens, Outfit + Inter fonts)
- OpenAPI 3.1 contract + express-openapi-validator
- Error handling (RFC 7807) + structured logging (pino)

**Dependencies:** None — foundation epic

---

### Epic 2: Property Management & Reservations

Users can create and manage their rental properties, connect them to Airbnb/Booking.com via iCal feeds, and see all reservations synchronized automatically with status indicators.

**FRs covered:** FR9, FR10, FR11, FR12, FR13, FR14, FR32, FR33, FR34, FR35

**NFRs addressed:** NFR4 (iCal sync performance), NFR2 (page load < 2s), NFR15 (daily backups)

**Technical scope:**
- Property CRUD with profile page (photo, address, capacity, type)
- Property archival (soft-delete preserving financial history)
- iCal source management (multiple sources per property)
- iCal polling worker (BullMQ recurring job, 15-30 min configurable)
- Reservation model (auto-created from iCal + manual creation)
- Dynamic task update logic (iCal changes → linked task updates)
- Sync status indicator + failure alerting (6h threshold)
- PropertySelector + PropertyColorDot components

**Dependencies:** Epic 1 (auth, org, RBAC)

---

### Epic 3: Task Management & Team Coordination

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

---

### Epic 4: Notifications & Alerts

Users are always informed when something important happens — task assignments, stock alerts, incidents, sync failures — through in-app and email notifications with per-user channel preferences.

**FRs covered:** FR42, FR43, FR44, FR45

**NFRs addressed:** NFR16 (BullMQ retry + durability), NFR14 (99.5% uptime for notification delivery)

**Technical scope:**
- EventEmitter → BullMQ notification worker pipeline
- In-app notification feed (real-time, unread badge count)
- Email notifications via Nodemailer + Brevo SMTP
- 7+ notification triggers (new reservation, task assigned, task overdue, task completed, incident reported, stock below threshold, iCal sync failure)
- Per-user notification preferences (enable/disable per type per channel)
- NotificationBadge component (red alerts, amber pending, teal info)
- Push notification deep-linking to relevant screens

**Dependencies:** Epic 1 (auth, users). Enhanced by Epic 2 (reservation events), Epic 3 (task events)

---

### Epic 5: Calendar & Scheduling

Users can visualize all operations across time with 4 calendar views (global, by property, by employee, by task type) with intuitive color-coding and day/week/month navigation.

**FRs covered:** FR36, FR37, FR38, FR39, FR40, FR41

**NFRs addressed:** NFR1 (< 200ms interaction feedback), NFR3 (< 800ms analytics queries)

**Technical scope:**
- Global calendar (all properties, all task types)
- Property calendar (single property filter)
- Employee calendar (single staff member filter)
- Type-filtered calendar (cleaning, maintenance, inspection, check-in/out)
- Day/week/month navigation with PillToggle
- Visual encoding (color-coded by task type + property color)
- Distinct treatment for pending-validation vs confirmed tasks
- TimelineItem component (chronological day view)
- Calendar interactions (tap → detail sheet)

**Dependencies:** Epic 2 (reservations) + Epic 3 (tasks)

---

### Epic 6: Inventory & Cost Management

Users can track consumable stock levels with automatic alerts, log permanent asset purchases, and see comprehensive per-property cost analysis — so they never run out of supplies and know exactly what each property costs.

**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR30, FR31

**NFRs addressed:** NFR7 (encryption for financial data), NFR13 (multi-currency in reports)

**Technical scope:**
- Consumable categories (Guest Kits, Cleaning Kits) with entries/exits tracking
- Configurable stock thresholds + automatic low-stock alerts
- Mobile feedback loop (staff adjust real consumption at task completion)
- Permanent asset purchase log (name, property, date, cost, supplier, category)
- Visual distinction: consumables (recurring) vs assets (one-time) with separate sections and icons
- Per-property financial reporting (consumable usage + asset purchases)
- Light accounting (revenue tracking, expense tracking, cost-per-property views)
- Money stored as integers (centimes) with org currency formatting

**Dependencies:** Epic 1 (auth, org, currency) + Epic 2 (properties). Enhanced by Epic 3 (Story 6.3 task completion integration) + Epic 4 (Story 6.2 notification integration)

---

### Epic 7: Dashboard & Operational Intelligence

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

---

### Epic 8: Billing & Subscription

Users can subscribe to the right plan for their portfolio size, manage their subscription, and benefit from a 30-day free trial.

**FRs covered:** FR29

**NFRs addressed:** NFR7 (encryption for financial data), NFR9 (GDPR data retention)

**Technical scope:**
- Stripe integration (webhooks, checkout sessions)
- Property-count tiers (Free 0€, Starter 69€, Pro 199€, Scale 399€, Agency custom)
- 30-day free trial with automated transition
- Subscription provisioning worker (BullMQ)
- Grace period (15 days) + data retention policy (6-month archive, permanent deletion)
- Billing settings page (current plan, usage, invoices, upgrade/downgrade)

**Dependencies:** Epic 1 (auth, org) + Epic 2 (property count for tier calculation)

---

### Dependency Graph

```text
Epic 1 (Foundation)
  ├── Epic 2 (Properties + Reservations)
  │     ├── Epic 3 (Tasks) ← uses properties + reservations
  │     │     ├── Epic 4 (Notifications) ← listens to all events
  │     │     ├── Epic 5 (Calendar) ← displays reservations + tasks
  │     │     └── Epic 7 (Dashboard) ← aggregates all data
  │     ├── Epic 6 (Inventory) ← linked to properties; enhanced by Epic 3 + Epic 4
  │     └── Epic 8 (Billing) ← property count for tiers
```
