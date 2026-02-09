# v1-05 — Task Fusion Engine UI

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** MVP complet
**Phase :** V1 — Phase 2B (Task Intelligence)

## Objectif

Interface pour les suggestions de fusion de tâches. Quand un départ 11h + arrivée 14h se chevauchent sur la même propriété, le backend propose de fusionner en un seul "Turnover". L'UI affiche la suggestion et permet d'accepter ou rejeter.

## Tâches

### 1. Section Fusion Suggestions

- Accessible depuis la page tâches (banner en haut si suggestions en cours)
- Ou page dédiée `/tasks/fusion`
- `GET /api/v1/tasks/fusion-suggestions` — liste des paires

### 2. Composant FusionSuggestionCard

- Affiche les 2 tâches côte à côte (avant) → 1 tâche fusionnée (après)
- Avant : "Ménage départ 11h" + "Ménage arrivée 14h"
- Après : "Turnover 11h-14h" (combiné)
- Gain visible : "Économisez ~1h de travail"
- 2 boutons : "Accepter" (primary terra), "Rejeter" (ghost)

### 3. Accept / Reject

- Accepter : `POST /api/v1/tasks/fusion/:pairId/accept` → les 2 tâches deviennent 1 TURNOVER
- Rejeter : `POST /api/v1/tasks/fusion/:pairId/reject` → la suggestion disparaît
- Optimistic UI + toast confirmation
- Après action, la card disparaît avec animation

### 4. Banner dans la page tâches

- Si ≥ 1 suggestion active : banner amber en haut de la liste tâches
- "X suggestions de fusion disponibles — Voir"
- Clic → scroll vers section ou navigate vers page fusion

## Acceptance Criteria

- [ ] Les suggestions de fusion sont affichées avec comparaison avant/après
- [ ] Accept crée un TURNOVER et supprime les 2 tâches originales
- [ ] Reject supprime la suggestion
- [ ] Banner dans la page tâches si suggestions actives
- [ ] Optimistic UI sur accept/reject
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/tasks/fusion-suggestions` — suggestions
- `POST /api/v1/tasks/fusion/:pairId/accept` — accepter
- `POST /api/v1/tasks/fusion/:pairId/reject` — rejeter
