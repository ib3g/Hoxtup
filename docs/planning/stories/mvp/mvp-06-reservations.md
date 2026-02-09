# mvp-06 — Reservations List

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-05 (Properties)

## Objectif

Liste des réservations avec filtres, statut, source (Airbnb/Booking/Manual), et création manuelle.

## Tâches

### 1. Page liste `/reservations`

- Liste cards : guest name, propriété (PropertyColorDot + nom), dates (check-in → check-out), source, statut
- Filtres : propriété (dropdown), plage de dates, statut (confirmed/pending/cancelled)
- Tri par date check-in (plus récent d'abord)
- Skeleton loading

### 2. Création manuelle

- Bouton "Ajouter" → Sheet form
- Champs : propriété (select), guest name, check-in date, check-out date, source (select: manual/airbnb/booking/other), notes
- `POST /api/v1/reservations`
- Toast confirmation

### 3. Détail réservation

- Sheet ou page `/reservations/:id`
- Infos complètes : guest, dates, propriété, source, statut, notes
- Actions : Modifier (sheet), Annuler (dialog confirmation → `DELETE`)
- Lien vers les tâches générées pour cette réservation

### 4. Badge source

- Icône + label : Airbnb (orange), Booking (blue), Manual (gray), Other (gray)
- Composant `ReservationSourceBadge`

## Acceptance Criteria

- [ ] Liste affiche toutes les réservations
- [ ] Filtres fonctionnent (propriété, dates, statut)
- [ ] Création manuelle fonctionne
- [ ] Modification et annulation fonctionnent
- [ ] Les réservations iCal importées sont visibles avec leur source
- [ ] Tous les textes i18n
- [ ] Responsive

## API utilisées

- `GET /api/v1/reservations` — liste (filtres via query params)
- `GET /api/v1/reservations/:id` — détail
- `POST /api/v1/reservations` — création
- `PATCH /api/v1/reservations/:id` — modification
- `DELETE /api/v1/reservations/:id` — annulation
