# Progress — Suivi d'implémentation

> **Fichier de suivi continu.** Mis à jour après chaque story implémentée.
> Permet de reprendre le travail à tout moment sans perdre le contexte.

---

## État global

| Métrique | Valeur |
|:---|:---|
| **Phase actuelle** | Phase 1 — MVP |
| **Story en cours** | mvp-13, mvp-16, mvp-17 (partielles) |
| **Stories terminées** | 14 / 17 |
| **Stories partielles** | 3 / 17 (mvp-13, mvp-16, mvp-17) |
| **Dernière mise à jour** | 2026-02-10 |

---

## Stories MVP — Suivi détaillé

| # | Story | Scope | Status | Notes |
|:---|:---|:---|:---|:---|
| mvp-01 | Design System & Tokens | Frontend | ✅ Done | Session 2 |
| mvp-02 | App Shell & Navigation | Frontend | ✅ Done | Session 2 |
| mvp-03 | Auth Pages | Backend + Frontend | ✅ Done | Session 2 |
| mvp-04 | Onboarding Flow | Backend + Frontend | ✅ Done | Session 3 |
| mvp-05 | Properties List & Detail | Backend + Frontend | ✅ Done | Session 3 |
| mvp-06 | Reservations List | Backend + Frontend | ✅ Done | Sessions 4-7 |
| mvp-07 | iCal Management | Backend + Frontend | ✅ Done | Backend CRUD + frontend ICalTab dans property detail |
| mvp-08 | Task List & Filtering | Backend + Frontend | ✅ Done | Sessions 4-7 |
| mvp-09 | Task Detail & Transitions | Backend + Frontend | ✅ Done | Sessions 4-7 |
| mvp-10 | Task Assignment | Backend + Frontend | ✅ Done | Sessions 4-7 |
| mvp-11 | Manual Task Creation | Backend + Frontend | ✅ Done | Sessions 4-7 |
| mvp-12 | Calendar View | Backend + Frontend | ✅ Done | Sessions 4-7 |
| mvp-13 | Team Management | Backend + Frontend | 🔵 Partiel | Frontend done, backend manque invitations |
| mvp-14 | Notifications | Backend + Frontend | ✅ Done | Sessions 4-7 |
| mvp-15 | Dashboard Home | Backend + Frontend | ✅ Done | Sessions 4-7 |
| mvp-16 | Settings & Profile | Backend + Frontend | 🔵 Partiel | Frontend done, backend manque API settings |
| mvp-17 | Billing & Subscription | Backend + Frontend | 🔵 Partiel | Frontend done, backend plans only — manque upgrade/Polar |

**Légende :** ⬜ Todo · 🔵 En cours · ✅ Done · 🔴 Bloqué

---

## Historique des sessions

### Session 1 — 2026-02-09

**Objectif :** Audits + nettoyage + mise à jour docs

**Réalisé :**
- Audit backend complet → verdict : restart `src/`
- Audit frontend complet → verdict : restart pages + composants
- Suppression de tout le code obsolète (120+ fichiers)
- Fixes : plans.ts, bullmq.ts, seed.ts, globals.css, docker-compose
- Mise à jour de tous les docs planning (29 stories, roadmap, status, epics)
- Suppression estimations temps, ajout scope fullstack
- Archivage rapports d'audit

**Décisions prises :**
- Prisma schema conservé tel quel (695 lignes, 28 models)
- Backend config conservé (`src/config/`)
- Frontend i18n/lib/hooks conservés
- Dark theme réécrit avec palette Fusion Méditerranée

**Prochaine session :** Commencer mvp-01 (Design System & Tokens)

### Session 2 — 2026-02-09

**Objectif :** Implémenter mvp-01 (Design System & Tokens)

**Réalisé :**
- Tailwind v4 `globals.css` rewritten : brand tokens, status colors, property slots, typography utilities, accessibility (focus ring, skip-to-content, reduced-motion, high-contrast)
- Fonts Inter + Outfit chargées via `next/font/google` (auto self-hosted, subset, swap)
- Root `layout.tsx` : CSS variables on `<html>`, I18nProvider, viewport meta, `lang="fr"`
- shadcn/ui components installés : button, card, badge, dialog, sheet, skeleton, input, label, select, textarea, sonner
- Button customisé : 4 variantes Hoxtup (terra CTA, teal secondary outline, ghost, destructive), h-12 touch targets
- Sonner toaster fixé (removed next-themes dep)
- Dialog fixé (outline → ghost variant)
- Deps ajoutées : @tanstack/react-query, zustand, framer-motion
- Page preview design system (typographie, couleurs, boutons, formulaire, skeleton)
- Build passes ✅

**mvp-02 — App Shell & Navigation :**
- `AuthGuard` component : redirige vers `/login` si pas de session, skeleton loading
- `BottomNavBar` : 4 tabs owner, 3 tabs staff, badge support, terra active, sticky bottom, touch targets 48px
- `Sidebar` : immersive `#1e2d35` bg, collapsible, V1 badge sur Inventory, role-filtered items
- `DashboardHeader` : greeting adaptatif (matin/après-midi/soir), date formatée FR
- `useNavItems(role)` hook : retourne bottomNav + sidebarNav filtrés par rôle (5 rôles)
- `DashboardShell` : client component wrapping AuthGuard + Sidebar + BottomNavBar + Header
- `Providers` : QueryClient (TanStack Query) + Sonner Toaster
- Dashboard layout : server component wrapper avec `dynamic = 'force-dynamic'`
- 10 placeholder pages (dashboard, properties, reservations, tasks, calendar, team, settings, billing, incidents, more) + login
- i18n : 19 nav keys ajoutés dans common.json, 5 contextual messages dans dashboard.json
- Build passes ✅

**Décisions prises :**
- `next/font/google` au lieu de woff2 manuels (meilleure perf, auto-subset)
- `--radius: 0.375rem` (6px) per spec
- Charts colors aligned with brand palette (not oklch defaults)
- Light theme `--secondary` changed to `#eef0f2` (bg-secondary token)
- Dashboard layout split: server component (exports `dynamic`) + client `DashboardShell` (avoids prerender errors with Better Auth hooks)
- Sonner toaster: removed `next-themes` dep, hardcoded light theme for now

**mvp-03 — Auth Pages :**
- Backend: `app.ts` + `server.ts` entry points (Express 5, helmet, cors, compression)
- Backend: `config/auth.ts` — Better Auth with Prisma adapter + organization plugin
- Better Auth mounted at `/api/auth/*splat` via `toNodeHandler()`
- Frontend: `(auth)/layout.tsx` — centered, no nav, logo + accent dot
- Frontend: `(auth)/login/page.tsx` — React Hook Form + Zod, Better Auth signIn, rate limit handling
- Frontend: `(auth)/register/page.tsx` — name + email + password + confirm, Zod validation
- Frontend: `(auth)/onboarding/organization/page.tsx` — org name + currency, auto-slug
- i18n: auth.json updated with confirmPassword, emailTaken, rateLimited, organization section
- Color fix: CTA `#d28370`, brand-logo `#2d5463`, secondary button `border-2` + tinted bg
- Backend typecheck ✅, Frontend build ✅

**Prochaine session :** Commencer mvp-04 (Onboarding Flow)

### Session 3 — 2026-02-09

**Objectif :** Implémenter mvp-04 (Onboarding Flow)

**Réalisé :**
- Backend: `modules/properties/` — schema.ts, service.ts (create + list), routes.ts (GET + POST)
- Backend: `modules/ical/` — schema.ts, service.ts, routes.ts (POST with propertyId param)
- Backend: auth middleware fallback — auto-finds first org if no activeOrganizationId
- Backend: CORS fix for Better Auth — manual headers before `toNodeHandler()` (bypasses Express cors)
- Frontend: `OnboardingStepper` component — 3-step horizontal stepper (terra active, green done)
- Frontend: `/onboarding/property` — create property form (name, address, type, color picker)
- Frontend: `/onboarding/ical` — connect iCal URL form + skip option
- Frontend: `/onboarding/done` — confirmation page with property summary
- Frontend: Register auto-creates org "default" + redirects to `/dashboard`
- Frontend: Dashboard fetches real property count from API — shows onboarding CTA if 0
- i18n: 40+ onboarding keys added to properties.json, dashboard empty state updated
- Fix: double `/api/v1/` prefix in fetch URLs
- Fix: `auth-client.ts` missing `'use client'` directive (useRef null error)
- Fix: Suspense boundaries for pages using `useSearchParams()`
- Removed dark mode: globals.css dark theme block + dark: prefixes from UI components
- Backend typecheck ✅, Frontend build ✅

**Décisions prises :**
- Org auto-created on register (name: "default") — reduces friction, no separate org creation step
- Onboarding accessible from dashboard empty state, not forced flow
- Auth middleware fallback: finds first org if `activeOrganizationId` is null
- Better Auth CORS: manual header injection before `toNodeHandler` (Express cors middleware headers get overwritten)

**Prochaine session :** Commencer mvp-05 (Properties List & Detail)

### Sessions 4-7 — 2026-02-09 / 2026-02-10

**Objectif :** Implémenter le gros du MVP (mvp-06 à mvp-18)

**Réalisé :**
- Backend: 10 modules complets (properties, reservations, ical, tasks, team, notifications, dashboard, billing, calendar)
- Backend: CRUD complet reservations, tasks (avec auto-rules, history, assignment)
- Backend: Notifications (list, unread count, mark read/all)
- Backend: Dashboard KPIs (today tasks, check-ins, incidents, unassigned)
- Backend: Billing plans listing + current billing info
- Backend: Calendar events aggregation
- Frontend: Toutes les pages dashboard implémentées (properties, reservations, tasks, calendar, team, notifications, settings, billing)
- Frontend: Sheet components (TaskDetailSheet, TaskFormSheet, ReservationDetailSheet, ReservationFormSheet, PropertyFormSheet)
- Frontend: PageHeader component générique
- Frontend: i18n complet (12 namespaces FR)
- Frontend: Date-time picker component
- Frontend: Property color dot + Task type icon components

**Commits :**
- `feat(mvp-14)` : notifications — list, read, mark all read, unread badge
- `feat(mvp-15)` : dashboard home — KPI bar, today tasks, greeting, quick actions
- `feat(mvp-16)` : settings & profile — name edit, preferences, logout
- `feat(mvp-17)` : billing & subscription — plans display, current plan, upgrade CTAs
- `feat(mvp-18)` : latest changes — task details, reservations, UI improvements

**Ce qui reste (stories partielles) :**
- mvp-13 : Backend invitation endpoints (frontend done)
- mvp-16 : Backend settings API endpoints (frontend done)
- mvp-17 : Backend upgrade/downgrade + Polar webhook integration

---

## Contexte technique rapide

### Backend — Ce qui existe (`Hoxtup-api/src/`)
```
src/config/              → index.ts, database.ts, cors.ts, plans.ts, bullmq.ts, redis.ts, logger.ts, auth.ts
src/common/middleware/   → auth.ts (requireAuth + org fallback)
src/modules/properties/  → schema.ts, service.ts, routes.ts (CRUD + archive/reactivate)
src/modules/reservations/→ schema.ts, service.ts, routes.ts (CRUD + filters)
src/modules/ical/        → schema.ts, service.ts, routes.ts (sources CRUD)
src/modules/tasks/       → schema.ts, service.ts, routes.ts (CRUD + /my + auto-rules)
src/modules/team/        → schema.ts, service.ts, routes.ts (list, role update, remove)
src/modules/notifications/→ schema.ts, service.ts, routes.ts (list, unread-count, mark read)
src/modules/dashboard/   → schema.ts, service.ts, routes.ts (home KPIs)
src/modules/billing/     → schema.ts, service.ts, routes.ts (plans, current billing)
src/modules/calendar/    → schema.ts, service.ts, routes.ts (events aggregation)
src/app.ts               → Express app (helmet, cors, Better Auth CORS fix, all module routes)
src/server.ts            → Entry point (listen on PORT)
src/generated/           → Prisma client auto-généré
```

### Frontend — Ce qui existe (`Hoxtup-app/src/`)
```
src/app/              → layout.tsx (next/font), page.tsx (design system preview), globals.css (tokens)
src/app/dashboard/    → layout.tsx + 12 pages (dashboard, properties, properties/[id], reservations, tasks, calendar, team, notifications, settings, billing, incidents, more)
src/app/(auth)/       → layout.tsx + login, register, onboarding/{organization,property,ical,done}
src/components/       → auth-guard, bottom-nav-bar, sidebar, dashboard-header, dashboard-shell, page-header, providers, onboarding-stepper
src/components/       → task-detail-sheet, task-form-sheet, reservation-detail-sheet, reservation-form-sheet, property-form-sheet
src/components/       → property-color-dot, task-type-icon
src/components/ui/    → button, card, badge, dialog, sheet, skeleton, input, label, select, textarea, sonner, popover, date-time-picker
src/i18n/             → config.ts, I18nProvider.tsx, 12 namespaces FR
src/lib/              → api-client.ts, auth-client.ts, currency.ts, utils.ts
src/hooks/            → useAuth.ts, useCurrency.ts, useNavItems.ts
src/generated/        → api.d.ts (types OpenAPI)
```

### Deps frontend installées
- `@tanstack/react-query`, `zustand`, `framer-motion` ✅
- `react-hook-form`, `@hookform/resolvers`, `zod` ✅ (déjà dans package.json)
- shadcn/ui : 11 composants installés ✅

### Patterns obligatoires
- **Backend :** services reçoivent `db` tenant-scoped, jamais global `prisma`
- **Backend :** Zod v4, pino logger, OpenAPI contract-first
- **Frontend :** tout texte via `t()` (i18n), shadcn/ui, TanStack Query
- **Frontend :** React Hook Form + Zod sur tous les formulaires
- **Frontend :** mobile-first, WCAG 2.1 AA

---

## Problèmes connus / À surveiller

| # | Problème | Impact | Quand résoudre |
|:---|:---|:---|:---|
| 1 | ~~Fonts Inter+Outfit pas encore chargées~~ | ✅ Résolu | mvp-01 |
| 2 | Seed utilise `@node-rs/argon2` avec fallback | Hash potentiellement incompatible Better Auth | mvp-03 (re-seed via API) |
| 3 | OpenAPI spec (51KB) a des TODO schemas | Validation responses cassée | Progressif par story |
| 4 | `database.ts` forTenant() utilise $transaction par requête | Performance à surveiller | Post-MVP si problème |

---

## Checklist de fin de session

À faire **après chaque session de travail** :

- [ ] Mettre à jour le tableau "Stories MVP" ci-dessus
- [ ] Ajouter une entrée dans "Historique des sessions"
- [ ] Mettre à jour STATUS.md si changement de couche
- [ ] Mettre à jour `_index.md` stories si status changé
- [ ] Commit avec message conventionnel
