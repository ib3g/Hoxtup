# v1-10 — Dashboard KPIs avancés

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-15 (Dashboard)
**Phase :** V1 — Phase 2C (Vues avancées)

## Objectif

Enrichir le dashboard manager avec KPIs détaillés, comparaison entre propriétés, et résumé d'activité.

## Tâches

### 1. KPIs enrichis

En plus des KPIs MVP (tâches, check-ins, incidents, retards) :

- Taux de complétion tâches (%) — vert si > 90%, amber si 70-90%, rouge si < 70%
- Temps moyen de complétion tâche
- Propriété la plus active (nombre de tâches)
- Stock alerts count
- Revenue du mois (si V1 financials fait)

### 2. Comparaison propriétés

- Mini bar chart : tâches complétées par propriété (horizontal bars, PropertyColorDot)
- Top 3 propriétés les plus actives
- `GET /api/v1/dashboard/activity`

### 3. Activité récente

- Feed chronologique des dernières actions :
  - "Fatima a complété Ménage — Riad Atlas"
  - "Nouvelle réservation — Appartement Gueliz"
  - "Incident signalé — Villa Palmeraie"
- 10 dernières entrées
- Timestamp relatif

### 4. Section alertes enrichie

- Regrouper : incidents, conflits, stock alerts, tâches non assignées
- Badge compteur par catégorie
- CTA vers la page concernée

## Acceptance Criteria

- [ ] KPIs enrichis affichés avec couleurs conditionnelles
- [ ] Comparaison propriétés en mini bar chart
- [ ] Feed activité récente fonctionnel
- [ ] Section alertes regroupée
- [ ] Skeleton loading
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/dashboard/home` — KPIs + alertes
- `GET /api/v1/dashboard/activity` — activité récente
