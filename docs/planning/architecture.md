# Architecture — Hoxtup

## Stack technique

### Backend (Hoxtup-api)

| Couche | Technologie | Version | Rôle |
|:---|:---|:---|:---|
| Runtime | Node.js | 22 LTS | Serveur |
| Framework | Express | 5 | HTTP, routing, middleware |
| Langage | TypeScript | strict, ESM | Type safety |
| ORM | Prisma | 7 | DB access, migrations, RLS |
| Base de données | PostgreSQL | 16 | Données, RLS multi-tenant |
| Cache/Queue | Redis + ioredis | 7 | BullMQ jobs, rate limiting, cache |
| Auth | Better Auth | 1.4.18 | Sessions, org plugin, invitations |
| Validation | Zod | v4 | Request/response validation |
| Email | Nodemailer + Brevo SMTP | — | Transactional emails |
| Logging | pino + pino-http | — | Structured JSON logs |
| Billing | Polar | SDK | Merchant of Record, webhooks |
| Tests | Vitest + supertest | — | Unit + integration tests |

### Frontend (Hoxtup-app)

| Couche | Technologie | Version | Rôle |
|:---|:---|:---|:---|
| Framework | Next.js | 16 | App Router, Turbopack, SSR |
| Langage | TypeScript | strict | Type safety |
| CSS | Tailwind CSS | v4 | Utility-first styling |
| Components | shadcn/ui (Radix UI) | — | Accessible component primitives |
| State (server) | TanStack Query | — | API data fetching + caching |
| State (client) | Zustand | — | Client-side state |
| Forms | React Hook Form + Zod | v4 | Form validation |
| Animations | Framer Motion | — | Micro-interactions |
| i18n | react-i18next | — | Internationalisation |
| API Client | openapi-fetch | — | Type-safe API calls |
| Icons | Lucide | — | Icônes cohérentes |
| Auth Client | better-auth/react | — | Auth hooks + components |

### Infrastructure

| Service | Technologie | Environnement |
|:---|:---|:---|
| API hosting | Coolify VPS | `api.hoxtup.com` |
| App hosting | Vercel | `app.hoxtup.com` |
| DB | PostgreSQL 16 | Docker (dev), Managed (prod) |
| Cache | Redis 7 | Docker (dev), Managed (prod) |
| Email dev | Mailhog | Docker (dev) |
| DB admin dev | Adminer | Docker (dev) |
| CI/CD | GitHub Actions | Auto on push |
| Monitoring | UptimeRobot | Uptime checks |
| Analytics | PostHog | Product analytics |
| Backups | Cloudflare R2 | GDPR-compliant storage |

## Conventions

### Nommage

| Contexte | Convention | Exemple |
|:---|:---|:---|
| Variables, JSON | camelCase | `firstName`, `propertyId` |
| Base de données | snake_case | `first_name`, `property_id` |
| URLs | kebab-case | `/api/v1/ical-sources` |
| Composants React | PascalCase | `TaskCard`, `DashboardHeader` |
| Types/Interfaces | PascalCase | `TaskStatus`, `PropertyResponse` |
| Fichiers React | kebab-case | `task-card.tsx`, `dashboard-header.tsx` |
| Fichiers backend | kebab-case | `tasks.service.ts`, `auth.middleware.ts` |

### API patterns

- **Base path :** `/api/v1/`
- **Auth :** `/api/auth/*` (Better Auth, hors versioning)
- **Erreurs :** RFC 7807 Problem Details (`{ type, title, status, detail }`)
- **Pagination :** `?page=1&limit=20` → `{ data: [], meta: { total, page, limit, pages } }`
- **Filtres :** query params (`?propertyId=xxx&status=TODO&startDate=2026-01-01`)
- **Dates :** ISO 8601 (`2026-02-09T10:00:00Z`)
- **Montants :** Integer centimes (`6900` = 69.00€)
- **Currencies :** `EUR` ou `MAD`, stocké dans org settings

### Structure backend

```text
Hoxtup-api/src/
├── config/          ← Configuration (redis, plans, auth)
├── common/
│   ├── middleware/   ← auth, tenant, rbac, scope, subscription-guard, rate-limit
│   ├── errors/      ← Custom error classes (AppError, NotFoundError, etc.)
│   └── utils/       ← Helpers partagés
├── i18n/            ← Traductions backend (emails)
├── modules/
│   ├── auth/        ← Routes + controller (org creation)
│   ├── health/      ← Health check
│   ├── properties/  ← CRUD propriétés
│   ├── reservations/← CRUD réservations
│   ├── ical/        ← Sources iCal
│   ├── tasks/       ← Tasks + fusion + incidents + conflicts + auto-rules
│   ├── calendar/    ← Vue calendrier unifiée
│   ├── notifications/← In-app + email + preferences
│   ├── users/       ← Team management
│   ├── inventory/   ← Stock + assets + revenue + financials
│   ├── dashboard/   ← Home + field + activity
│   └── billing/     ← Plans + subscription + Polar webhooks
├── app.ts           ← Express app setup
└── server.ts        ← Server startup
```

### Structure frontend

```text
Hoxtup-app/src/
├── app/
│   ├── (auth)/      ← Pages auth (login, register)
│   ├── (dashboard)/ ← Pages protégées (layout avec App Shell)
│   │   ├── dashboard/
│   │   ├── properties/
│   │   ├── reservations/
│   │   ├── tasks/
│   │   ├── calendar/
│   │   ├── inventory/
│   │   ├── staff/
│   │   ├── notifications/
│   │   ├── billing/
│   │   ├── settings/
│   │   └── incidents/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/          ← shadcn/ui (Button, Card, Badge, Toast...)
│   ├── layout/      ← AppShell, BottomNavBar, DashboardHeader
│   ├── task/        ← TaskCard, TaskValidationBanner
│   ├── property/    ← PropertySelector, PropertyColorDot
│   ├── feedback/    ← ZenStateIndicator, NotificationBadge
│   ├── forms/       ← IncidentReportForm
│   └── common/      ← Shared components
├── hooks/           ← useAuth, useCurrency, custom hooks
├── lib/             ← api-client, auth-client, currency, utils
└── i18n/            ← config, locales/fr/*.json (11 namespaces)
```

## Multi-tenancy

- **Row-Level Security (RLS)** sur PostgreSQL
- Chaque table a une colonne `organization_id`
- RLS policy : `organization_id::text = current_setting('app.tenant_id', TRUE)`
- `forTenant(orgId)` wraps queries en transactions interactives avec `SET LOCAL app.tenant_id`
- Dual PG roles : `hoxtup` (owner, bypasse RLS) + `app_user` (soumis à RLS)

## Auth flow

```text
1. Signup: POST /api/auth/sign-up/email → session cookie
2. Create org: POST /api/v1/organizations → org created, user = owner
3. Login: POST /api/auth/sign-in/email → session cookie
4. Every request: cookie → requireAuth middleware → getSession → req.user
5. Tenant: tenantMiddleware → getFullOrganization → SET app.tenant_id
6. RBAC: requirePermission('task:read') → check user role → allow/deny
```
