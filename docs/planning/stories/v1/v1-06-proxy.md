# v1-06 — Proxy Task Management

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** MVP complet
**Phase :** V1 — Phase 2B (Task Intelligence)

## Objectif

Permettre aux Owner/Admin/Manager d'agir au nom d'un Staff Managed (qui n'a pas de compte). Marquer les tâches comme commencées/terminées en proxy.

## Tâches

### 1. Indicateur "Staff Managed" dans les tâches

- TaskCard : si l'assignee est Staff Managed, afficher un badge "Proxy" ou icône distincte
- Le manager sait visuellement quelles tâches nécessitent une action proxy

### 2. Transition proxy

- Depuis le détail tâche : si assignee = Staff Managed, les boutons de transition sont disponibles pour le manager
- "Commencer pour [nom]" / "Terminer pour [nom]" — label clair que c'est du proxy
- `PATCH /api/v1/tasks/:id/proxy-transition` body: `{ action: "start" }` ou `{ action: "complete" }`

### 3. Batch proxy transitions

- Depuis la liste tâches : sélection multiple de tâches Staff Managed
- Barre d'action : "Terminer X tâches pour [nom]"
- Utile quand Sophie fait un point avec Fatima en fin de journée

### 4. Audit trail

- Dans le détail tâche, la timeline montre clairement "Complétée par [manager] au nom de [staff]"
- Distinction visuelle entre action directe et proxy

## Acceptance Criteria

- [ ] Badge "Proxy" visible sur les tâches Staff Managed
- [ ] Transitions proxy fonctionnent (start, complete)
- [ ] Labels clairs "pour [nom]" sur les boutons
- [ ] Batch proxy fonctionne
- [ ] Audit trail distingue proxy vs direct
- [ ] Seuls Owner/Admin/Manager peuvent faire du proxy
- [ ] Tous les textes i18n

## API utilisées

- `PATCH /api/v1/tasks/:id/proxy-transition` — transition proxy
