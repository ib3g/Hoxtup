# v1-12 — Revenue Entry UI

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** v1-04 (Financials)
**Phase :** V1 — Phase 2C (Vues avancées)

## Objectif

Interface pour saisir manuellement les revenus par propriété (Airbnb, Booking, direct). Alimente les rapports financiers.

## Tâches

### 1. Section Revenus dans le détail propriété ou financials

- Tab "Revenus" dans la page propriété ou section dans `/analytics`
- Liste des entrées : date, montant, source, notes
- `GET /api/v1/properties/:propertyId/revenue`

### 2. Form ajout revenu

- Sheet form : montant (input monétaire), source (select: airbnb/booking/direct/other), date (date picker), notes (optionnel)
- `POST /api/v1/properties/:propertyId/revenue`
- Toast confirmation

### 3. Résumé revenus

- Total du mois, du trimestre, de l'année
- Breakdown par source (pie chart ou barres)
- Comparaison mois précédent (flèche up/down + pourcentage)

### 4. Currency

- Utiliser `useCurrency()` pour le formatage
- Input : keypad numérique, virgule comme séparateur décimal pour EUR

## Acceptance Criteria

- [ ] Ajout de revenu fonctionne
- [ ] Liste des revenus par propriété
- [ ] Résumé avec breakdown par source
- [ ] Currency formatting correct
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/properties/:propertyId/revenue` — liste
- `POST /api/v1/properties/:propertyId/revenue` — ajouter
