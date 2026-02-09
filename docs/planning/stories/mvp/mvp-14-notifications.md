# mvp-14 — Notifications

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-02 (App Shell)

## Objectif

Centre de notifications in-app : liste, badge unread, marquer comme lu, préférences.

## Tâches

### 1. NotificationBadge dans le header/nav

- Badge sur l'icône cloche (header desktop) et sur le tab concerné (mobile)
- `GET /api/v1/notifications/unread-count` — polling toutes les 30s ou via TanStack Query refetch
- Rouge (`#C45B4A`) si alertes, amber si pending, teal si info

### 2. Page `/notifications`

- Liste chronologique des notifications
- Chaque notification : icône type, message, timestamp relatif ("il y a 5 min"), dot unread
- Types : task_assigned, task_completed, incident_reported, incident_resolved, reservation_created, stock_alert, etc.
- Clic sur notification → navigate vers l'élément concerné (tâche, incident, propriété)
- Bouton "Tout marquer comme lu" en haut
- Skeleton loading

### 3. Marquer comme lu

- Clic sur notification → `PATCH /api/v1/notifications/:id/read`
- "Tout marquer comme lu" → `PATCH /api/v1/notifications/read-all`
- Optimistic UI : le dot disparaît immédiatement

### 4. Préférences

- Page ou section dans Settings
- Toggle par type de notification : in-app (on/off), email (on/off)
- `GET /api/v1/notifications/preferences`
- `PATCH /api/v1/notifications/preferences`

## Acceptance Criteria

- [ ] Badge affiche le nombre de non-lues
- [ ] Liste des notifications avec timestamp relatif
- [ ] Clic navigue vers l'élément concerné
- [ ] Marquer comme lu fonctionne (individuel et global)
- [ ] Préférences modifiables
- [ ] Polling fonctionne (nouvelles notifs apparaissent sans refresh)
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/notifications` — liste
- `GET /api/v1/notifications/unread-count` — compteur
- `PATCH /api/v1/notifications/:id/read` — marquer lu
- `PATCH /api/v1/notifications/read-all` — tout marquer lu
- `GET /api/v1/notifications/preferences` — préférences
- `PATCH /api/v1/notifications/preferences` — modifier préférences
