# mvp-12 — Calendar View

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-06 (Reservations), mvp-08 (Task List)

## Objectif

Vue calendrier unique par propriété montrant réservations, tâches et incidents sur une timeline. MVP = 1 seule vue (par propriété, semaine).

## Tâches

### 1. Page `/calendar`

- Sélecteur de propriété en haut (PropertyColorDot + dropdown)
- Vue semaine par défaut (7 colonnes desktop, scroll horizontal mobile)
- Navigation : semaine précédente / suivante, bouton "Aujourd'hui"
- `GET /api/v1/calendar?start=...&end=...&propertyId=...`

### 2. Événements sur le calendrier

3 types d'événements avec couleurs distinctes :

- **Réservations** : barre horizontale sur les jours (check-in → check-out), couleur propriété en fond léger
- **Tâches** : pastille sur le jour/heure, couleur selon statut (amber pending, terra in_progress, vert completed, rouge blocked)
- **Incidents** : icône alerte rouge sur le jour

### 3. Interaction

- Clic sur réservation → Sheet détail réservation
- Clic sur tâche → Sheet détail tâche (avec boutons transition)
- Clic sur jour vide → option "Créer une tâche" (pré-remplit la date)

### 4. Mobile

- Vue 3 jours (au lieu de 7) sur mobile
- Scroll horizontal pour naviguer
- Touch-friendly : zones cliquables ≥ 48px

### 5. Lib calendrier

- Utiliser une lib légère ou construire custom avec CSS Grid
- Options recommandées : `@schedule-x/react` ou custom grid
- Pas de lib lourde (FullCalendar = trop lourd pour le MVP)

## Acceptance Criteria

- [ ] Le calendrier affiche les réservations, tâches et incidents
- [ ] Le sélecteur de propriété filtre correctement
- [ ] Navigation semaine précédente/suivante fonctionne
- [ ] Clic sur événement ouvre le détail
- [ ] Vue 3 jours sur mobile, 7 jours sur desktop
- [ ] Skeleton loading
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/calendar?start=...&end=...&propertyId=...&view=week` — événements unifiés
