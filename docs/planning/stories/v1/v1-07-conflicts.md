# v1-07 — Task Conflict Detection UI

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** MVP complet
**Phase :** V1 — Phase 2B (Task Intelligence)

## Objectif

Afficher les conflits de tâches détectés par le backend (même employé, même créneau, propriétés différentes) et permettre de les acknowledger ou résoudre.

## Tâches

### 1. Page/Section conflits

- Accessible depuis page tâches ou `/incidents` (tab Conflicts)
- `GET /api/v1/conflicts` — liste des conflits actifs
- Chaque conflit : 2 tâches en conflit, raison, sévérité

### 2. Composant ConflictCard

- Les 2 tâches côte à côte avec PropertyColorDot
- Raison du conflit : "Même employé assigné à 2 tâches simultanées"
- Actions : "Reconnaître" (acknowledge), "Résoudre" (reassign ou modifier horaire)

### 3. Actions

- Acknowledge : `PATCH /api/v1/conflicts/:id/acknowledge` — le manager a vu
- Résoudre : `PATCH /api/v1/conflicts/:id/resolve` — marquer comme résolu (après réassignation manuelle)

### 4. Alerte dans le dashboard

- Si conflits actifs : alerte rouge dans la section alertes du dashboard manager

## Acceptance Criteria

- [ ] Liste des conflits affichée
- [ ] Acknowledge et Resolve fonctionnent
- [ ] Alerte dans le dashboard si conflits actifs
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/conflicts` — liste
- `PATCH /api/v1/conflicts/:conflictId/acknowledge` — reconnaître
- `PATCH /api/v1/conflicts/:conflictId/resolve` — résoudre
