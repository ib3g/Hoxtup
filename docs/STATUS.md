# Status — État actuel du projet

> **Dernière mise à jour :** 2026-02-09

## Résumé

| Couche | État | Détails |
|:---|:---|:---|
| **Backend API** | � Nettoyé | Code obsolète supprimé. `src/config/` + `prisma/` conservés. Prêt pour mvp-01. |
| **Base de données** | ✅ Conservé | Prisma 7 schema (695 lignes) + RLS policies + migrations |
| **Auth** | ✅ Conservé | Better Auth config prête (Session, Account, Member, Invitation models) |
| **Infra** | ✅ Conservé + fixé | docker-compose (+ adminer ajouté), Dockerfiles, .env |
| **Frontend** | 🟡 Nettoyé | Code obsolète supprimé. i18n/lib/hooks/globals.css conservés. Prêt pour mvp-01. |
| **Design System** | ✅ Done | mvp-01 : Tailwind tokens, fonts next/font, 11 shadcn/ui components, Button 4 variants |
| **Déploiement** | 🔴 À faire | Coolify (API) + Vercel (App) non configurés |

## Nettoyage effectué (post-audit)

### Backend — Supprimé

- `src/common/` — middleware, errors, events, types, utils (tout à réécrire)
- `src/modules/` — tous les modules applicatifs (12 modules)
- `src/workers/` — tous les workers BullMQ
- `src/app.ts`, `src/server.ts` — entry points (importaient les modules supprimés)
- Fichiers temp : `check-ids.ts`, `test-prisma.ts`, `error.log`, `test_output.txt`

### Backend — Fixé

- `src/config/logger.ts` — pino logger déplacé depuis `common/utils/`
- `src/config/plans.ts` — STARTER maxProperties 5→7, SCALE 50→25
- `prisma/seed.ts` — réécrit pour Better Auth (Account entries + Member entries)

### Frontend — Supprimé

- `src/app/(auth)/` — toutes les pages auth (login, register, invite)
- `src/app/(dashboard)/` — toutes les pages dashboard (13 pages)
- `src/app/page.tsx`, `src/app/layout.tsx` — root page + layout (mauvaises fonts)
- `src/components/` — tous les composants (common + features)

### Frontend — Fixé

- `src/app/globals.css` — dark theme réécrit avec palette Fusion Méditerranée, font mono fixée

### Docker — Fixé

- `docker-compose.yml` — adminer ajouté (port 8080)

## Structure actuelle (après nettoyage)

### Backend (`Hoxtup-api/src/`)

```text
src/
├── config/
│   ├── index.ts          (env validation Zod v4)
│   ├── database.ts       (Prisma client + forTenant/getTenantDb)
│   ├── cors.ts           (CORS config)
│   ├── plans.ts          (5 tiers billing, maxProperties corrigés)
│   ├── bullmq.ts         (queues: ical-sync, notifications, emails)
│   ├── redis.ts          (ioredis client)
│   ├── logger.ts         (pino + pino-pretty dev)
│   ├── index.test.ts
│   └── database.test.ts
└── generated/prisma/     (auto-generated, ne pas modifier)
```

### Frontend (`Hoxtup-app/src/`)

```text
src/
├── app/
│   ├── globals.css       (Fusion Méditerranée light+dark, fonts Inter+Outfit)
│   └── favicon.ico
├── generated/
│   └── api.d.ts          (types OpenAPI générés)
├── hooks/
│   ├── useAuth.ts
│   └── useCurrency.ts
├── i18n/
│   ├── config.ts          (react-i18next, 11 namespaces)
│   ├── I18nProvider.tsx
│   └── locales/fr/        (11 fichiers JSON)
└── lib/
    ├── api-client.ts      (openapi-fetch, credentials: include)
    ├── auth-client.ts     (Better Auth React client)
    ├── currency.ts        (formatMoney, parseMoney)
    └── utils.ts           (cn = clsx + tailwind-merge)
```

## Prisma schema — Validé (pas de changement nécessaire)

Le schema (695 lignes) couvre tous les modèles nécessaires :
- **Auth :** User, Session, Account, Verification, Member, Invitation
- **Business :** Organization, Property, Reservation, ICalSource, Task, TaskHistory, Incident
- **Intelligence :** TaskAutoRule, TaskConflict, FusionPair, FusionRejection
- **Inventory :** ConsumableItem, StockMovement, Asset, Revenue
- **Notifications :** Notification, NotificationPreference
- **Billing :** Subscription (5 tiers)
- **Audit :** TeamAuditLog, ReservationTaskAudit, PropertyAssignment

## Prochaines étapes

Chaque story MVP est désormais **fullstack** (backend API + frontend UI). Ordre d'exécution :

1. **mvp-01** — Design System & Tokens (frontend only)
2. **mvp-02** — App Shell & Navigation (frontend + backend auth middleware)
3. **mvp-03** — Auth Pages (frontend + Better Auth setup)
4. Suivre le dependency graph dans `V1-ROADMAP.md`

## Deferred items (à implémenter en V1/V1.1)

- BullMQ scheduled jobs (alertes prédictives, rappels trial, suppression GDPR)
- Redis caching pour endpoints financiers/dashboard
- Polar SDK integration (nécessite compte Polar configuré)
- Webhook signature verification Polar

---

> **Convention :** Mettre à jour ce fichier à chaque fin de session de travail.
