# mvp-11 — Manual Task Creation

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-08 (Task List)

## Objectif

Formulaire de création de tâche manuelle (hors auto-generation). Accessible depuis le FAB sur la page tâches.

## Tâches

### 1. Form création

- Sheet (bottom drawer mobile, side panel desktop)
- Champs :
  - Propriété (select, required) — PropertyColorDot + nom
  - Type (select) : CLEANING, CHECKIN, CHECKOUT, INSPECTION, CUSTOM
  - Date et heure prévue (date picker + time picker)
  - Description (textarea, optionnel)
  - Assignee (MemberSelector, optionnel — si vide = pending_validation)
  - Priorité (low/normal/high, défaut = normal)
- `POST /api/v1/tasks`
- Toast confirmation

### 2. Validation

- Propriété required
- Date required et doit être >= aujourd'hui
- Si type = CUSTOM → description obligatoire
- Zod schema dans le composant (pour i18n des messages d'erreur)

### 3. Raccourci depuis la page propriété

- Bouton "Créer une tâche" dans le détail propriété
- Pré-remplit le champ propriété

## Acceptance Criteria

- [ ] Création de tâche manuelle fonctionne
- [ ] La tâche apparaît dans la liste après création
- [ ] Si assignee fourni → tâche créée en état `assigned`
- [ ] Si pas d'assignee → tâche créée en `pending_validation`
- [ ] Validation inline fonctionne
- [ ] Raccourci depuis propriété pré-remplit le champ
- [ ] Tous les textes i18n

## API utilisées

- `POST /api/v1/tasks` — création
- `GET /api/v1/properties` — pour le select propriétés
- `GET /api/v1/team` — pour le MemberSelector
