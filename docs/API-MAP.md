# API Map — Tous les endpoints backend

> Base URL : `http://localhost:8000/api/v1`
> Auth : Better Auth sur `http://localhost:8000/api/auth/*`
> Tous les endpoints (sauf health et webhooks) nécessitent : `requireAuth` + `tenantMiddleware`
> Format erreurs : RFC 7807 Problem Details
> Convention : camelCase (JSON), snake_case (DB), kebab-case (URLs)

---

## Health

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| GET | `/health` | Non | Health check → `{"status":"ok"}` |

## Auth (Better Auth)

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| POST | `/api/auth/sign-up/email` | Non | Inscription (email + password + name) |
| POST | `/api/auth/sign-in/email` | Non | Connexion (email + password) → session cookie |
| POST | `/api/auth/sign-out` | Session | Déconnexion |
| GET | `/api/auth/get-session` | Session | Session courante (retourne `null` si pas de session) |

> **Note :** Les routes Better Auth sont montées sur `/api/auth/*` via `toNodeHandler(auth)`, pas sur `/api/v1/`.

## Organizations

| Method | Endpoint | Auth | Permission | Description |
|:---|:---|:---|:---|:---|
| POST | `/organizations` | Session | — | Créer une organisation (post-signup) |

## Properties

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/properties` | `property:read` | Lister les propriétés (filtrées par scope) |
| GET | `/properties/:id` | `property:read` | Détail d'une propriété |
| POST | `/properties` | `property:create` | Créer une propriété |
| PATCH | `/properties/:id` | `property:update` | Modifier une propriété |
| DELETE | `/properties/:id` | `property:archive` | Archiver une propriété |
| PATCH | `/properties/:id/reactivate` | `property:archive` | Réactiver une propriété archivée |

## Reservations

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/reservations` | `property:read` | Lister les réservations (filtres: propertyId, dateRange) |
| GET | `/reservations/:id` | `property:read` | Détail d'une réservation |
| POST | `/reservations` | `property:update` | Créer une réservation manuelle |
| PATCH | `/reservations/:id` | `property:update` | Modifier une réservation |
| DELETE | `/reservations/:id` | `property:update` | Annuler une réservation |

## iCal Sources

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/properties/:propertyId/ical-sources` | `property:read` | Lister les sources iCal d'une propriété |
| POST | `/properties/:propertyId/ical-sources` | `property:update` | Ajouter une source iCal |
| PATCH | `/properties/:propertyId/ical-sources/:sourceId` | `property:update` | Modifier une source iCal |
| DELETE | `/properties/:propertyId/ical-sources/:sourceId` | `property:update` | Supprimer une source iCal |

## Tasks

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/tasks` | `task:read` | Lister toutes les tâches (filtres: status, propertyId, assigneeId, dateRange) |
| GET | `/tasks/my` | `task:read` | Mes tâches assignées |
| GET | `/tasks/scoped` | `task:read` | Tâches filtrées par scope utilisateur |
| GET | `/tasks/:id` | `task:read` | Détail d'une tâche |
| POST | `/tasks` | `task:create` | Créer une tâche manuelle |
| PATCH | `/tasks/:id/assign` | `task:assign` | Assigner une tâche à un membre |
| PATCH | `/tasks/:id/transition` | `task:update` | Changer l'état d'une tâche (validate, start, complete) |
| PATCH | `/tasks/:id/proxy-transition` | `task:proxy` | Transition proxy (agir au nom d'un staff) |
| POST | `/tasks/bulk-assign` | `task:assign` | Assignation en lot |

## Task Fusion

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/tasks/fusion-suggestions` | `task:validate` | Suggestions de fusion en cours |
| POST | `/tasks/fusion/:pairId/accept` | `task:validate` | Accepter une fusion |
| POST | `/tasks/fusion/:pairId/reject` | `task:validate` | Rejeter une fusion |

## Task Auto-Rules

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/properties/:propertyId/auto-rules` | `property:read` | Règles d'auto-génération d'une propriété |
| PATCH | `/properties/:propertyId/auto-rules/:ruleId` | `property:update` | Modifier une règle |

## Incidents

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| POST | `/tasks/:id/incident` | `incident:create` | Signaler un incident sur une tâche |
| GET | `/incidents` | `task:read` | Lister les incidents |
| PATCH | `/incidents/:incidentId/resolve` | `incident:resolve` | Résoudre un incident |

## Conflicts

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/conflicts` | `task:read` | Lister les conflits de tâches |
| PATCH | `/conflicts/:conflictId/acknowledge` | `task:validate` | Reconnaître un conflit |
| PATCH | `/conflicts/:conflictId/resolve` | `task:validate` | Résoudre un conflit |

## Calendar

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/calendar` | `task:read` | Événements unifiés (tâches + réservations + incidents). Filtres: start, end, propertyId, view |

## Notifications

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/notifications` | (user) | Mes notifications |
| GET | `/notifications/unread-count` | (user) | Nombre de non-lues |
| PATCH | `/notifications/:id/read` | (user) | Marquer comme lue |
| PATCH | `/notifications/read-all` | (user) | Tout marquer comme lu |
| GET | `/notifications/preferences` | (user) | Mes préférences de notification |
| PATCH | `/notifications/preferences` | (user) | Modifier mes préférences |

## Team (Users)

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/team` | `team:read` | Lister les membres de l'équipe |
| POST | `/team/staff-managed` | `team:manage` | Créer un staff managed (sans compte) |
| PATCH | `/team/:id/role` | `team:manage` | Changer le rôle d'un membre |
| DELETE | `/team/:id` | `team:manage` | Retirer un membre |

## Dashboard

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/dashboard/home` | `analytics:view` | Dashboard principal (KPIs + tâches du jour + alertes) |
| GET | `/dashboard/field` | `task:read` | Dashboard terrain (prochaine tâche + compteur) |
| GET | `/dashboard/activity` | `analytics:view` | Résumé d'activité (tâches complétées, incidents, etc.) |

## Inventory — Consumables

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/properties/:propertyId/inventory` | `inventory:read` | Stock d'une propriété |
| GET | `/properties/:propertyId/inventory/summary` | `inventory:read` | Résumé stock (alertes, valeur) |
| POST | `/inventory/items` | `inventory:manage` | Créer un consommable |
| PATCH | `/inventory/items/:id` | `inventory:manage` | Modifier un consommable |
| POST | `/inventory/items/:id/movements` | `inventory:read` | Enregistrer un mouvement de stock |
| GET | `/inventory/items/:id/movements` | `inventory:read` | Historique des mouvements |

## Inventory — Assets

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/properties/:propertyId/assets` | `inventory:read` | Assets d'une propriété |
| POST | `/assets` | `inventory:manage` | Créer un asset |
| PATCH | `/assets/:id` | `inventory:manage` | Modifier un asset |
| DELETE | `/assets/:id` | `inventory:manage` | Supprimer un asset |

## Revenue & Financials

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/properties/:propertyId/revenue` | `billing:view` | Revenus d'une propriété |
| POST | `/properties/:propertyId/revenue` | `billing:manage` | Ajouter une entrée de revenu |
| GET | `/properties/:propertyId/financials` | `billing:view` | Rapport financier propriété (consommables + assets + revenus) |
| GET | `/financials/summary` | `billing:view` | Résumé financier org (toutes propriétés comparées) |

## Billing

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| GET | `/billing` | `billing:view` | Subscription courante |
| GET | `/billing/plans` | (any auth) | Plans disponibles avec pricing |
| POST | `/billing/cancel` | `billing:manage` | Annuler subscription (nécessite re-auth) |
| POST | `/webhooks/polar` | (none — webhook) | Webhook Polar (signature verification) |

---

## RBAC — Matrice des permissions

| Permission | Owner | Admin | Manager | Staff Autonomous | Staff Managed |
|:---|:---|:---|:---|:---|:---|
| `property:read` | ✅ | ✅ | ✅ (scoped) | ✅ (scoped) | ✅ (scoped) |
| `property:create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `property:update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `property:archive` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `task:read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `task:create` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `task:update` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `task:assign` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `task:validate` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `task:proxy` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `incident:create` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `incident:resolve` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `team:read` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `team:manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `inventory:read` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `inventory:manage` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `billing:view` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `billing:manage` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `analytics:view` | ✅ | ✅ | ✅ | ❌ | ❌ |
