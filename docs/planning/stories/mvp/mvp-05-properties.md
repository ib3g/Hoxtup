# mvp-05 — Properties List & Detail

**Status :** `done`
**Scope :** Backend + Frontend
**Dépendances :** mvp-02 (App Shell)

## Objectif

CRUD complet des propriétés : liste, détail, création, modification, archivage. Chaque propriété a une couleur assignée (PropertyColorDot).

## Tâches

### 1. Page liste `/properties`

- Liste cards avec : PropertyColorDot, nom, adresse, type, statut (active/archived)
- Filtre par statut (active par défaut, toggle pour voir archivées)
- Bouton "Ajouter" (primary terra) → ouvre form création
- Empty state si 0 propriétés : illustration + "Ajoutez votre première propriété" + CTA
- Skeleton loading pendant le fetch

### 2. Page détail `/properties/:id`

- Header avec PropertyColorDot (large), nom, adresse
- Tabs : Infos · Réservations · iCal · Tâches (Réservations et Tâches sont des liens vers les pages filtrées)
- Tab Infos : type, adresse, notes, date création
- Boutons actions : Modifier (secondary), Archiver (destructive)
- Archivage → dialog confirmation → `DELETE /properties/:id`
- Réactivation si archivée → `PATCH /properties/:id/reactivate`

### 3. Form création/modification

- Sheet (bottom drawer mobile, side panel desktop)
- Champs : nom (required), adresse, type (select: apartment/house/studio/villa/room), couleur (color picker 5 options), notes
- Création : `POST /properties`
- Modification : `PATCH /properties/:id`
- Toast confirmation après succès

### 4. PropertyColorDot composant

- 3 tailles : Small (6px), Medium (10px), Large (16px)
- Couleurs : `--prop-1` à `--prop-5`, puis HSL rotation pour 6+
- Utilisé dans : liste propriétés, task cards, calendar events, reservations

## Acceptance Criteria

- [x] Liste affiche toutes les propriétés actives
- [x] Création fonctionne et la nouvelle propriété apparaît dans la liste
- [x] Modification met à jour les infos
- [x] Archivage → propriété disparaît de la liste (visible avec toggle)
- [x] Réactivation fonctionne
- [x] PropertyColorDot est cohérent partout
- [ ] Subscription guard : si limite propriétés atteinte → message + CTA upgrade (post-MVP billing)
- [x] Tous les textes i18n
- [x] Responsive mobile/desktop

## API utilisées

- `GET /api/v1/properties` — liste
- `GET /api/v1/properties/:id` — détail
- `POST /api/v1/properties` — création
- `PATCH /api/v1/properties/:id` — modification
- `DELETE /api/v1/properties/:id` — archivage
- `PATCH /api/v1/properties/:id/reactivate` — réactivation
