# Epics — Vue d'ensemble

> 8 épiques fonctionnelles couvrant tout le périmètre Hoxtup. Suite aux audits backend + frontend (fév. 2026), tout le code `src/` est à **réécrire**. L'infrastructure (Prisma schema, docker, config) est conservée.

## Épiques fonctionnelles (à réimplémenter)

| # | Epic | Couverture MVP | Couverture V1 | Status |
|:---|:---|:---|:---|:---|
| 1 | Foundation & Secure Access | mvp-01 à mvp-03 | — | 🔴 Restart |
| 2 | Property Management & Reservations | mvp-04 à mvp-07 | — | 🔴 Restart |
| 3 | Task Management & Team Coordination | mvp-08 à mvp-11, mvp-13 | v1-05 à v1-08 | 🔴 Restart |
| 4 | Notifications & Alerts | mvp-14 | — | 🔴 Restart |
| 5 | Calendar & Scheduling | mvp-12 | v1-09 | 🔴 Restart |
| 6 | Inventory & Cost Management | — | v1-01 à v1-04 | 🔴 Restart |
| 7 | Dashboard & Operational Intelligence | mvp-15 | v1-10 | 🔴 Restart |
| 8 | Billing & Subscription | mvp-17 | — | 🔴 Restart |

## Dependency Graph

```text
Epic 1 (Foundation) ← base de tout
  ├─► Epic 2 (Properties + Reservations)
  │     ├─► Epic 3 (Tasks) ← dépend de properties + reservations
  │     │     ├─► Epic 4 (Notifications) ← notifie sur events tasks
  │     │     └─► Epic 6 (Inventory) ← stock lié aux propriétés + tâches
  │     └─► Epic 5 (Calendar) ← agrège reservations + tasks
  ├─► Epic 7 (Dashboard) ← agrège tout
  └─► Epic 8 (Billing) ← indépendant fonctionnellement
```

## Stories fullstack par phase

Les stories sont désormais **fullstack** (backend API + frontend UI) :

- **MVP (Phase 1)** — 17 stories dans `stories/mvp/` → voir [MVP-SCOPE.md](../MVP-SCOPE.md)
- **V1 (Phase 2)** — 12 stories dans `stories/v1/` → voir [V1-ROADMAP.md](../V1-ROADMAP.md)
- **V1.1+ (Phase 3)** — 14 stories dans [V1-ROADMAP.md](../V1-ROADMAP.md) (pas de fichiers individuels tant que V1 n'est pas terminée)

Index complet : [stories/_index.md](./stories/_index.md)

## Ce qui est conservé de l'ancienne implémentation

- **Prisma schema** (`prisma/schema.prisma`) — modèles de données validés
- **RLS policies** (`prisma/migrations/`) — sécurité multi-tenant
- **Docker** (compose, Dockerfiles) — infra dev
- **Config** (package.json, tsconfig, .env) — dépendances et configuration
- **i18n** (11 namespaces FR) — traductions frontend
- **lib/** (api-client, auth-client, utils, currency) — utilitaires frontend
