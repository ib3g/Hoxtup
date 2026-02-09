# mvp-07 — iCal Management

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-05 (Properties)

## Objectif

Gérer les sources iCal par propriété : ajouter, modifier, supprimer. Les réservations sont synchronisées automatiquement en backend.

## Tâches

### 1. Section iCal dans la page propriété

- Tab "iCal" dans le détail propriété
- Liste des sources : label, URL (tronquée), dernière sync, statut
- Bouton "Ajouter une source" → Sheet form

### 2. Form ajout/modification source iCal

- Champs : label (ex: "Airbnb Marrakech"), URL iCal (validation URL)
- `POST /api/v1/properties/:propertyId/ical-sources`
- `PATCH` pour modification

### 3. Suppression source

- Bouton supprimer → Dialog confirmation
- `DELETE /api/v1/properties/:propertyId/ical-sources/:sourceId`

### 4. Indicateur de sync

- Badge : "Synced" (vert) ou "Error" (rouge) selon le dernier statut
- Info : "Dernière sync : il y a X minutes"
- Le sync lui-même se fait en background côté backend (BullMQ job) — pas de bouton sync manuel en MVP

## Acceptance Criteria

- [ ] Ajout d'une source iCal fonctionne
- [ ] Modification et suppression fonctionnent
- [ ] L'indicateur de sync est visible
- [ ] L'URL est validée côté client (format URL valide)
- [ ] Après ajout, les réservations importées apparaissent dans la liste réservations
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/properties/:propertyId/ical-sources` — liste
- `POST /api/v1/properties/:propertyId/ical-sources` — ajout
- `PATCH /api/v1/properties/:propertyId/ical-sources/:sourceId` — modification
- `DELETE /api/v1/properties/:propertyId/ical-sources/:sourceId` — suppression
