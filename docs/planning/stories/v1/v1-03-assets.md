# v1-03 — Asset Tracking

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** MVP complet

## Objectif

CRUD assets (équipements durables) par propriété : lave-linge, climatisation, TV, etc. Avec coût d'achat et catégorie.

## Tâches

### 1. Section Assets dans la page propriété ou inventory

- Tab "Assets" dans la page inventory
- Liste : nom, catégorie, date achat, coût, statut (actif/en panne/remplacé)
- Bouton "Ajouter un asset"

### 2. Form création/modification

- Sheet form : nom, catégorie (select: appliance/furniture/electronics/hvac/other), date achat (date picker), coût d'achat (input monétaire avec currency), propriété, notes
- `POST /api/v1/assets`
- `PATCH /api/v1/assets/:id`

### 3. Suppression

- `DELETE /api/v1/assets/:id` → dialog confirmation

### 4. Résumé

- Total assets, valeur totale, par catégorie

## Acceptance Criteria

- [ ] CRUD assets fonctionne
- [ ] Coût affiché avec la bonne currency (EUR/MAD)
- [ ] Catégories fonctionnent
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/properties/:propertyId/assets` — liste
- `POST /api/v1/assets` — créer
- `PATCH /api/v1/assets/:id` — modifier
- `DELETE /api/v1/assets/:id` — supprimer
