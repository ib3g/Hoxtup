# v1-01 — Stock Management

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** MVP complet
**Phase :** V1 — Phase 2A (Inventory & Costs)

## Objectif

CRUD consommables par propriété, mouvements de stock, seuils d'alerte. C'est le différenciateur #1 de Hoxtup.

## Tâches

### 1. Page `/inventory`

- Sélecteur de propriété en haut (PropertyColorDot + dropdown, ou "Toutes")
- Liste items : nom, catégorie, quantité actuelle, seuil min, statut (OK/Low/Critical)
- Badge statut : vert (OK), amber (Low ≤ seuil), rouge (Critical = 0)
- Bouton "Ajouter un consommable" (primary terra)
- Empty state si 0 items

### 2. Form création/modification consommable

- Sheet form : nom, catégorie (select: cleaning/linen/amenity/kitchen/other), unité (pièce/litre/kg), quantité initiale, seuil minimum, propriété
- `POST /api/v1/inventory/items`
- `PATCH /api/v1/inventory/items/:id`

### 3. Mouvements de stock

- Depuis le détail item : boutons "+1" / "-1" rapides + form mouvement complet
- Form mouvement : type (IN/OUT/ADJUSTMENT), quantité, raison (optionnel)
- `POST /api/v1/inventory/items/:id/movements`
- Historique mouvements : liste chronologique
- `GET /api/v1/inventory/items/:id/movements`

### 4. Résumé stock par propriété

- Card résumé en haut de la page : total items, alertes actives, valeur estimée
- `GET /api/v1/properties/:propertyId/inventory/summary`

## Acceptance Criteria

- [ ] CRUD consommables fonctionne
- [ ] Mouvements de stock (+/-/adjustment) fonctionnent
- [ ] La quantité se met à jour en temps réel après un mouvement
- [ ] Les alertes seuil bas sont visibles (badge amber/rouge)
- [ ] Historique mouvements accessible
- [ ] Résumé par propriété affiché
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/properties/:propertyId/inventory` — liste items
- `GET /api/v1/properties/:propertyId/inventory/summary` — résumé
- `POST /api/v1/inventory/items` — créer
- `PATCH /api/v1/inventory/items/:id` — modifier
- `POST /api/v1/inventory/items/:id/movements` — mouvement
- `GET /api/v1/inventory/items/:id/movements` — historique
