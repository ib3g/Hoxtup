# v1-04 — Financial Reporting

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** v1-01 (Stock), v1-03 (Assets)

## Objectif

Rapports financiers par propriété et global : coûts (consommables + assets), revenus, profit/perte. Charts visuels.

## Tâches

### 1. Page `/analytics` ou section dans propriété

- Sélecteur de propriété (ou "Toutes" pour vue globale)
- Sélecteur de période (ce mois, mois dernier, trimestre, année, custom)

### 2. Rapport par propriété

- `GET /api/v1/properties/:propertyId/financials`
- Sections :
  - Revenus : total, par source (Airbnb/Booking/Direct/Other)
  - Coûts consommables : total, par catégorie
  - Coûts assets : total, amortissement simple
  - Profit/Perte : revenus - coûts (gros chiffre, vert si positif, rouge si négatif)

### 3. Résumé organisation

- `GET /api/v1/financials/summary`
- Comparaison entre propriétés : bar chart
- KPIs : revenu total, coût total, profit total, propriété la plus rentable

### 4. Charts

- Bar chart : revenus vs coûts par mois
- Pie chart : répartition coûts par catégorie
- Lib recommandée : `recharts` (léger, React-native)
- Mobile : charts en plein écran, scroll vertical

### 5. Currency formatting

- Utiliser `useCurrency()` hook existant
- EUR : 1 234,56 € / MAD : 1 234,56 MAD
- Montants stockés en centimes → diviser par 100 pour affichage

## Acceptance Criteria

- [ ] Rapport par propriété affiche revenus, coûts, profit
- [ ] Résumé org compare les propriétés
- [ ] Charts fonctionnent (bar + pie)
- [ ] Currency formatting correct (EUR/MAD)
- [ ] Sélecteur période fonctionne
- [ ] Responsive (charts plein écran mobile)
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/properties/:propertyId/financials` — rapport propriété
- `GET /api/v1/financials/summary` — résumé org
