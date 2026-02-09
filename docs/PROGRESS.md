# Progress — Suivi d'implémentation

> **Fichier de suivi continu.** Mis à jour après chaque story implémentée.
> Permet de reprendre le travail à tout moment sans perdre le contexte.

---

## État global

| Métrique | Valeur |
|:---|:---|
| **Phase actuelle** | Phase 1 — MVP |
| **Story en cours** | — (pas commencé) |
| **Stories terminées** | 0 / 17 |
| **Dernière mise à jour** | 2026-02-09 |

---

## Stories MVP — Suivi détaillé

| # | Story | Scope | Status | Notes |
|:---|:---|:---|:---|:---|
| mvp-01 | Design System & Tokens | Frontend | ⬜ Todo | |
| mvp-02 | App Shell & Navigation | Frontend | ⬜ Todo | Dépend de mvp-01 |
| mvp-03 | Auth Pages | Backend + Frontend | ⬜ Todo | Dépend de mvp-01, mvp-02 |
| mvp-04 | Onboarding Flow | Backend + Frontend | ⬜ Todo | Dépend de mvp-03 |
| mvp-05 | Properties List & Detail | Backend + Frontend | ⬜ Todo | Dépend de mvp-02 |
| mvp-06 | Reservations List | Backend + Frontend | ⬜ Todo | Dépend de mvp-05 |
| mvp-07 | iCal Management | Backend + Frontend | ⬜ Todo | Dépend de mvp-05 |
| mvp-08 | Task List & Filtering | Backend + Frontend | ⬜ Todo | Dépend de mvp-05 |
| mvp-09 | Task Detail & Transitions | Backend + Frontend | ⬜ Todo | Dépend de mvp-08 |
| mvp-10 | Task Assignment | Backend + Frontend | ⬜ Todo | Dépend de mvp-08 |
| mvp-11 | Manual Task Creation | Backend + Frontend | ⬜ Todo | Dépend de mvp-08 |
| mvp-12 | Calendar View | Backend + Frontend | ⬜ Todo | Dépend de mvp-06, mvp-08 |
| mvp-13 | Team Management | Backend + Frontend | ⬜ Todo | Dépend de mvp-02 |
| mvp-14 | Notifications | Backend + Frontend | ⬜ Todo | Dépend de mvp-02 |
| mvp-15 | Dashboard Home | Backend + Frontend | ⬜ Todo | Dépend de mvp-08, mvp-06 |
| mvp-16 | Settings & Profile | Backend + Frontend | ⬜ Todo | Dépend de mvp-02 |
| mvp-17 | Billing & Subscription | Backend + Frontend | ⬜ Todo | Dépend de mvp-02 |

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

---

## Contexte technique rapide

### Backend — Ce qui existe (`Hoxtup-api/src/`)
```
src/config/   → index.ts, database.ts, cors.ts, plans.ts, bullmq.ts, redis.ts, logger.ts
src/generated/ → Prisma client auto-généré
```

### Frontend — Ce qui existe (`Hoxtup-app/src/`)
```
src/app/       → globals.css (light+dark Fusion Méd.), favicon.ico
src/i18n/      → config.ts, I18nProvider.tsx, 11 namespaces FR
src/lib/       → api-client.ts, auth-client.ts, currency.ts, utils.ts
src/hooks/     → useAuth.ts, useCurrency.ts
src/generated/ → api.d.ts (types OpenAPI)
```

### Deps frontend à installer (mvp-01/02)
- `@tanstack/react-query`, `zustand`, `framer-motion`
- `react-hook-form`, `@hookform/resolvers`, `zod`
- shadcn/ui primitives via `npx shadcn@latest add ...`

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
| 1 | Fonts Inter+Outfit pas encore chargées (pas de `next/font`) | Pas de typo correcte | mvp-01 |
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
