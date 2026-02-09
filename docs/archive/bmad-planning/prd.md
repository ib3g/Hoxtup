---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments:
  - docs/brainstorm/PRD_MVP.md
  - docs/brainstorm/PRD_complet_Design_Pricing.md
  - docs/brainstorm/Design_Produit_Vision_UI_UX.md
  - docs/brainstorm/Hoxtup_Kit.md
  - docs/brainstorm/Landing_page_marketing_conversion.md
  - docs/prd.md
documentCounts:
  briefs: 0
  research: 0
  projectDocs: 6
  projectContext: 0
workflowType: 'prd'
classification:
  projectType: 'SaaS B2B - Responsive Web App + REST API'
  domain: 'Rental Operations Management (Short-Term Rentals)'
  subCategory: 'Dual-Persona Operations Platform'
  complexity: 'Medium'
  projectContext: 'Greenfield'
  personas:
    - name: 'Executive (Owner/Manager)'
      devices: 'Desktop/Tablet'
      focus: 'Analytics & Planning'
    - name: 'Field Staff (Cleaning/Maintenance)'
      devices: 'Mobile'
      focus: 'Task Execution'
  architecture:
    type: 'Monolithic Modular'
    frontend: 'Responsive Web App (single codebase)'
    backend: 'Node.js + Express'
    api: 'REST API'
    offline: 'Graceful degradation (not offline-first, no PWA)'
  differentiation:
    - 'Stock Management with Asset Tracking (competitors lack this)'
    - 'Task Fusion Engine (intelligent task merging)'
    - 'Multi-currency in-app'
    - 'Aggressive pricing (~50% cheaper than Properly)'
    - 'Initial market: Morocco (low local competition)'
  scaleMVP: '~100 concurrent users'
  scalingAmbition: 'International from day one'
  pricingCurrency: 'EUR'
  rbac:
    - role: 'Owner'
      description: 'Organization creator. Exclusive rights: delete org, transfer ownership. Delegation system planned v1.1'
    - role: 'Admin'
      description: 'Full operational access. Cannot delete org or transfer ownership (delegation planned v1.1)'
    - role: 'Manager'
      description: 'Property/staff management, task validation, view costs. No billing access'
    - role: 'Staff'
      description: 'Mobile-only assigned tasks, status updates, incident reporting'
    - role: 'Property Owner Client (Post-MVP)'
      description: 'Read-only access via shared links to their properties'
---

# Product Requirements Document - Hoxtup

**Author:** Barry
**Date:** 2026-02-06

## Executive Summary

**Vision:** Hoxtup is an all-in-one operational cockpit for short-term rental managers — replacing Excel, WhatsApp, and paper notes with a single platform that handles reservations, team coordination, stock management, asset tracking, and cost visibility.

**Target Users:** Property owners managing 1-30+ rentals, agencies, and professional hosts in the short-term rental (Airbnb, Booking.com) market. Initial launch: Morocco (Marrakech), then France and Canada.

**Differentiator:** Hoxtup is the only STR operations tool combining stock management with asset tracking, intelligent task fusion, and multi-currency support — at 50%+ lower pricing than competitors (Properly, Turno, Breezeway). No competitor offers integrated consumable + permanent asset cost-per-property visibility.

**Dual-Persona Design:** A single responsive web app serving two distinct workflows — an executive dashboard for owners/managers (analytics, planning, cost control) and a mobile-optimized task view for field staff (cleaning, maintenance, incident reporting).

**Business Model:** SaaS B2B with tiered subscription pricing per property count (Free, Starter 69 EUR, Pro 199 EUR, Scale 399 EUR, Agency custom).

## Success Criteria

### User Success

**"Aha!" Moments - When users realize Hoxtup truly works:**

1. **Instant Overview** - Opening the app and immediately seeing all tasks for the day, organized and prioritized
2. **Proactive Prevention** - Receiving stock alerts before running out, avoiding last-minute emergency shopping trips
3. **Financial Insights** - Comparing costs per property and discovering that one apartment costs 2x more in maintenance than others
4. **Perfect Synchronization** - Finding Airbnb reservations automatically in the app, without duplicates or errors
5. **Intelligent Planning** - Seeing cleaning schedule suggestions based on arrivals and departures, with smart task fusion

**Desired User Sentiment (after a few days of use):**

- *"I feel more at ease"*
- *"I don't forget anything"*
- *"I see everything"*
- *"I control my costs"*
- *"Here, everything is under control"*

**Measurable Indicators:**
- Learning time < 30 minutes for basic functions
- Key feature adoption rate > 80% after 1 week
- Team coordination time reduced by 40%+
- Zero unanticipated stock shortages

### Business Success

**3 Months After Launch (MVP Validated):**
- ✅ **10-15 paying users** (property owners/agencies)
- ✅ **20-30 properties managed** on the platform
- ✅ **Positive customer testimonials** (3+ documented testimonials)
- ✅ **Retention rate ≥ 80%** (active users after 3 months)

**6 Months After Launch (Growth Validated):**
- ✅ **50-100 active users**
- ✅ **Geographic expansion started**: France, Canada (+ Morocco)
- ✅ **Retention rate ≥ 85%**
- ✅ **NPS (Net Promoter Score) > 40**
- ✅ **MRR: 5,000-15,000 EUR**

**12 Months After Launch (Scale Confirmed):**
- ✅ **300-500 active users**
- ✅ **Presence in 3+ countries**
- ✅ **Clear path to profitability**
- ✅ **Strategic partnerships in discussion**

### Technical Success

**Performance:**
- Page load time < 2 seconds (mobile 4G)
- API response time < 200ms (p95) for CRUD operations
- API response time < 800ms (p95) for analytics queries
- Uptime ≥ 99.5% (downtime < 4h/month)

**Scalability:**
- Support for 100 concurrent users (MVP)
- Architecture ready for 1000+ users (6 months)
- Multi-tenant with data isolation

**Quality:**
- Zero data loss (daily backups)
- Graceful degradation on network loss
- Reliable iCal synchronization (configurable 15-30 min interval)

**Security:**
- HTTPS mandatory
- Secure authentication (JWT + refresh token rotation)
- Functional RBAC with Owner/Admin separation
- Sensitive data encrypted at rest

### Measurable Outcomes

**Product Metrics:**
- Activation rate: 80%+ of signups create their first property
- Daily engagement: 60%+ of users connect daily
- Feature adoption: 70%+ use Stock Management (key differentiator)
- Mobile usage: 65%+ of sessions from mobile

**Operational Metrics:**
- Task oversight reduction: 90%+
- Team coordination time: -40%
- Stock shortages avoided: 95%+
- Financial visibility: 100% of costs tracked

## Product Scope

### MVP - Minimum Viable Product (3 months)

**Essential Features:**

1. **Reservations** - Manual creation (with or without iCal) + iCal synchronization (Airbnb, Booking.com), configurable sync every 15-30 min
2. **Multi-View Calendars** - Global, by property, by employee, by type (cleaning, maintenance)
3. **Tasks & Teams** - Creation, assignment, tracking (cleaning, check-in/out, inspection, maintenance)
4. **Task Fusion Engine** - Smart detection of overlapping tasks with "Turnover" merge suggestions ⭐ (differentiator)
5. **Stock Management** - Consumables tracking (entries/exits, thresholds, automatic alerts) ⭐ (differentiator)
6. **Asset Tracking** - Permanent purchases per property (linens, furniture, equipment) — no rotation/cycle tracking, just purchase log for cost visibility
7. **Light Accounting** - Revenue, expenses, cost per property (consumables + assets combined view)
8. **Notifications** - In-app + Email
9. **Dual-Persona Dashboard** - Executive (analytics) + Field Staff (tasks)
10. **Role Switcher** - Toggle between "Manager Mode" and "Field Mode"
11. **RBAC (5 roles)** - Owner, Admin, Manager, Staff, (Property Owner Client placeholder for post-MVP)
12. **Internationalization (i18n)** - French only at launch, infrastructure ready for EN/ES/etc.
13. **Multi-Currency** - EUR + MAD at launch, system ready for additional currencies

**Note on Maintenance:**
- Integrated into **Tasks** with categorization (cleaning, maintenance, inspection, etc.)
- No separate module in MVP to accelerate launch

**MVP Exclusions:**
- Direct platform APIs (Airbnb API, Booking API)
- Client messaging
- Guest CRM
- Dynamic pricing
- Complete tax accounting
- Offline-first (graceful degradation only)
- Native apps
- PWA (simple responsive web app is sufficient for MVP)
- Commission-based billing model

**Technical Architecture (MVP):**
- **Monorepo**: Single Git repository with Hoxtup-api/ and Hoxtup-app/
- **Backend**: Node.js + Express (modular monolith)
- **Frontend**: React/Next.js (responsive web app)
- **Database**: PostgreSQL (multi-tenant with Row-Level Security)
- **API**: REST with OpenAPI documentation
- **Cache**: Redis (sessions + light caching)
- **Queue**: BullMQ (async tasks, emails, notifications)
- **i18n**: react-i18next (frontend) + i18next (backend)
  - Zero hardcoded text - all through translation keys
  - JSON files structured by namespace (common, dashboard, tasks, inventory)
- **Multi-Currency**: Configuration system with EUR + MAD, easy to add more
- **Analytics**: PostHog (free tier) for feature adoption tracking

### Growth Features (Post-MVP, 3-6 months)

**Phase 1 - Enrichment:**
1. **WhatsApp Notifications** - Tasks, incidents, critical stock (paid add-on)
2. **Advanced Reports** - PDF/Excel exports, custom analytics
3. **Integrations** - Zapier, Make.com to connect other tools
4. **Property Owner Client role** - Read-only shared links with expiration
5. **Additional Languages** - English, Spanish translations
6. **Additional Currencies** - USD, CAD, etc.

**Phase 2 - Native Mobile:**
7. **PWA** - Add manifest + service worker for installable home screen experience
8. **Native Apps** - React Native + Expo (iOS + Android)
9. **Offline-First** - Deferred synchronization for areas without network
10. **Native Push Notifications** - iOS/Android native

**Phase 3 - Scalability:**
11. **Public API** - Documented REST API for third-party integrations
12. **Multi-Organization** - Managing multiple agencies in one account
13. **Property Transfer** - Transfer properties between organizations with full history
14. **In-App Surveys** - Automated user feedback collection

### Vision (Future, 12-24 months)

**Strategic Positioning:**
- **"The ops tool that integrates everywhere"** - Simplicity and efficiency as DNA
- Native integrations with all major PMS (Guesty, Hostaway, etc.)
- Open API to become the "operational layer" of the STR industry

**Strategic Opportunities:**
- **Airbnb Partnership** - Official integration as recommended ops tool
- **Potential Acquisition** - By major player (Airbnb, Booking.com, or leading PMS)
- **Vertical Expansion** - Boutique hotels, co-living, traditional property management

**Vision Features:**
- Artificial intelligence for maintenance prediction
- Automatic schedule optimization
- Service provider marketplace (cleaning, maintenance)
- Complete accounting integration (export to accountants)
- Multi-currency with automatic conversion and tax management

## Pricing Strategy

### Pricing Model - Tiered Subscription

**Objective:** Be 50-78% cheaper than market while remaining credible and viable.

| Plan | Properties | Price/Month | Avg Price/Property | vs Market (45 EUR/property) | Savings |
|------|------------|-------------|-------------------|----------------------------|---------|
| **Free** | 1 | **Free** | 0 EUR | vs 45 EUR | **-100%** ✅ |
| **Starter** | 2-7 | **69 EUR** | 9.86-34.50 EUR | vs 90-315 EUR | **-50 to -78%** ✅ |
| **Pro** | 8-15 | **199 EUR** | 13.27-24.88 EUR | vs 360-675 EUR | **-45 to -71%** ✅ |
| **Scale** | 16-25 | **399 EUR** | 15.96-24.94 EUR | vs 720-1125 EUR | **-45 to -65%** ✅ |
| **Agency** | 26+ | **Custom** | Negotiated | Variable | Variable |

### Pricing Advantages

**1. Competitive but Credible**
- ✅ **-50 to -65%** cheaper than market
- ✅ Not "too cheap" to be suspicious
- ✅ "Value for money" positioning

**2. Viable ARR**
- Starter: 69 EUR × 12 = **828 EUR ARR/client**
- Pro: 199 EUR × 12 = **2,388 EUR ARR/client**
- Scale: 399 EUR × 12 = **4,788 EUR ARR/client**

**3. Price Psychology**
- **69 EUR** (vs 70) = strong psychological price
- **199 EUR** (vs 200) = perceived as "under 200"
- **399 EUR** (vs 400) = perceived as "under 400"

**4. Upgrade Incentive**
- More properties = better price/property
- 3 properties: 23 EUR/property (Starter)
- 10 properties: 19.90 EUR/property (Pro)
- 25 properties: 15.96 EUR/property (Scale)

## Summary

**MVP Focus:** Prove that Hoxtup eliminates operational chaos
**Growth Focus:** Become indispensable and scale geographically
**Vision Focus:** Be the global STR industry ops standard

## User Journeys

### Journey 1: Sophie - Property Owner (Discovery & Adoption)

**Persona: Sophie, 38 years old, Marrakech**

- Owner of 5 short-term rental apartments
- Currently: Excel for calendar, WhatsApp for team, paper notes for stock
- Daily stress: task oversights, stock shortages, lack of cost visibility

**The Journey**

**Opening Scene - The Trigger (Day 0)**

Sophie scrolls through Facebook after an exhausting day. She just forgot to order sheets for an apartment - the guest arrives in 2 hours. Between posts, a Hoxtup ad appears: *"Manage your short-term rentals stress-free. 1 property free for life."*

She clicks. The landing page is clear: *"Try free with 1 property. No credit card required."* Sophie thinks: *"Why not? It's free."*

**Rising Action - First Contact (Day 1, 10:00 AM)**

Sophie signs up in 2 minutes. Email, password, done. She becomes the **Owner** of her new organization. The app asks: *"How many properties do you manage?"* She answers: 5. A message displays: *"Start with 1 free property. Add the others when you're ready."*

**First action**: Create her first property. Simple form: name, address, capacity. Then a question: *"Do you have an iCal link (Airbnb, Booking.com)?"* She pastes her Airbnb link. In 10 seconds, 12 reservations appear in the calendar.

**Auto-Generated Tasks - Validation Required**

A notification appears: *"12 tasks auto-generated from your reservations. Please validate."*

Sophie sees a dashboard section "Tasks to Validate":

- Cleaning Riad Zitoun - Feb 8, 2:00 PM (auto-generated from Airbnb reservation)
- Inspection Appt Gueliz - Feb 10, 11:00 AM (auto-generated from departure)

Each task has visual distinction (yellow background, bell icon, dotted on calendar). She can:

- Validate (task integrated, team notified)
- Modify (adjust time, assignment)
- Cancel (task deleted)

Sophie validates the first 5 tasks. They instantly integrate into the calendar with solid lines. Her assigned staff receives notifications.

**The "Wow" Moment (Day 1, 10:05 AM)**

Sophie looks at the screen. The calendar is **clear**, reservations are **well-presented** with soft colors. No buttons everywhere. Just the essentials: calendar, tasks, stock. **Clear visuals**, understandable icons.

She thinks: *"This is exactly what I needed. Not complicated, just effective."*

**Resolution - New Reality (Week 1)**

Sophie adds her 4 other properties. She upgrades to **Starter plan (69 EUR/month)**. She configures stock thresholds (sheets, towels, cleaning products). She also logs her permanent assets (coffee machine, iron, furniture) per property. She receives her first alert: *"Sheets stock: 3 remaining (threshold: 5)"*. She orders before running out.

For the first time in months, Sophie ends her week **at ease**. She sees everything. She controls everything. She forgets nothing.

---

### Journey 2: Karim - Agency Manager (Team Coordination)

**Persona: Karim, 45 years old, Casablanca**

- Manager of an agency managing 20 properties for 8 owners
- Team: 5 employees (3 cleaning, 2 maintenance)
- Challenge: coordinate team, avoid oversights, reassure owners
- Role: **Admin** (the agency founder is the **Owner**)

**The Journey**

**Start of Day (8:00 AM - Dashboard)**

Karim opens Hoxtup on his laptop. The **dashboard** displays:

- **Clear and organized view**: Tasks today (12), Arrivals (5), Departures (3), Alerts (1)
- **Visible notifications**: Red badge on "Alerts" - Fatima reported a dish soap shortage
- **Task Fusion suggestion**: *"Riad Zitoun: Departure 11h + Arrival 14h → Merge into Turnover task?"*

He clicks on the alert. Detailed notification: *"Riad Zitoun Property - Dish soap missing - Reported by Fatima at 7:45 AM"*. Karim mentally notes: order today.

He accepts the Turnover fusion → one combined task instead of two, optimizing Fatima's schedule.

**Task Assignment (8:15 AM)**

Karim goes to the calendar. He sees 3 departures today = 3 cleanings to do. He clicks on the first task "Cleaning Riad Zitoun - 10:00 AM". A menu displays: *"Assign to..."* with his team list. He selects **Fatima**.

Fatima instantly receives an in-app + email notification: *"New task: Cleaning Riad Zitoun - 10:00 AM"*.

Karim repeats for the 2 other properties. In 5 minutes, the entire team knows what to do.

**Incident Management (11:30 AM)**

**Alert** notification on Karim's app: *"Stock shortage - Dish soap - Riad Zitoun"*. He also receives an **email**. He opens the app, sees the detail, orders the product online, and marks the alert as "Processed".

**End of Day (6:00 PM - Reporting)**

Karim returns to the dashboard. A **"Today's Activity"** section summarizes:

- 12 tasks completed / 12
- 5 arrivals managed
- 1 alert processed
- Today's costs: 450 MAD (cleaning + products)

Karim closes the app, **satisfied**. Everything is under control.

---

### Journey 3: Fatima - Field Staff (Mobile Execution)

**Persona: Fatima, 28 years old, Marrakech**

- Cleaning employee at Karim's agency
- Does 3-4 properties per day
- Uses only her smartphone (Hoxtup bookmarked on home screen)
- Role: **Staff**

**The Journey**

**Morning (7:30 AM - Tasks View)**

Fatima opens Hoxtup on her phone. The screen displays: **"My Tasks Today"**.

A **clear list** with **visuals**:

```
┌────────────────────────────────────┐
│ My Tasks - Thursday Feb 6          │
├────────────────────────────────────┤
│ [Riad Photo] Cleaning - Riad Zitoun│
│ 10:00 AM - 11:30 AM               │
│ [Start] [Details]                  │
├────────────────────────────────────┤
│ [Appt Photo] Cleaning - Appt Gueliz│
│ 2:00 PM - 3:30 PM                 │
│ [Start] [Details]                  │
└────────────────────────────────────┘
```

Fatima sees **the property image**, the time, and two clear buttons. No confusion.

**Arrival at Property (10:00 AM)**

Fatima arrives at Riad Zitoun. She takes out her phone, clicks **"Start"**. The status changes to "In Progress". She does her work: cleaning, checking, organizing.

**Problem Discovery (10:45 AM)**

Fatima opens the cupboard: **no more dish soap**. She doesn't handle this - she knows **Karim already received the info** (automatic alert sent when stock went below threshold yesterday).

**Incident Reporting (Alternative Scenario: Broken Equipment)**

While cleaning, Fatima discovers the coffee machine is broken. She clicks **"Report Problem"** button in the task. A quick form appears:

- Problem type: [Dropdown] Equipment / Stock / Other
- Description: [Optional text] "Coffee machine broken"
- Photo: [Optional] Takes a photo of the machine
- [Send Report]

Karim instantly receives an **alert notification**: *"Incident - Equipment - Riad Zitoun - Reported by Fatima"* with the photo attached.

**Task Completion (11:25 AM)**

Fatima is done. She clicks **"Mark Complete"**. A confirmation displays: *"Task completed! Next task: Appt Gueliz at 2:00 PM"*.

Karim receives a notification: *"Fatima completed: Cleaning Riad Zitoun"*.

Fatima puts away her phone and goes to lunch. **Simple. Effective.**

---

### Journey 4: Ahmed - Property Owner Client (Agency Customer) - Post-MVP

**Persona: Ahmed, 42 years old, Marrakech**

- Owner of 3 apartments managed by Karim's agency
- Wants visibility on his properties without managing operations
- Needs monthly reports for his accountant

**The Journey (Post-MVP Feature)**

**Receiving Shared Access (Day 1)**

Ahmed receives an email from Karim: *"View your 3 properties on Hoxtup - Secure link (expires in 6 months)"*.

He clicks the link. No login required. A page opens: **"Shared View - 3 Properties"**.

**Exploring His Properties**

Ahmed sees:

- **Calendar** (read-only): All reservations for his 3 apartments
- **Revenue & Costs** (read-only): Monthly breakdown per property
- **Tasks** (read-only): Cleaning, maintenance scheduled

He can filter by property, export PDF reports, but cannot create tasks or modify anything.

**Monthly Reporting (End of Month)**

Ahmed clicks **"Export Monthly Report"**. A PDF generates with:

- Revenue per property
- Costs (cleaning, maintenance, products)
- Occupancy rate
- Net profit

He sends this to his accountant. **Perfect transparency** without operational burden.

---

### Journey 5: Barry - Super-Admin (Platform Monitoring)

**Persona: Barry, Hoxtup Creator**

- Manages the platform, tracks adoption metrics
- Needs: analytics, user support, monitoring

**The Journey**

**Daily Monitoring (9:00 AM - PostHog Dashboard)**

Barry opens PostHog (analytics). He sees:

- **Active users** this week
- **Feature adoption**: Stock Management usage %
- **Retention rate** tracking

He notices a signup spike yesterday. He checks: Morocco Facebook campaign performed well.

**User Support (2:00 PM - Email)**

Barry receives an email: *"How do I add an employee?"*. He responds in 5 minutes with a link to docs + tutorial video.

He mentally notes: add an in-app tooltip for this feature.

**Custom Admin Dashboard (Post-MVP, developed later)**

Eventually, Barry develops a custom admin dashboard in Hoxtup with:

- Business metrics (ARR, MRR, churn)
- Feature adoption by cohort
- User support tickets
- Platform health monitoring

---

## Journey Requirements Summary

### Capabilities Revealed by User Journeys

**From Sophie's Journey (Property Owner):**

- Simple onboarding (quick signup, no credit card for Free plan)
- Intuitive property creation
- Automatic iCal import (Airbnb, Booking.com)
- **Auto-generated tasks with validation workflow** (pending status, visual distinction, dashboard alert section)
- Clear visual interface, not overloaded
- Automatic stock alerts
- Asset purchase logging per property
- Easy upgrade (Free → Starter)

**From Karim's Journey (Agency Admin):**

- Executive dashboard with overview
- **Task Fusion suggestions** (merge overlapping tasks into Turnover)
- Visible notifications (badge, alerts)
- Simple task assignment (click task → assign)
- Multi-channel notifications (in-app + email)
- Daily activity summary

**From Fatima's Journey (Field Staff):**

- Mobile-optimized "My Tasks" view (responsive web app)
- Clear visuals (property photo, schedules)
- Quick actions (Start, Complete)
- **Incident reporting** (Problem type dropdown, description, photo, instant alert to manager)
- No unnecessary complexity
- Real-time notifications to manager

**From Ahmed's Journey (Property Owner Client) - Post-MVP:**

- Temporary shared links (no account required)
- Read-only access (calendar, revenue, costs, tasks)
- PDF export capability
- Automatic expiration

### Multi-Tenant Architecture & RBAC

**Flexible Hierarchy Model:**

```
Organization (main account)
├── Role: Owner (organization creator, exclusive destructive rights)
├── Role: Admin (full ops access, delegated rights from Owner)
├── Role: Manager (property/staff management)
├── Role: Staff - Autonomous (field workers with account, mobile-optimized)
├── Role: Staff - Managed (field workers without account, proxy-managed by Manager/Admin)
└── Role: Property Owner Client (Post-MVP, read-only shared links)
```

**Owner vs Admin - Key Distinction:**

| Action | Owner | Admin | Manager | Staff |
|--------|-------|-------|---------|-------|
| Delete organization | ✅ Exclusive | ❌ (unless delegated) | ❌ | ❌ |
| Transfer ownership | ✅ Exclusive | ❌ (unless delegated) | ❌ | ❌ |
| Delegate admin rights | ✅ | ❌ | ❌ | ❌ |
| Manage billing | ✅ | ✅ | ❌ | ❌ |
| Manage properties | ✅ | ✅ | ✅ (assigned) | ❌ |
| Manage staff | ✅ | ✅ | ✅ (their team) | ❌ |
| Assign/validate tasks | ✅ | ✅ | ✅ | ❌ |
| Execute tasks | ✅ | ✅ | ✅ | ✅ (own tasks) |
| Proxy task management | ✅ | ✅ | ✅ (their team) | ❌ |
| Report incidents | ✅ | ✅ | ✅ | ✅ |
| View analytics | ✅ | ✅ | ✅ (limited) | ❌ |
| View costs | ✅ | ✅ | ✅ (assigned properties) | ❌ |

**Possible Scenarios:**

**Scenario 1: Agency with Owner-Clients**

- Agency Owner creates the organization
- Assigns Admin role to operations manager (Karim)
- Owner-clients access via temporary shared links (Post-MVP)

**Scenario 2: Owner with Collaborators (no agency)**

- Owner has full access
- Can invite Managers and Staff
- Flexible team structure

### Task Creation Rules

**Dual Task Creation System:**

- **Auto-Generated Tasks**: Created automatically from reservations (arrivals, departures)
- **Manual Tasks**: Created manually by any authorized user (Owner, Admin, Manager)

**Task Fusion Engine (MVP):**

- System detects overlapping tasks on same property (e.g., departure 11h + arrival 14h)
- Suggests "Turnover" merge: combine cleaning + preparation into single task
- User always has final say (accept fusion, keep separate, or modify)

**Conflict Detection:**

- System checks for existing tasks on the same time slots
- Alert displayed if conflict detected: *"Warning: Task already exists for this property at this time"*
- User can choose to: Create anyway, Adjust time slot, or Cancel creation

**Validation Workflow (Auto-Generated Tasks Only):**

- Auto-generated tasks require validation before integration
- Manual tasks are immediately integrated (no validation needed)

## Domain-Specific Requirements

### Compliance & Regulatory

- **Internal Compliance**: GDPR-compliant data handling for clients and their guests' booking data (encryption at rest, strictly isolated storage).
- **Data Residency**: Infrastructure designed to handle international scalability (Morocco, France, Canada).
- **Audit Logging**:
  - **Account-Level Activity**: Detailed logs of actions within an organization (task changes, property edits, assignments).
  - **Platform-Level Logs**: Super-admin visibility into platform health, signup trends, and security events.

### Technical Constraints & Security

- **Strict Multi-Tenancy**: Data isolation via PostgreSQL Row-Level Security (RLS) to prevent any data leakage between organizations.
- **Security Standards**: HTTPS-only communication, secure authentication (JWT with refresh rotation), and sensitive financial data encryption.
- **Availability**: 99.5% uptime target with proactive monitoring via Sentry and automated backup systems (daily backups with 30-day retention).

### Operational Intelligence (Task Engine)

- **Task Automation**: Flexible auto-generation engine per property (Cleaning before arrival, after departure, or both).
- **Task Fusion Engine**: Smart detection of overlapping auto-generated tasks with "Turnover" suggestions (e.g., merging back-to-back cleaning into a single task).
- **Conflict Management**: Alert when tasks overlap on same property/time slot with user-driven resolution.
- **Notifications**: In-app + Email for MVP. Responsive web app accessible via mobile browser. No native push or PWA until post-MVP.
- **Dynamic Dashboard**: Auto-refresh mechanism to update task statuses and alerts periodically without manual page reloads.

### Inventory & Stock Management

- **Consumables Tracking**:
  - Products with finite lifespan (cleaning products, guest amenities, toiletries)
  - Entries (purchases, restocking), Exits (consumption, waste)
  - Threshold-based automatic alerts
  - Manual stock adjustments by staff at task completion (e.g., "used 2 soap bars")
  - *Task Bundles (standardized auto-deduction per task type) deferred to v1.1*

- **Permanent Asset Tracking (PAP)**:
  - Durable items purchased once (linens, furniture, appliances, equipment)
  - Simple purchase log: item, property, date, cost, supplier (optional)
  - No rotation/cycle tracking — just "what was bought, for which property, at what cost"
  - Enables cost-per-property analysis including both consumables and assets
  - Clear visual distinction from consumables in the UI

- **Reporting**: Detailed cost allocation per property combining consumable usage and asset purchases.

### Financials & Integration

- **Stripe Integration (MVP)**: Automated subscription management for the tiered pricing model, including a 30-day free trial on onboarding.
- **iCal Reliability**: Configurable sync interval (15-30 min), automated retry-loops, failure alerts after 6 hours of sync loss, and transparent sync logs visible to user.
- **Multi-Currency System**: Native support for EUR and MAD in the MVP, architected for easy multi-currency expansion.

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Task Fusion Engine (MVP)**

Hoxtup doesn't just list tasks. It analyzes overlapping schedules (e.g., departure at 11h, arrival at 14h) and suggests intelligent task fusion into a single "Turnover" task. User always has final say.

Value: Drastic reduction in planning noise and scheduling errors.

**2. Hybrid Stock System with Asset Tracking (MVP)**

Global organization-level stock simplifies purchasing, while consumption is tracked per property via manual staff adjustments at task completion. Task Bundles (auto-deduction per task type) planned for v1.1. Permanent assets are tracked separately with a simple purchase log — enabling full cost-per-property visibility without granular inventory overhead.

Value: Financial visibility per property without manual inventory burden.

**3. Predictive Validation Workflow (MVP)**

Tasks are anticipated via iCal but remain in "Pending" state (visually distinct) until human validation. This enables safe automation that avoids unnecessary notifications to field staff.

**4. AI-Assisted Scheduling (Post-MVP Vision)**

AI optimization of schedules and task assignment based on staff geolocation, skills, and workload. Designed as a decision-aid, not a black box.

### Validation Approach

- **Coordination time**: Track reduction target of -40%.
- **Task validation rate**: Measure % of auto-generated tasks accepted without modification (target: 80%).
- **Stock accuracy**: Gap between tracked stock and actual stock during physical inventory.

### Risk Mitigation

- **Fallback Task Engine**: If auto-fusion causes issues, users can always create simple manual tasks.
- **Simplicity first**: AI must be a direct decision-aid, never a black box.

## SaaS B2B Specific Requirements

### Project-Type Overview

Hoxtup is a multi-tenant SaaS platform optimized for property managers and owners, focusing on operational efficiency and financial transparency.

### Technical Architecture Considerations

- **Authentication**: Standard JWT-based authentication (Email/Password). Social Login (Google) planned as a secondary phase.
- **API Strategy**: REST API with integrated Swagger/OpenAPI documentation to ensure professional standards and future interoperability.
- **Database**: PostgreSQL with Row-Level Security (RLS) to ensure absolute tenant isolation.

### Tenant Onboarding & Lifecycle

- **Self-Service Onboarding**: Fully automated registration and setup process.
- **Provisioning Worker**: Automated background processes (via BullMQ) to pre-configure account defaults (test properties, stock categories) upon Stripe payment validation.
- **Interactive Checklist**: Step-by-step onboarding guide to drive user activation (e.g., "Step 1: Add Property", "Step 2: Connect iCal").
- **Data Retention Policy**:
  - **Grace Period**: 15 days of read-only access after subscription cancellation.
  - **Archive**: 6 months in cold storage to facilitate "Win-back" strategies.
  - **Deletion**: Permanent deletion after the 6-month archival period.

### Implementation Considerations

- **Monitoring**: PostHog integration to track funnel progression during onboarding and identify friction points.
- **Security Audit**: Automated testing for JWT integrity and tenant isolation (preventing Cross-Tenant IDOR).

## Functional Requirements & Capabilities

### 1. Identity & Access Management (IAM)

- **Multi-Tenant Onboarding**: Self-service registration flow creating a unique Organization ID.
- **Role-Based Access Control (RBAC) - 5 Roles**:
  - **Owner**: Organization creator. Exclusive rights: delete organization, transfer ownership, delegate specific rights to Admin. Full access to everything.
  - **Admin**: Full operational access (properties, staff, tasks, analytics, billing). Cannot delete org or transfer ownership unless explicitly delegated by Owner.
  - **Manager**: Property/staff management for assigned properties, task validation, cost viewing. No billing access.
  - **Staff**: Two operational modes supported:
    - **Autonomous Staff** (with account): Mobile-optimized view of assigned tasks, status updates, incident reporting.
    - **Managed Staff** (without account): No app access required. Represented as a staff profile in the organization. Manager/Admin handles all task status updates and actions on their behalf. Staff is informed of assignments through external channels (phone, in-person, WhatsApp outside app).
  - **Property Owner Client (Post-MVP)**: Read-only access via shared links to specific properties.
- **Owner Delegation System (v1.1)**: Owner can selectively delegate exclusive rights (delete org, transfer ownership) to specific Admins. Delegation is revocable at any time. *Deferred from MVP to reduce permission logic complexity.*
- **Secure Authentication**: Token-based login with automatic credential refresh and persistent sessions.

### 2. Property & Reservation Engine (PRE)

- **Manual Reservation Creation**: Users (Owner, Admin, Manager) can create reservations manually — essential for direct bookings, phone reservations, or users who don't use Airbnb/Booking.com. Fields: guest name (optional), check-in date/time, check-out date/time, property, notes. Manual reservations follow the same task auto-generation rules as iCal-imported ones.
- **iCal Provider Integration**: One-way sync from Airbnb/Booking.com.
- **Configurable Sync Interval**: User-adjustable between 15-30 minutes.
- **Failure Alerting**: Alert if sync fails for more than 6 hours (avoids false positives from temporary iCal provider delays).
- **Dynamic Updates**: If an iCal reservation is modified, linked tasks in `PENDING` or `TODO` are automatically updated.
- **Sync Status Indicator**: "Last sync: X min ago" display per property + failure alert if sync has been down for 6+ hours. *Full sync log history deferred to v1.1.*

### 3. Task Management System (TMS)

- **Task Lifecycle**: States: `Pending Validation`, `To Do`, `In Progress`, `Completed`, and `Incident`.
- **Task Fusion Engine**: Auto-detection of overlapping tasks with "Turnover" merge suggestions. User-driven acceptance.
- **Incident Reporting**: Staff can flag `Incident` with mandatory feedback (photos/text) for the manager.
- **Auto-Generation Rules**: Configurable cleaning rules per property (Before Arrival / After Departure / Turnover).
- **Conflict Detection**: Alert on overlapping tasks for same property/time slot.
- **Proxy Task Management**: Owner, Admin, and Manager can update task status (start, complete, report incident) on behalf of any assigned staff member — for past, current, and future tasks. This includes retroactively completing overdue tasks that were not updated in time. This enables management of tasks assigned to Managed Staff (no account) and covers scenarios where Autonomous Staff cannot access the app. All proxy actions are logged with the acting user, the assigned staff member, and the actual completion timestamp for audit purposes.

### 4. Inventory & Consumable Tracking (INC)

- **Consumable Tracking**: Managed categories - "Guest Kits" (coffee, sugar, water) and "Cleaning Kits" (soap, shampoo, cleaning products).
- **Mobile Feedback Loop**: Staff can adjust real consumption at task completion (e.g., "only 1 water used").
- **Alert Levels**: Automatic low-stock warnings based on thresholds and upcoming bookings.

### 5. Permanent Asset Management (PAP)

- **Asset Purchase Log**: Track durable purchases per property (linens, furniture, appliances, equipment).
- **Data Model**: Item name, property, purchase date, cost, supplier (optional), category.
- **No Rotation Tracking**: Assets are logged once at purchase — no wash cycle or depreciation tracking in MVP.
- **Cost Integration**: Asset costs appear in per-property financial reports alongside consumable costs.
- **Visual Distinction**: Consumables (recurring) and assets (one-time purchases) displayed in separate sections with distinct icons and color coding. Users can identify item type at a glance.

### 6. Billing & Finance (BF)

- **Subscription Engine**: Automated subscription billing based on property count tiers (Free, Starter, Pro, Scale, Agency).
- **Financial Reporting**: Per-property cost analysis combining consumable usage and asset purchases.
- **Light Accounting**: Revenue tracking (manual or import), expense tracking, cost-per-property views.

### 7. Property Management (PM)

- **Property CRUD**: Owner, Admin, and Manager can create, view, update, and archive properties. Required fields: name, address, capacity, property type.
- **Property Profile**: Each property displays a summary (photo, address, capacity, linked iCal sources, assigned staff, active reservations count).
- **iCal Source Management**: Users can add, remove, or update iCal feed URLs per property. Each property supports multiple iCal sources.
- **Property Archival**: Properties can be archived (soft-delete) rather than permanently deleted, preserving historical data for financial reports.

### 8. Calendar System (CS)

- **Global Calendar View**: Displays all reservations and tasks across all properties in a single timeline.
- **Property Calendar**: Filtered view showing reservations and tasks for a single property.
- **Employee Calendar**: Filtered view showing all tasks assigned to a specific staff member.
- **Type-Filtered Calendar**: Filter by task type (cleaning, maintenance, inspection, check-in/out).
- **Calendar Interactions**: Tap/click on an event opens detail view. Navigation by day, week, and month.
- **Visual Encoding**: Color-coded events by type (reservation, cleaning, maintenance, incident). Distinct visual treatment for pending-validation vs confirmed tasks.

### 9. Notification Engine (NE)

- **In-App Notifications**: Real-time notification feed accessible from any screen. Badge count for unread notifications.
- **Email Notifications**: Configurable email alerts for critical events (new reservation, task assigned, incident reported, stock alert).
- **Notification Triggers**: New reservation (iCal or manual), task assigned, task overdue, task completed, incident reported, stock below threshold, iCal sync failure (6+ hours).
- **Notification Preferences**: Users can enable/disable specific notification types per channel (in-app, email). Configurable at the user level.

### 10. Dashboard (DB)

- **Executive Dashboard** (Owner, Admin, Manager): Today's overview — arrivals, departures, active tasks, alerts count. KPIs: tasks completed rate, stock alerts, costs this period. Quick-access to pending validations and unresolved incidents.
- **Field Staff Dashboard**: "My Tasks Today" — ordered list of assigned tasks with property photo, time, and status. Next task highlighted. Quick-action buttons (Start, Complete, Report Problem).
- **Activity Summary**: End-of-day recap showing completed tasks, processed alerts, and daily cost total. Available for current day and previous 7 days.

### 11. Role Switcher (RS)

- **Mode Toggle**: Users with dual roles (e.g., Manager who also does field work) can switch between "Manager Mode" (executive dashboard, analytics, assignment) and "Field Mode" (task list, quick actions).
- **Persistent Preference**: Last selected mode is remembered per session. Defaults to role-appropriate mode on login.
- **Access Control**: Mode toggle only available to users whose RBAC role grants access to both views (Owner, Admin, Manager). Staff users see Field Mode only.

### 12. Internationalization (i18n)

- **Translation Infrastructure**: All user-facing text served via translation keys (zero hardcoded strings). JSON translation files organized by namespace (common, dashboard, tasks, inventory, settings).
- **Language Selection**: French at launch. User-level language preference stored in profile settings.
- **Extensibility**: Adding a new language requires only adding a new JSON translation file — no code changes. Backend error messages and email templates also internationalized.

### 13. Multi-Currency (MC)

- **Organization Currency**: Each organization selects a primary currency during onboarding (EUR or MAD at launch).
- **Currency Display**: All financial data (revenue, expenses, cost-per-property) displayed in the organization's currency with proper formatting (symbol, decimal separator).
- **Extensibility**: Adding a new currency requires only a configuration entry (symbol, code, formatting rules) — no schema changes.

### Interaction Matrix & State Definitions

| Entity | State | Logic / Rule |
| :--- | :--- | :--- |
| **Task** | `INCIDENT` | Triggered by staff; sends immediate notification to Manager/Admin. |
| **Task** | `PENDING_VALIDATION` | Default for auto-gen tasks. Requires manager review. |
| **Task** | `FUSION_SUGGESTED` | Auto-detected overlap. Displayed as suggestion, user accepts or rejects. |
| **Stock** | `LOW_STOCK` | Calculated from current stock vs configured threshold. |
| **Asset** | `LOGGED` | Recorded at purchase. Appears in cost reports. |

## Non-Functional Requirements

### Performance

- **UI Responsiveness**: < 200ms for visual feedback on user interactions.
- **Page Load Time**: < 2 seconds on 4G mobile networks.
- **API Latency**: P95 < 200ms for standard CRUD operations; < 800ms for analytical dashboard queries.
- **iCal Sync**: Configurable 15-30 min interval. Failure alert after 6 hours.

### Security

- **Multi-Tenant Isolation**: Strict logical data separation with row-level tenant isolation.
- **Authentication**: Secure token-based authentication with automatic credential refresh.
- **Data Protection**: TLS 1.3 for data in transit; AES-256 for data at rest (financial data and PII).
- **Media Privacy**: Incident photos protected by standard user authentication; no pre-signed URLs or complex encryption for MVP.
- **Compliance**: GDPR-compliant handling of personal and reservation data.
- **Owner Safeguards**: Destructive operations (delete org, transfer ownership) require explicit confirmation + re-authentication.

### Scalability

- **Initial Capacity**: Support for 100 concurrent users.
- **Growth Path**: Architecture designed to scale 10x (1000+ users) without structural refactoring.
- **International Readiness**: System architected for multi-currency (MAD, EUR) and future multi-language support.

### Reliability & Availability

- **Uptime**: Target of 99.5% availability.
- **Data Integrity**: Daily automated backups with 30-day retention.
- **Async Resilience**: Reliable async job processing with automatic retry and message durability in case of partial service failure.

### Accessibility

- **WCAG Compliance**: WCAG 2.1 Level A (solid baseline, not overengineered for MVP).
- **Field Usability**: High-contrast interface for mobile use in bright sunlight (field staff optimization).
- **Touch Targets**: Minimum 48px touch targets for mobile interactions.
- **Readable Typography**: Clear hierarchy, large text for key information on mobile.
