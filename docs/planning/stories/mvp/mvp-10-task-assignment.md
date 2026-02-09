# mvp-10 — Task Assignment

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-08 (Task List)

## Objectif

Permettre aux Owner/Admin/Manager d'assigner des tâches aux membres de l'équipe, individuellement ou en lot.

## Tâches

### 1. Sélecteur de membre

- Composant `MemberSelector` réutilisable
- Liste des membres actifs de l'organisation avec nom + rôle + avatar initiales
- Recherche par nom
- Utilisé dans : détail tâche, bulk assign, création tâche

### 2. Assignation individuelle

- Depuis le détail tâche (mvp-09) : bouton "Assigner" → MemberSelector en Sheet
- `PATCH /api/v1/tasks/:id/assign` body: `{ assigneeId: "..." }`
- Toast confirmation : "Tâche assignée à [nom]"

### 3. Assignation en lot (bulk)

- Depuis la liste tâches : sélection multiple (checkboxes)
- Barre d'action en bas : "X tâches sélectionnées" + bouton "Assigner"
- `POST /api/v1/tasks/bulk-assign` body: `{ taskIds: [...], assigneeId: "..." }`
- Toast confirmation : "X tâches assignées à [nom]"

### 4. Réassignation

- Depuis le détail d'une tâche déjà assignée : bouton "Réassigner"
- Même flow que l'assignation initiale

## Acceptance Criteria

- [ ] Assignation individuelle fonctionne depuis le détail tâche
- [ ] Bulk assign fonctionne depuis la liste tâches
- [ ] Le MemberSelector affiche les membres avec recherche
- [ ] Réassignation fonctionne
- [ ] Seuls Owner/Admin/Manager voient les boutons d'assignation
- [ ] Toast de confirmation après chaque action
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/team` — liste des membres
- `PATCH /api/v1/tasks/:id/assign` — assignation individuelle
- `POST /api/v1/tasks/bulk-assign` — assignation en lot
