---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
lastStep: 8
status: 'complete'
completedAt: '2026-02-07'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/brainstorm/Hoxtup_Kit.md
  - docs/brainstorm/Design_Produit_Vision_UI_UX.md
workflowType: 'architecture'
project_name: 'Hoxtup'
user_name: 'Barry'
date: '2026-02-07'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (13 Modules):**

| # | Module | Code | Architectural Implications |
|:---|:---|:---|:---|
| 1 | Identity & Access Management | IAM | Multi-tenant onboarding, RBAC 5 roles, JWT + refresh rotation, Owner delegation (v1.1) |
| 2 | Property & Reservation Engine | PRE | iCal sync (polling 15-30min), manual CRUD, dynamic task updates on reservation changes |
| 3 | Task Management System | TMS | State machine (6 states), Fusion Engine, proxy management, conflict detection, audit logging |
| 4 | Inventory & Consumable Tracking | INC | Threshold alerts, mobile feedback loop, managed categories |
| 5 | Permanent Asset Management | PAP | Purchase log per property, cost integration, visual distinction consumables vs assets |
| 6 | Billing & Finance | BF | Polar integration (MoR — Merchant of Record handles TVA/invoicing), tiered by property count, cost-per-property analysis |
| 7 | Property Management | PM | CRUD, archival (soft-delete), profile with photo/iCal/staff |
| 8 | Calendar System | CS | 4 views (Global/Property/Employee/Type), color-coding, tap/nav interactions |
| 9 | Notification Engine | NE | In-app + Email, 7+ triggers, per-user per-channel preferences |
| 10 | Dashboard | DB | Executive + Field + Activity Summary, temporal adaptation (morning/midday/evening) |
| 11 | Role Switcher | RS | Mode toggle Manager/Field, persistent preference |
| 12 | Internationalization | i18n | French at launch, zero hardcoded text, JSON by namespace |
| 13 | Multi-Currency | MC | EUR + MAD, local formatting, extensible without schema changes |

**Non-Functional Requirements:**

| Category | Requirement | Architectural Impact |
|:---|:---|:---|
| Performance | Page load < 2s (4G mobile) | Single "home feed" endpoint, server-side aggregation, bundle optimization |
| Performance | API CRUD p95 < 200ms | PostgreSQL indexing, Redis cache, optimized queries |
| Performance | Analytics p95 < 800ms | Materialized views or pre-computation, Redis cache for KPIs |
| Security | PostgreSQL RLS | Middleware tenant injection, RLS policies per table |
| Security | JWT + refresh rotation | Token service, secure cookies, automatic rotation |
| Security | AES-256 at rest (PII + finance) | Application-level or database-level encryption |
| Security | GDPR | Data retention policies, user data export/delete, audit trails |
| Scalability | 100 → 1000+ users | Modular monolith ready for service extraction |
| Reliability | 99.5% uptime | Health checks, graceful shutdown, auto-restart |
| Reliability | Daily backups 30d retention | Automated pg_dump or managed DB snapshots |

**UX-Driven Architectural Requirements:**

- Optimistic UI — Client-side action queue with server reconciliation pattern
- Undo Toast (5s) — Reversible actions require soft-apply mechanism or delay queue
- Temporal Dashboard — Content adapts based on time of day (morning/midday/evening)
- Skeleton Loading — Structured loading states, never spinners
- Camera API — Incident photo upload/storage, resize, access protection
- 14 Custom Components — Progressive development strategy across 4 phases with Storybook
- Offline Queue — Task start/complete actions queue locally, sync on reconnect

### Scale & Complexity

| Indicator | Level | Justification |
|:---|:---|:---|
| Multi-tenancy | High | PostgreSQL RLS, strict isolation, RBAC 5 roles with Owner/Admin distinction |
| Real-time | Medium | No WebSocket in MVP — polling/auto-refresh, email notifications |
| Integrations | Medium | iCal (polling), Polar (webhooks, MoR), PostHog (SDK), email (SMTP/service) |
| User Interaction | High | Dual persona, proxy batch management, Task Fusion Engine, 4 calendar views |
| Data Complexity | High | 13 interconnected modules, task state machine, cross-entity relationships |
| Compliance | Medium | GDPR, audit logging, data retention policies |

- Primary domain: Full-stack web (responsive, mobile-first)
- Complexity level: High
- Estimated architectural components: 13 functional + 5-6 cross-cutting

### Technical Constraints & Dependencies

- Polyrepo co-located: Hoxtup-api/ + Hoxtup-app/ (same Git repo, independent projects, separate hosting)
- Backend: Node.js + Express (modular monolith)
- Frontend: React/Next.js (responsive web app)
- Database: PostgreSQL with Row-Level Security
- Cache: Redis (sessions + light caching)
- Queue: BullMQ (async tasks, emails, notifications)
- API: REST with OpenAPI 3.1 specification (contract-first, source of truth for type generation)
- Design System: Tailwind CSS + shadcn/ui (Radix UI primitives)
- i18n: react-i18next (frontend) + i18next (backend)
- Analytics: PostHog (free tier)
- Billing: Polar (Merchant of Record — handles TVA, invoicing, compliance)
- WCAG 2.1 Level AA accessibility target

### Cross-Cutting Concerns Identified

1. **Multi-tenancy** — Every request must resolve tenant context. RLS on every table. Zero data leakage between organizations
2. **RBAC** — Every endpoint verifies role. Fine-grained Owner vs Admin distinction. Autonomous vs Managed Staff
3. **Audit Logging** — Proxy actions logged (who, on behalf of whom, when). Complete task lifecycle tracking
4. **i18n** — Backend (errors, emails) + Frontend (UI). Zero hardcoded text
5. **Multi-Currency** — Formatting, symbols, decimal separators per organization
6. **Notification Engine** — 7+ triggers distributed across all modules → internal event bus or Observer pattern needed
7. **Optimistic UI + Offline Queue** — Unified client-side pattern for all constructive/destructive actions

## Starter Template Evaluation

### Repository Structure

**Polyrepo co-located** — Two independent projects in one Git repository, deployed to separate hosts:

```
hoxtup/
├── Hoxtup-api/              ← Node.js + Express (Host A)
│   ├── package.json
│   ├── tsconfig.json
│   ├── openapi.yaml          ← API contract (source of truth)
│   └── src/
├── Hoxtup-app/              ← Next.js (Host B)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   └── src/generated/api/    ← Auto-generated types from OpenAPI
├── .gitignore
├── .env.example
└── README.md
```

**Type synchronization:** `openapi-typescript` generates frontend TypeScript types from `Hoxtup-api/openapi.yaml`. Zero build-time coupling between projects.

**API client:** `openapi-fetch` provides a type-safe HTTP client auto-generated from the OpenAPI spec — no manual type maintenance.

**API contract enforcement:** `express-openapi-validator` middleware ensures API responses match the OpenAPI spec at runtime — divergence breaks immediately.

### Primary Technology Domain

Full-stack web application (responsive, mobile-first) with independent frontend and backend deployments.

### Starter Options Considered

| Option | Evaluated | Verdict |
|:---|:---|:---|
| Turborepo monorepo | Researched | Rejected — projects deploy to separate hosts, no shared build needed |
| pnpm workspaces | Researched | Rejected — adds coupling without benefit for independent projects |
| Polyrepo co-located + OpenAPI types | Researched | Selected — clean separation, contract-first, type-safe |

### Selected Approach: Polyrepo Co-located + OpenAPI Contract

**Rationale:**
- Projects deploy to different hosts → no shared build pipeline needed
- OpenAPI spec is the single source of truth for the API contract
- Auto-generated types eliminate manual type drift between frontend and backend
- Each project has independent dependencies, build scripts, and deployment
- Simpler CI/CD — each project builds and deploys independently

### Hoxtup-app (Frontend) Initialization

**Starter:** `create-next-app` (Next.js 16)

```bash
npx create-next-app@latest Hoxtup-app --ts --tailwind --eslint --app --turbopack --src-dir --use-pnpm
cd Hoxtup-app && npx shadcn@latest init
pnpm add openapi-typescript openapi-fetch
```

**Architectural decisions provided:**

| Category | Decision |
|:---|:---|
| Language | TypeScript strict mode |
| Framework | Next.js 16 (App Router, React Compiler, Turbopack) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix UI primitives) |
| Build | Turbopack (dev), Next.js build (prod) |
| Linting | ESLint (Next.js config) |
| API types | `openapi-typescript` (auto-generated from openapi.yaml) |
| HTTP client | `openapi-fetch` (type-safe, zero manual types) |

### Hoxtup-api (Backend) Initialization

**Starter:** Manual setup (no existing starter covers the exact requirements)

```bash
mkdir Hoxtup-api && cd Hoxtup-api
pnpm init
pnpm add express cors helmet morgan compression
pnpm add -D typescript @types/express @types/node @types/cors @types/morgan vitest tsx
```

**Architectural decisions:**

| Category | Decision |
|:---|:---|
| Language | TypeScript strict mode, ESM modules |
| Runtime | Node.js 22 LTS |
| Framework | Express |
| API spec | OpenAPI 3.1 (contract-first) |
| Validation | `express-openapi-validator` (runtime contract enforcement) |
| Database | PostgreSQL + RLS (node-postgres) |
| Cache | Redis |
| Queue | BullMQ |
| Testing | Vitest + Supertest |

### Development Workflow

**Type generation (watch mode during development):**

```bash
# In Hoxtup-app/
npx openapi-typescript ../Hoxtup-api/openapi.yaml -o src/generated/api.d.ts --watch
```

**Contract safety net:**
- API side: `express-openapi-validator` rejects responses that don't match the spec
- Frontend side: `openapi-typescript` generates types that match the spec exactly
- Drift between projects → immediate type error or runtime validation failure

**Note:** Project initialization using these commands will be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- ORM + multi-tenant RLS strategy
- Authentication + cross-origin cookie strategy
- API contract enforcement (OpenAPI)
- Hosting topology (Coolify + Vercel)

**Important Decisions (Shape Architecture):**
- State management strategy
- Event system for notifications
- Caching strategy
- Logging + monitoring

**Deferred Decisions (Post-MVP):**
- WebSocket for real-time (polling sufficient for MVP)
- S3 migration for file storage (local VPS uploads for MVP)
- Advanced email templates (react-email — HTML inline for MVP)
- Feature flags (PostHog provides basic capability)

### Data Architecture

| Decision | Choice | Version | Rationale |
| :--- | :--- | :--- | :--- |
| ORM | Prisma | 7.x | Rust-free client, 3x faster queries, 90% smaller bundle. RLS via `$extends` (official pattern) |
| Validation | Zod | latest | Runtime validation API + frontend (React Hook Form resolver). Schema consistency by convention |
| Migrations | Prisma Migrate | built-in | Auto-generated + custom SQL for RLS policies (`prisma migrate dev --create-only`) |
| Redis client | ioredis | latest | BullMQ uses it internally (shared connection), mature, pipeline + Lua scripting support |
| Caching strategy | Redis | — | Sessions (JWT refresh TTL), Dashboard KPIs (1-5min TTL), iCal polling results (15-30min TTL) |

**Prisma RLS Pattern:**

```typescript
// Prisma Client Extension for multi-tenant RLS
function forTenant(tenantId: string) {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`,
              query(args),
            ])
            return result
          },
        },
      },
    })
  )
}

// Express middleware creates tenant-scoped client per request
const tenantDb = prisma.$extends(forTenant(req.tenantId))
```

### Authentication & Security

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| Auth framework | Better Auth | Self-hosted, TypeScript-native auth framework with Prisma adapter, organization plugin (multi-tenant, roles, invitations), Express-compatible via `toNodeHandler`. Replaces custom jose/argon2/refresh token code |
| Session strategy | Better Auth sessions + HttpOnly cookies on `.hoxtup.com` | Better Auth manages session lifecycle, cookies shared via parent domain. Cross-origin support via `trustedOrigins` config |
| Token lifecycle | Better Auth session tokens (30d, auto-refresh) | Better Auth handles token rotation, expiry, and revocation internally |
| Password hashing | Better Auth built-in (argon2 internally) | No manual hashing — Better Auth handles password storage securely |
| Rate limiting | express-rate-limit + rate-limit-redis | Redis-backed store for distributed rate limiting |
| CORS | Whitelist `app.hoxtup.com` + `localhost:3000` | Strict origin validation, credentials allowed |
| Encryption at rest | Node.js crypto AES-256-GCM | PII + financial data. Native module, no external dependency |

### API & Communication Patterns

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| Error format | RFC 7807 Problem Details | Consistent, parsable, i18n-ready error responses |
| Event system | EventEmitter (dispatch) → BullMQ (async execution) | Module emits event, listener enqueues BullMQ job for email/notification |
| API versioning | URL prefix `/api/v1/` | Simple, explicit, standard REST pattern |
| Logging | pino + pino-http | Structured JSON logs, ultra-fast, Coolify log viewer compatible |
| API validation | express-openapi-validator | Runtime contract enforcement — API divergence from spec breaks immediately |

**Error Response Format (RFC 7807):**

```json
{
  "type": "https://api.hoxtup.com/errors/validation",
  "title": "Validation Error",
  "status": 422,
  "detail": "Le champ 'email' est invalide",
  "errors": [{ "field": "email", "message": "Format invalide" }]
}
```

### Frontend Architecture

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| Server state | TanStack Query (React Query) | Cache, refetch, optimistic updates, perfect for data-heavy app |
| Client state | Zustand | Lightweight for UI state: role switcher, sidebar, local preferences |
| Forms | React Hook Form + @hookform/resolvers/zod | Performant, type-safe validation shared with backend |
| Animations | Framer Motion | Micro-animations (task swipe, transitions, skeleton → content) per UX spec |
| Optimistic UI | TanStack Query `useMutation` with `onMutate` | Native optimistic update with automatic rollback on error |
| Offline queue | Custom wrapper around TanStack Query | Mutations queued locally, retry on network reconnect |
| i18n | react-i18next | JSON by namespace (tasks, properties, dashboard, etc.) |
| Image upload | multipart/form-data → API → local VPS storage | MVP simplicity. S3 migration path available later |
| Image processing | sharp (API-side only) | Fast resize/optimization. Native in Docker, not needed in Hoxtup-app |

### Infrastructure & Deployment

| Service | Host | Domain | Notes |
| :--- | :--- | :--- | :--- |
| Hoxtup-app (Next.js) | Vercel | `app.hoxtup.com` | Auto-deploy on push, zero config |
| Hoxtup-api (Express) | Coolify (VPS) | `api.hoxtup.com` | Docker deployment via Coolify |
| PostgreSQL | Coolify (Docker) | Internal to VPS | Managed by Coolify service |
| Redis | Coolify (Docker) | Internal to VPS | Shared by BullMQ + cache + sessions |
| Backups | Cloudflare R2 | — | S3-compatible, GDPR-compliant (EU), 10GB free, no egress fees |

**Environments:**

| Env | API | App | DB |
| :--- | :--- | :--- | :--- |
| Dev local | `localhost:8000` | `localhost:3000` | Docker Compose (PG + Redis) |
| Staging | `api-staging.hoxtup.com` | Vercel preview | PG staging (Coolify) |
| Production | `api.hoxtup.com` | `app.hoxtup.com` | PG prod (Coolify) |

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| CI/CD | GitHub Actions | Free 2000 min/month, Vercel native integration |
| Email | Nodemailer + Brevo SMTP | Free tier 300 emails/day, sufficient for MVP |
| Email templates | HTML inline | Simple for MVP. react-email as future upgrade path |
| Analytics | PostHog | Free tier, analytics + feature flags + session replay |
| Monitoring | pino → Coolify logs + `/api/v1/health` endpoint | UptimeRobot (free) for uptime monitoring |
| Backups | pg_dump cron → Cloudflare R2 | Daily automated, 30-day retention, off-site GDPR-compliant |
| Test infra | testcontainers | Ephemeral PostgreSQL + Redis in CI for integration tests |

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffolding (polyrepo, docker-compose, tsconfig)
2. Database schema + Prisma + RLS policies
3. Auth module (Better Auth, organization plugin, cookies)
4. API foundation (Express, OpenAPI, error handling, logging)
5. Frontend foundation (Next.js, TanStack Query, Zustand, i18n)
6. Feature modules (IAM → PM → PRE → TMS → CS → ...)

**Cross-Component Dependencies:**
- Auth (Better Auth setup + organization plugin) must be complete before any protected endpoint
- Prisma schema + RLS must be complete before any data access
- OpenAPI spec must be defined per module before frontend type generation
- BullMQ + ioredis setup required before notification engine
- CORS + cookie config required before frontend ↔ API integration

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database Naming (Prisma → SQL):**

| Element | Prisma Convention | SQL Output | Example |
| :--- | :--- | :--- | :--- |
| Tables | PascalCase model | snake_case via `@@map` | `model User` → `@@map("users")` |
| Columns | camelCase field | snake_case via `@map` | `firstName` → `@map("first_name")` |
| Foreign keys | `{relation}Id` | `{relation}_id` | `organizationId` → `organization_id` |
| Indexes | — | `idx_{table}_{columns}` | `idx_users_email` |
| Enums | PascalCase | SCREAMING_SNAKE | `TaskStatus` → `TASK_STATUS` |

**API Naming:**

| Element | Convention | Example |
| :--- | :--- | :--- |
| Endpoints | Plural, kebab-case | `/api/v1/task-assignments` |
| Route params | `:paramName` (camelCase) | `/api/v1/properties/:propertyId/tasks/:taskId` |
| Query params | camelCase | `?sortBy=createdAt&pageSize=20` |
| JSON fields | camelCase | `{ "firstName": "Barry", "createdAt": "..." }` |
| Headers | Standard HTTP headers only | No custom `X-` headers for MVP |

**Code Naming:**

| Element | Convention | Example |
| :--- | :--- | :--- |
| Component files | PascalCase | `TaskCard.tsx` |
| Utility files | kebab-case | `date-utils.ts` |
| Functions | camelCase | `getTasksByProperty()` |
| Constants | SCREAMING_SNAKE | `MAX_UPLOAD_SIZE` |
| Types/Interfaces | PascalCase, no `I` prefix | `Task`, `CreateTaskInput` |
| Hooks | camelCase, `use` prefix | `useTaskList()` |
| Zustand stores | `{domain}.store.ts` | `ui.store.ts` |
| Test files | `{name}.test.ts(x)` | `auth.service.test.ts` |

### Structure Patterns

**Hoxtup-api Project Structure:**

```text
src/
├── modules/              ← Feature modules (business domain)
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.validation.ts
│   │   └── __tests__/
│   ├── tasks/
│   ├── properties/
│   └── ...
├── common/               ← Cross-cutting concerns
│   ├── middleware/
│   ├── errors/
│   ├── events/
│   └── utils/
├── config/               ← App configuration
├── prisma/               ← Schema + migrations
├── workers/              ← BullMQ workers
└── app.ts                ← Express app setup
```

**Module file pattern:** Each module follows `{module}.controller.ts`, `{module}.service.ts`, `{module}.routes.ts`, `{module}.validation.ts` with co-located `__tests__/` directory.

**Hoxtup-app Project Structure:**

```text
src/
├── app/                  ← Next.js App Router pages
│   ├── (auth)/           ← Auth route group (login, register)
│   ├── (dashboard)/      ← Protected route group
│   └── layout.tsx
├── components/
│   ├── ui/               ← shadcn/ui components
│   └── features/         ← Feature-specific components
│       ├── tasks/
│       ├── properties/
│       └── dashboard/
├── hooks/                ← Custom hooks
├── lib/                  ← Utilities, API client, constants
├── stores/               ← Zustand stores
├── i18n/                 ← Translations (JSON by namespace)
├── generated/            ← OpenAPI types (auto-generated, gitignored)
└── styles/               ← Global styles
```

**Tests:** Co-located `__tests__/` in API modules. Co-located `ComponentName.test.tsx` next to components in App.

### Format Patterns

**API Responses:**

```typescript
// Single resource → 200 (direct object, no wrapper)
{ "id": "...", "title": "...", "status": "pending" }

// List resource → 200 (data + meta for pagination)
{ "data": [...], "meta": { "total": 42, "page": 1, "pageSize": 20 } }

// Created → 201 (created resource)
{ "id": "...", "title": "..." }

// No content → 204 (delete, bulk actions)

// Error → RFC 7807 (defined in Core Architectural Decisions)
```

**Date/Time:** ISO 8601 strings everywhere (`2026-02-07T01:30:00.000Z`). Never numeric timestamps in API.

**Null handling:** Optional fields omitted from JSON (not `"field": null`), unless `null` is semantically meaningful (e.g., `"assignedTo": null` = unassigned).

**Boolean fields:** Always `true`/`false`, never `1`/`0`.

### Communication Patterns

**Internal Event System:**

| Convention | Format | Example |
| :--- | :--- | :--- |
| Event name | `{domain}.{action}` (dot notation, past tense) | `task.created`, `reservation.updated` |
| Payload structure | `{ type, data, metadata }` | `{ type: "task.created", data: { taskId }, metadata: { userId, tenantId, timestamp } }` |

**Zustand Store Pattern:**

```typescript
// One store per domain. Actions named set{Entity}, toggle{Feature}.
// stores/ui.store.ts
import { create } from 'zustand'

interface UIStore {
  viewMode: 'manager' | 'field'
  toggleViewMode: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  viewMode: 'manager',
  toggleViewMode: () => set((s) => ({ viewMode: s.viewMode === 'manager' ? 'field' : 'manager' })),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
```

### Process Patterns

**Error Handling (API):**

1. Controller → `try/catch` → passes to `next(error)`
2. Global error middleware → formats as RFC 7807
3. Business errors → custom classes (`NotFoundError`, `ForbiddenError`, `ValidationError`)
4. Never swallow errors silently
5. Log with pino (context: userId, tenantId, action) before formatting response

**Loading States (Frontend):**

- Use TanStack Query states (`isLoading` / `isFetching` / `isError`) — no custom loading state
- Skeleton components always (never spinners, per UX spec)
- `<ErrorBoundary>` per route group
- Retry via TanStack Query `retry` config (3 attempts, exponential backoff)

**Validation Timing:**

- Frontend: Zod schema validation on submit (not on change, unless UX spec requires it)
- API: `express-openapi-validator` middleware (before controller)
- DB: Prisma schema constraints + RLS policies
- Three layers of validation → defense in depth

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow naming conventions exactly as defined above
2. Place files in the correct directory per structure patterns
3. Use RFC 7807 for all API error responses
4. Use camelCase for all JSON fields in API responses
5. Use TanStack Query for all server state (never `useState` + `useEffect` for data fetching)
6. Create Zod schemas for all API input validation
7. Emit events via the EventEmitter for cross-module communication
8. Include `tenantId` context in all database operations via Prisma RLS extension
9. Write tests co-located with the module/component being tested
10. Use pino logger (never `console.log` in production code)

**Anti-Patterns (NEVER do):**

- `console.log` for logging (use pino)
- `any` type in TypeScript (use `unknown` if needed)
- Inline SQL queries (use Prisma)
- Manual HTTP client (use `openapi-fetch`)
- Custom loading spinners (use skeleton components)
- `localStorage` for auth tokens (Better Auth uses HttpOnly cookies automatically)
- Hardcoded strings in UI (use i18n keys)
- Direct Prisma client without RLS extension in protected routes

## Project Structure & Boundaries

### Complete Repository Structure

```text
hoxtup/
├── .github/
│   └── workflows/
│       ├── api-ci.yml                 ← CI pipeline Hoxtup-api
│       └── app-ci.yml                 ← CI pipeline Hoxtup-app (lint/test only)
├── .gitignore
├── .env.example                       ← Shared env documentation
├── docker-compose.yml                 ← Dev local (PG + Redis) — root level for both projects
├── README.md
│
├── Hoxtup-api/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── Dockerfile                     ← Deploy Coolify
│   ├── .env.example
│   ├── .env
│   ├── .env.test                      ← Test env (testcontainers, ephemeral DB)
│   ├── openapi.yaml                   ← API contract (source of truth)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── app.ts                     ← Express app setup + middleware chain
│       ├── server.ts                  ← HTTP server entry point
│       ├── config/
│       │   ├── index.ts               ← Env validation (Zod)
│       │   ├── database.ts            ← Prisma client + RLS extension
│       │   ├── redis.ts               ← ioredis connection
│       │   ├── cors.ts
│       │   └── bullmq.ts              ← Queue configuration
│       ├── common/
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts           ← Better Auth session verification
│       │   │   ├── tenant.middleware.ts         ← Tenant resolution + RLS
│       │   │   ├── rbac.middleware.ts           ← Role-based access control
│       │   │   ├── rate-limit.middleware.ts
│       │   │   ├── request-logger.middleware.ts ← pino-http
│       │   │   └── error-handler.middleware.ts  ← RFC 7807
│       │   ├── errors/
│       │   │   ├── base.error.ts               ← AppError base class
│       │   │   ├── not-found.error.ts
│       │   │   ├── forbidden.error.ts
│       │   │   ├── validation.error.ts
│       │   │   └── conflict.error.ts
│       │   ├── events/
│       │   │   ├── event-bus.ts                ← EventEmitter singleton
│       │   │   └── event-types.ts              ← All event type definitions
│       │   ├── utils/
│       │   │   ├── logger.ts                   ← pino instance
│       │   │   ├── crypto.ts                   ← AES-256-GCM helpers
│       │   │   ├── date-utils.ts
│       │   │   └── pagination.ts
│       │   └── types/
│       │       └── express.d.ts                ← Express Request augmentation
│       ├── modules/
│       │   ├── health/                         ← Health check (PG + Redis + BullMQ)
│       │   │   ├── health.controller.ts
│       │   │   └── health.routes.ts
│       │   ├── auth/                           ← IAM (Module 1)
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.routes.ts
│       │   │   ├── auth.validation.ts
│       │   │   ├── auth.config.ts              ← Better Auth server config + plugins
│       │   │   └── __tests__/
│       │   ├── organizations/                  ← IAM - Org management
│       │   │   ├── organizations.controller.ts
│       │   │   ├── organizations.service.ts
│       │   │   ├── organizations.routes.ts
│       │   │   ├── organizations.validation.ts
│       │   │   └── __tests__/
│       │   ├── users/                          ← IAM - User/staff management
│       │   │   ├── users.controller.ts
│       │   │   ├── users.service.ts
│       │   │   ├── users.routes.ts
│       │   │   ├── users.validation.ts
│       │   │   └── __tests__/
│       │   ├── properties/                     ← PM (Module 7)
│       │   │   ├── properties.controller.ts
│       │   │   ├── properties.service.ts
│       │   │   ├── properties.routes.ts
│       │   │   ├── properties.validation.ts
│       │   │   └── __tests__/
│       │   ├── reservations/                   ← PRE (Module 2)
│       │   │   ├── reservations.controller.ts
│       │   │   ├── reservations.service.ts
│       │   │   ├── reservations.routes.ts
│       │   │   ├── reservations.validation.ts
│       │   │   ├── ical-sync.service.ts        ← iCal polling logic
│       │   │   └── __tests__/
│       │   ├── tasks/                          ← TMS (Module 3)
│       │   │   ├── tasks.controller.ts
│       │   │   ├── tasks.service.ts
│       │   │   ├── tasks.routes.ts
│       │   │   ├── tasks.validation.ts
│       │   │   ├── task-state-machine.ts       ← 6-state lifecycle
│       │   │   ├── task-fusion.service.ts      ← Fusion Engine
│       │   │   ├── proxy.service.ts            ← Proxy/batch management
│       │   │   ├── incidents.service.ts        ← Incident lifecycle (sub-domain of tasks)
│       │   │   └── __tests__/
│       │   ├── inventory/                      ← INC (Module 4)
│       │   │   ├── inventory.controller.ts
│       │   │   ├── inventory.service.ts
│       │   │   ├── inventory.routes.ts
│       │   │   ├── inventory.validation.ts
│       │   │   └── __tests__/
│       │   ├── assets/                         ← PAP (Module 5)
│       │   │   ├── assets.controller.ts
│       │   │   ├── assets.service.ts
│       │   │   ├── assets.routes.ts
│       │   │   ├── assets.validation.ts
│       │   │   └── __tests__/
│       │   ├── billing/                        ← BF (Module 6)
│       │   │   ├── billing.controller.ts
│       │   │   ├── billing.service.ts
│       │   │   ├── billing.routes.ts
│       │   │   ├── billing.validation.ts
│       │   │   ├── polar.service.ts             ← Polar integration (MoR)
│       │   │   └── __tests__/
│       │   ├── calendar/                       ← CS (Module 8)
│       │   │   ├── calendar.controller.ts
│       │   │   ├── calendar.service.ts
│       │   │   ├── calendar.routes.ts
│       │   │   └── __tests__/
│       │   ├── notifications/                  ← NE (Module 9)
│       │   │   ├── notifications.controller.ts
│       │   │   ├── notifications.service.ts
│       │   │   ├── notifications.routes.ts
│       │   │   ├── notifications.validation.ts
│       │   │   ├── email.service.ts            ← Nodemailer + Brevo
│       │   │   └── __tests__/
│       │   ├── dashboard/                      ← DB (Module 10)
│       │   │   ├── dashboard.controller.ts
│       │   │   ├── dashboard.service.ts
│       │   │   ├── dashboard.routes.ts
│       │   │   └── __tests__/
│       │   └── uploads/                        ← File upload (incidents)
│       │       ├── uploads.controller.ts
│       │       ├── uploads.service.ts
│       │       ├── uploads.routes.ts
│       │       └── __tests__/
│       ├── __tests__/
│       │   ├── integration/                    ← Cross-module integration tests
│       │   └── fixtures/                       ← Shared test factories (createTestUser, etc.)
│       └── workers/
│           ├── email.worker.ts                 ← BullMQ email worker
│           ├── notification.worker.ts          ← BullMQ notification worker
│           ├── ical-sync.worker.ts             ← BullMQ iCal polling worker
│           └── backup.worker.ts                ← BullMQ pg_dump → R2
│
└── Hoxtup-app/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── vitest.config.ts
    ├── playwright.config.ts
    ├── components.json                         ← shadcn/ui config
    ├── .env.local
    ├── .env.example
    ├── public/                                 ← Static assets (favicons, manifest, branding)
    ├── e2e/                                    ← Playwright E2E tests
    │   ├── fixtures/                           ← Page objects, helpers
    │   └── specs/
    └── src/
        ├── app/
        │   ├── layout.tsx                      ← Root layout (providers, i18n)
        │   ├── globals.css                     ← Tailwind + design tokens
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   ├── register/page.tsx
        │   │   ├── forgot-password/page.tsx
        │   │   ├── onboarding/                 ← Multi-step wizard (org, property, staff)
        │   │   │   └── page.tsx
        │   │   └── layout.tsx                  ← Auth layout (no sidebar)
        │   └── (dashboard)/
        │       ├── layout.tsx                  ← AppShell (sidebar, nav, role switcher)
        │       ├── page.tsx                    ← Dashboard home (Module 10)
        │       ├── properties/
        │       │   ├── page.tsx                ← Property list (Module 7)
        │       │   └── [propertyId]/
        │       │       ├── page.tsx            ← Property detail
        │       │       ├── tasks/page.tsx      ← Tasks by property
        │       │       ├── inventory/page.tsx  ← Inventory by property
        │       │       └── assets/page.tsx     ← Assets by property
        │       ├── tasks/
        │       │   ├── page.tsx                ← Task list (Module 3)
        │       │   └── [taskId]/
        │       │       ├── page.tsx            ← Task detail
        │       │       └── incidents/page.tsx  ← Incident lifecycle (sub-domain of tasks)
        │       ├── calendar/
        │       │   └── page.tsx                ← Calendar views (Module 8)
        │       ├── staff/
        │       │   ├── page.tsx                ← Staff list
        │       │   └── [userId]/page.tsx    ← Staff detail + tasks
        │       ├── inventory/
        │       │   └── page.tsx                ← Global inventory (Module 4)
        │       ├── billing/
        │       │   └── page.tsx                ← Billing + subscription (Module 6)
        │       ├── notifications/
        │       │   └── page.tsx                ← Notification center (Module 9)
        │       └── settings/
        │           ├── page.tsx                ← Org settings
        │           └── profile/page.tsx        ← User profile
        ├── components/
        │   ├── ui/                             ← shadcn/ui (auto-generated)
        │   └── features/
        │       ├── app-shell/
        │       │   ├── AppShell.tsx            ← Main layout wrapper
        │       │   ├── Sidebar.tsx
        │       │   ├── BottomNavBar.tsx        ← Mobile nav
        │       │   └── RoleSwitcher.tsx        ← Manager/Field toggle (Module 11)
        │       ├── dashboard/
        │       │   ├── DashboardHeader.tsx
        │       │   ├── KPIBar.tsx
        │       │   └── ActivitySummary.tsx
        │       ├── tasks/
        │       │   ├── TaskCard.tsx
        │       │   ├── TaskList.tsx
        │       │   ├── TaskStatusBadge.tsx
        │       │   ├── TaskForm.tsx
        │       │   └── TaskFusionIndicator.tsx
        │       ├── properties/
        │       │   ├── PropertyCard.tsx
        │       │   ├── PropertyList.tsx
        │       │   └── PropertyForm.tsx
        │       ├── calendar/
        │       │   ├── CalendarView.tsx
        │       │   └── CalendarFilters.tsx
        │       ├── inventory/
        │       │   ├── InventoryList.tsx
        │       │   └── StockAlert.tsx
        │       ├── notifications/
        │       │   ├── NotificationBell.tsx
        │       │   └── NotificationList.tsx
        │       └── common/
        │           ├── Skeleton.tsx            ← Reusable skeleton loader
        │           ├── ErrorBoundary.tsx
        │           ├── UndoToast.tsx           ← 5s undo pattern
        │           └── EmptyState.tsx
        ├── hooks/
        │   ├── useAuth.ts
        │   ├── useTasks.ts                    ← TanStack Query hooks per domain
        │   ├── useProperties.ts
        │   ├── useCalendar.ts
        │   ├── useNotifications.ts
        │   ├── useDashboard.ts
        │   ├── useInventory.ts
        │   ├── useOfflineQueue.ts             ← Offline mutation queue
        │   └── useMediaUpload.ts              ← Camera API + upload
        ├── lib/
        │   ├── api-client.ts                  ← openapi-fetch instance
        │   ├── query-client.ts                ← TanStack Query config
        │   ├── constants.ts
        │   └── utils.ts
        ├── stores/
        │   ├── ui.store.ts                    ← View mode, sidebar
        │   └── preferences.store.ts           ← User preferences (persist)
        ├── i18n/
        │   ├── config.ts                      ← react-i18next setup
        │   └── locales/
        │       └── fr/
        │           ├── common.json
        │           ├── auth.json
        │           ├── tasks.json
        │           ├── properties.json
        │           ├── calendar.json
        │           ├── dashboard.json
        │           ├── inventory.json
        │           ├── billing.json
        │           └── notifications.json
        ├── generated/
        │   └── api.d.ts                       ← Auto-generated (gitignored)
        └── styles/
            └── design-tokens.css              ← Palette C colors, spacing
```

### Architectural Boundaries

**Module → API → Frontend Mapping:**

| Module | API Module | API Routes | Frontend Pages | Frontend Components |
| :--- | :--- | :--- | :--- | :--- |
| IAM | `auth/`, `organizations/`, `users/` | `/auth/*`, `/organizations/*`, `/users/*` | `(auth)/*`, `settings/*`, `staff/*` | `app-shell/RoleSwitcher` |
| PRE | `reservations/` | `/properties/:id/reservations/*` | `properties/[id]/*` | `properties/*` |
| TMS | `tasks/` | `/tasks/*` | `tasks/*` | `tasks/*` |
| INC | `inventory/` | `/properties/:id/inventory/*` | `inventory/*` | `inventory/*` |
| PAP | `assets/` | `/properties/:id/assets/*` | `properties/[id]/assets` | — |
| BF | `billing/` | `/billing/*` | `billing/*` | — |
| PM | `properties/` | `/properties/*` | `properties/*` | `properties/*` |
| CS | `calendar/` | `/calendar/*` | `calendar/*` | `calendar/*` |
| NE | `notifications/` | `/notifications/*` | `notifications/*` | `notifications/*` |
| DB | `dashboard/` | `/dashboard/*` | `(dashboard)/page.tsx` | `dashboard/*` |

### Data Flow

```text
User → Hoxtup-app (Vercel)
         │
         ├── openapi-fetch → HTTPS → api.hoxtup.com (Coolify)
         │                              │
         │                              ├── Express middleware chain:
         │                              │   auth → tenant → rbac → rate-limit → controller
         │                              │
         │                              ├── Prisma + RLS → PostgreSQL
         │                              ├── ioredis → Redis (cache + sessions)
         │                              └── BullMQ → Redis (async jobs)
         │                                    │
         │                                    └── Workers: email, notifications, iCal sync, backups
         │
         └── TanStack Query (cache + optimistic UI)
```

### External Integrations

| Service | Module | Integration Point |
| :--- | :--- | :--- |
| Polar | `billing/polar.service.ts` | Webhooks `/api/v1/webhooks/polar` + Polar SDK `@polar-sh/sdk` |
| iCal feeds | `reservations/ical-sync.service.ts` | BullMQ recurring job (15-30min) |
| Brevo SMTP | `notifications/email.service.ts` | BullMQ email worker |
| PostHog | Hoxtup-app `lib/` | Frontend SDK init in root layout |
| Cloudflare R2 | `workers/backup.worker.ts` | BullMQ daily cron job |

### Test Organization

| Test Type | Location | Tool | Scope |
| :--- | :--- | :--- | :--- |
| Unit (API) | `modules/{name}/__tests__/` | Vitest | Single service/controller |
| Integration (API) | `src/__tests__/integration/` | Vitest + testcontainers | Cross-module flows |
| Test factories | `src/__tests__/fixtures/` | Custom | `createTestUser()`, `createTestProperty()` |
| Unit (App) | Co-located `*.test.tsx` | Vitest | Single component |
| E2E | `Hoxtup-app/e2e/specs/` | Playwright | Full user journeys |
| E2E fixtures | `Hoxtup-app/e2e/fixtures/` | Playwright | Page objects, helpers |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All technology choices verified compatible. Next.js 16 + Tailwind v4 + shadcn/ui (same ecosystem). Express + Prisma 7 + PostgreSQL (Prisma 7 supports ESM + Node 22). ioredis + BullMQ (BullMQ uses ioredis internally). openapi-typescript + openapi-fetch + express-openapi-validator (unified OpenAPI ecosystem). No version conflicts detected.

**Pattern Consistency:** Naming conventions coherent across all layers (camelCase code, snake_case DB, kebab-case URLs). Module pattern identical API-side (controller → service → routes → validation). TanStack Query hooks per domain match API modules. Event system (EventEmitter → BullMQ) aligned with modular pattern.

**Structure Alignment:** Polyrepo structure matches deployment decisions (Vercel + Coolify). docker-compose.yml at root level for both projects. Tests co-located + integration separated — coherent with test strategy.

### Requirements Coverage ✅

**Functional Requirements (13/13 modules covered):**

| Module | Code | Architecture Support | Status |
| :--- | :--- | :--- | :--- |
| Identity & Access Management | IAM | auth/ + organizations/ + users/ + RBAC middleware | ✅ |
| Property & Reservation Engine | PRE | reservations/ + ical-sync + BullMQ worker | ✅ |
| Task Management System | TMS | tasks/ + state machine + fusion + proxy + incidents | ✅ |
| Inventory & Consumable Tracking | INC | inventory/ | ✅ |
| Permanent Asset Management | PAP | assets/ | ✅ |
| Billing & Finance | BF | billing/ + polar.service (MoR) | ✅ |
| Property Management | PM | properties/ | ✅ |
| Calendar System | CS | calendar/ | ✅ |
| Notification Engine | NE | notifications/ + email.service + BullMQ workers | ✅ |
| Dashboard | DB | dashboard/ + Redis cache KPIs | ✅ |
| Role Switcher | RS | RoleSwitcher component + Zustand ui.store | ✅ |
| Internationalization | i18n | react-i18next + JSON namespaces + i18next backend | ✅ |
| Multi-Currency | MC | Organization-level currency config + formatting utils | ✅ |

**Non-Functional Requirements:**

| NFR | Architecture Support | Status |
| :--- | :--- | :--- |
| Page load < 2s (4G) | Single home feed endpoint, TanStack Query cache, Turbopack | ✅ |
| API CRUD p95 < 200ms | Prisma indexed queries, Redis cache, pagination | ✅ |
| PostgreSQL RLS | Prisma `$extends` + tenant middleware | ✅ |
| Auth sessions | Better Auth + HttpOnly cookies on `.hoxtup.com` | ✅ |
| AES-256 at rest | Node.js crypto AES-256-GCM | ✅ |
| GDPR | Audit logging, data retention, user export/delete | ✅ |
| 99.5% uptime | Health endpoint + UptimeRobot + Coolify auto-restart | ✅ |
| Daily backups 30d | pg_dump cron → Cloudflare R2 | ✅ |
| WCAG 2.1 Level A | shadcn/ui (Radix accessible) + design tokens | ✅ |

### Implementation Readiness ✅

**Decision Completeness:** 25+ architectural decisions documented with versions, rationale, and concrete examples. Implementation patterns cover naming, structure, format, communication, and process. Anti-patterns explicitly documented.

**Structure Completeness:** ~200+ files mapped across both projects. All 13 functional modules have explicit directory locations. Integration points clearly specified.

**Pattern Completeness:** All potential AI agent conflict points addressed with concrete conventions. Examples provided for Prisma RLS, Zustand stores, error handling, API responses.

### Gap Analysis

**Critical Gaps: None**

**Important Gaps (address during implementation):**

1. **WCAG Level** — PRD says Level A, UX spec says Level AA. Architecture supports both (shadcn/ui accessible by default). Clarify target in implementation stories.
2. **Money storage** — Store monetary amounts as integers (centimes), never floats. Currency code as separate column per organization. Add to Prisma schema patterns.
3. **i18n API errors** — RFC 7807 `type` URL serves as i18n key for frontend mapping. No i18next needed server-side for MVP.

**Nice-to-Have (post-MVP):**

- Storybook for component development
- OpenAPI spec auto-generation (swagger-jsdoc) vs manual maintenance
- PWA manifest for offline support
- Advanced PostHog feature flags

### Architecture Completeness Checklist

**Requirements Analysis:**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (HIGH)
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped (7 identified)

**Architectural Decisions:**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns:**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented
- [x] Anti-patterns explicitly listed

**Project Structure:**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: HIGH**

**Key Strengths:**

- OpenAPI contract as single source of truth — zero type drift between projects
- Prisma RLS official pattern — solid multi-tenant security
- Modern, cohesive stack — no exotic technologies
- Precise implementation patterns — AI agents cannot diverge
- Clear deployment topology (Vercel + Coolify) with subdomain auth strategy

**Areas for Future Enhancement:**

- WebSocket for real-time features (polling sufficient for MVP)
- S3 migration for file storage
- Advanced email templates (react-email)
- Storybook component development workflow

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- Never deviate from naming conventions or anti-pattern rules

**Implementation Sequence:**

1. Project scaffolding (polyrepo, docker-compose, tsconfig, ESLint)
2. Database schema + Prisma + RLS policies
3. Auth module (Better Auth, organization plugin, cookies, CORS)
4. API foundation (Express, OpenAPI, error handling, logging)
5. Frontend foundation (Next.js, TanStack Query, Zustand, i18n)
6. Feature modules (IAM → PM → PRE → TMS → CS → INC → PAP → BF → NE → DB)
