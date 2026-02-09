# mvp-09 — Task Detail & Transitions

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-08 (Task List)

## Objectif

Page détail d'une tâche avec toutes les infos et les boutons de transition d'état (validate → assign → start → complete).

## Tâches

### 1. Page détail `/tasks/:id`

- Header : type badge, statut badge, propriété (ColorDot + nom)
- Infos : description, date/heure prévue, durée estimée, assignee, créé par, source (auto/manual)
- Timeline : historique des transitions (créé → validé → assigné → en cours → complété)
- Section réservation liée (si auto-generated) : lien vers la réservation

### 2. Boutons de transition

Selon l'état courant et le rôle de l'utilisateur :

- `pending_validation` → "Valider" (Owner/Admin) → `PATCH /tasks/:id/transition` body: `{ action: "validate" }`
- `validated` → "Assigner" → ouvre sélecteur membre (voir mvp-10)
- `assigned` → "Commencer" (assignee uniquement) → `{ action: "start" }`
- `in_progress` → "Terminer" (assignee) → `{ action: "complete" }`
- `blocked` → "Résoudre l'incident" → lien vers incident

Bouton principal = primary terra, full-width sur mobile.

### 3. Action "Signaler un problème"

- Bouton destructive en bas de page
- Ouvre form simple : type incident (dropdown), description (textarea)
- `POST /api/v1/tasks/:id/incident`
- Toast confirmation → tâche passe en `blocked`

### 4. Optimistic UI

- Au clic sur transition → UI met à jour immédiatement (couleur, texte)
- Toast avec "Annuler" (5s)
- Si erreur réseau → rollback + toast erreur

## Acceptance Criteria

- [ ] Le détail affiche toutes les infos de la tâche
- [ ] Les boutons de transition corrects s'affichent selon état + rôle
- [ ] Chaque transition met à jour l'état correctement
- [ ] "Signaler un problème" crée un incident et bloque la tâche
- [ ] Optimistic UI fonctionne (pas d'attente visible)
- [ ] Timeline des transitions est visible
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/tasks/:id` — détail
- `PATCH /api/v1/tasks/:id/transition` — transition d'état
- `POST /api/v1/tasks/:id/incident` — signaler incident
