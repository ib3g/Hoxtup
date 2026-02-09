# v1-09 — Calendar Multi-Views

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-12 (Calendar)
**Phase :** V1 — Phase 2C (Vues avancées)

## Objectif

Étendre le calendrier MVP (1 vue par propriété) avec 4 vues : Global, Par Propriété, Par Employé, Par Type. Switcher via PillToggle.

## Tâches

### 1. PillToggle composant

- 4 options : Global · Propriété · Employé · Type
- Style : pill segmented control, actif = terra fill, inactif = ghost
- Mobile : scrollable horizontally si trop large
- Persistance : mémoriser le dernier choix dans Zustand ou localStorage

### 2. Vue Global

- Toutes les propriétés sur le même calendrier
- Réservations et tâches color-codées par propriété (PropertyColorDot)
- Dense : résumé par jour (nombre de tâches + nombre de réservations)
- Clic sur jour → expand pour voir les détails

### 3. Vue Par Propriété (existante, enrichir)

- Sélecteur propriété en haut (déjà dans mvp-12)
- Ajouter : vue mois en plus de vue semaine
- Toggle semaine/mois

### 4. Vue Par Employé

- Sélecteur employé en haut
- Affiche toutes les tâches de cet employé, toutes propriétés confondues
- Utile pour Karim qui veut voir la charge de travail d'un employé

### 5. Vue Par Type

- Filtre par type de tâche (CLEANING, CHECKIN, CHECKOUT, etc.)
- Overlay sur le calendrier : ne montre que les tâches du type sélectionné
- Utile pour voir "tous les ménages de la semaine"

### 6. API query params

- `GET /api/v1/calendar?view=global&start=...&end=...`
- `GET /api/v1/calendar?view=property&propertyId=...&start=...&end=...`
- `GET /api/v1/calendar?view=employee&assigneeId=...&start=...&end=...`
- `GET /api/v1/calendar?view=type&taskType=CLEANING&start=...&end=...`

## Acceptance Criteria

- [ ] PillToggle switch entre les 4 vues
- [ ] Vue Global affiche toutes les propriétés avec color-coding
- [ ] Vue Par Employé filtre par assignee
- [ ] Vue Par Type filtre par type de tâche
- [ ] Vue semaine et mois disponibles
- [ ] Responsive
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/calendar` — avec différents query params selon la vue
