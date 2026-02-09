# V1 Roadmap — MVP → V1 → V1.1+

> Vue complète du projet. Chaque phase s'appuie sur la précédente. L'agent AI doit pouvoir suivre cette séquence sans intervention.

---

## Vue d'ensemble

```text
Phase 1 — MVP
  → Produit utilisable et vendable
  → Sophie remplace WhatsApp + Excel
  → Fullstack : backend API + frontend UI (réécriture complète)

Phase 2 — V1 Complète
  → Tous les différenciateurs activés
  → Stock, Fusion, Financial, Calendar avancé

Phase 3 — V1.1+
  → Polish, PWA, optimisations
  → Basé sur le feedback utilisateurs réels
```

---

## Phase 1 — MVP (17 stories fullstack)

> Détail complet dans [MVP-SCOPE.md](./MVP-SCOPE.md)

**Objectif :** Premier utilisateur payant.

**Couverture fonctionnelle :**

- Auth (login, register, org creation)
- Properties CRUD + iCal sync
- Reservations (manuelles + iCal)
- Tasks (create, assign, transition, complete)
- Calendar (1 vue par propriété)
- Team management (inviter, rôles)
- Notifications (badge, liste, préférences)
- Dashboard (KPIs basiques, tâches du jour)
- Settings & profil
- Billing (plans, checkout Polar)

**Stories :** mvp-01 à mvp-17 (voir `planning/stories/mvp/`)

> **Note post-audit :** Chaque story est désormais fullstack (backend API + frontend UI).

---

## Phase 2 — V1 Complète (12 stories fullstack)

**Objectif :** Activer tous les différenciateurs (stock, fusion, financials) et couvrir les personas avancées (Karim manager 20 propriétés).

> **Note post-audit :** Comme pour le MVP, chaque story V1 est fullstack. Les APIs listées sont à **implémenter** (pas existantes).

### Phase 2A — Inventory & Costs (stories v1-01 à v1-04)

| # | Story | Scope | API à implémenter |
|:---|:---|:---|:---|
| v1-01 | Stock Management | Backend : CRUD consommables + mouvements. Frontend : liste, forms, historique | `GET/POST /inventory/*`, `POST /inventory/items/:id/movements` |
| v1-02 | Stock Alerts UI | Backend : summary + alertes. Frontend : affichage alertes, notification visuelle | `GET /properties/:id/inventory/summary` |
| v1-03 | Asset Tracking | Backend : CRUD assets. Frontend : liste assets, forms, catégories | `GET/POST/PATCH/DELETE /assets/*` |
| v1-04 | Financial Reporting | Backend : agrégation financière. Frontend : rapport coûts, revenus, charts | `GET /properties/:id/financials`, `GET /financials/summary` |

### Phase 2B — Task Intelligence (stories v1-05 à v1-08)

| # | Story | Scope | API à implémenter |
|:---|:---|:---|:---|
| v1-05 | Task Fusion Engine UI | Backend : fusion detection + accept/reject. Frontend : suggestion cards, banner | `GET /tasks/fusion-suggestions`, `POST /tasks/fusion/:pairId/*` |
| v1-06 | Proxy Task Management | Backend : proxy transitions + audit. Frontend : proxy actions, batch transitions | `PATCH /tasks/:id/proxy-transition` |
| v1-07 | Task Conflict Detection UI | Backend : conflict detection. Frontend : liste conflits, resolve UI | `GET /conflicts`, `PATCH /conflicts/:id/*` |
| v1-08 | Incident Reporting (complet) | Backend : incident endpoint (déjà MVP). Frontend : form complet + Camera API | `POST /tasks/:id/incident` |

### Phase 2C — Vues avancées (stories v1-09 à v1-12)

| # | Story | Scope | API à implémenter |
|:---|:---|:---|:---|
| v1-09 | Calendar Multi-Views | Backend : vues calendrier multiples. Frontend : 4 vues + PillToggle | `GET /calendar?view=...` |
| v1-10 | Dashboard KPIs avancés | Backend : endpoints activity. Frontend : KPIs détaillés, comparaisons | `GET /dashboard/home`, `GET /dashboard/activity` |
| v1-11 | Auto-Rules Management | Backend : CRUD auto-rules. Frontend : config UI par propriété | `GET/PATCH /properties/:id/auto-rules` |
| v1-12 | Revenue Entry UI | Backend : revenue endpoint. Frontend : saisie manuelle, source select | `POST /properties/:id/revenue` |

---

## Phase 3 — V1.1+ (priorité basée sur le feedback utilisateurs)

> Ces stories sont planifiées mais leur ordre dépendra du feedback réel post-lancement.

### UX Polish

| # | Story | Scope |
|:---|:---|:---|
| v1.1-01 | Zen State & Micro-animations | Indicateur Zen State (tout est fait), animations de complétion tâche, transitions fluides |
| v1.1-02 | Temporal Dashboard | Adaptation contenu par heure (matin: planning, midi: alertes, soir: résumé) |
| v1.1-03 | Empty States | Illustrations + CTA contextuelles pour chaque module vide |
| v1.1-04 | Skeleton Loading | Skeleton loaders pour toutes les pages (pas de spinners) |

### Performance & Infra

| # | Story | Scope |
|:---|:---|:---|
| v1.1-05 | Redis Caching | Cache dashboard, financial endpoints (5min TTL) |
| v1.1-06 | BullMQ Scheduled Jobs | Alertes prédictives stock, rappels fin trial, cleanup GDPR |
| v1.1-07 | PWA Setup | Service worker, offline queue, install prompt |
| v1.1-08 | Performance Audit | Lighthouse CI, bundle analysis, lazy loading, image optimization |

### Features additionnelles

| # | Story | Scope |
|:---|:---|:---|
| v1.1-09 | Property Owner Client View | Rôle "Client" (read-only) pour les propriétaires qui délèguent la gestion |
| v1.1-10 | Export PDF/CSV | Export rapports financiers, liste tâches, activité |
| v1.1-11 | Search Globale | Recherche unifiée (tâches, propriétés, membres) depuis le header |
| v1.1-12 | Dark Mode | Support dark mode via CSS custom properties |
| v1.1-13 | Swipe Gestures | Swipe-to-complete, swipe-to-actions sur mobile |
| v1.1-14 | Voice-to-Text Incidents | Web Speech API pour description incidents (FR) |

---

## Résumé global

| Phase | Stories | Scope |
|:---|:---|:---|
| **Phase 1 — MVP** | 17 | Fullstack : auth, properties, tasks, calendar, team, notifs, billing |
| **Phase 2 — V1** | 12 | Fullstack : stock, fusion, proxy, financial, calendar multi-vues |
| **Phase 3 — V1.1+** | 14 | Polish, PWA, performance, features additionnelles |
| **Total projet** | **43 stories** | |

---

## Dependency Graph

```text
Phase 1 (MVP)
  mvp-01 (Design System)
    └─► mvp-02 (App Shell)
          ├─► mvp-03 (Auth) ─► mvp-04 (Onboarding)
          ├─► mvp-05 (Properties)
          │     ├─► mvp-06 (Reservations)
          │     ├─► mvp-07 (iCal)
          │     └─► mvp-08 (Task List)
          │           ├─► mvp-09 (Task Detail)
          │           ├─► mvp-10 (Task Assignment)
          │           └─► mvp-11 (Manual Task)
          ├─► mvp-12 (Calendar) ← mvp-06 + mvp-08
          ├─► mvp-13 (Team)
          ├─► mvp-14 (Notifications)
          ├─► mvp-15 (Dashboard) ← mvp-06 + mvp-08
          ├─► mvp-16 (Settings)
          └─► mvp-17 (Billing)

Phase 2 (V1) — dépend du MVP complet
  v1-01 (Stock) ─► v1-02 (Stock Alerts)
  v1-03 (Assets) ─► v1-04 (Financial Reports) ← v1-01
  v1-05 (Fusion UI)
  v1-06 (Proxy)
  v1-07 (Conflicts)
  v1-08 (Incident Form complet)
  v1-09 (Calendar Multi-Views) ← mvp-12
  v1-10 (Dashboard avancé) ← mvp-15
  v1-11 (Auto-Rules)
  v1-12 (Revenue Entry) ← v1-04

Phase 3 (V1.1+) — dépend de V1 complète
  (ordre flexible selon feedback utilisateurs)
```

---

## Principes d'exécution

1. **Ship MVP first.** Aucune story V1 ne commence avant que le MVP soit déployé et testé par au moins 1 utilisateur réel.
2. **Stories courtes.** Si une story prend trop de temps, la découper.
3. **Fullstack par story.** Chaque story implémente le backend (OpenAPI spec + service tenant-scoped + route + tests) ET le frontend (shadcn/ui + TanStack Query + i18n).
4. **Backend d'abord.** Pour chaque story, implémenter et tester l'API avant le frontend.
5. **Tout passe par i18n.** Pas de texte hardcodé en français. Tout dans `t()`.
6. **Mobile-first.** Chaque composant est d'abord conçu pour mobile, puis adapté desktop.
7. **Mettre à jour STATUS.md** à chaque fin de story.
