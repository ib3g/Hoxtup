# mvp-04 — Onboarding Flow

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-03 (Auth Pages)

## Objectif

Flow guidé post-signup : créer la première propriété, connecter un calendrier iCal, et voir ses premières réservations. C'est le moment "aha" de Sophie.

## Tâches

### 1. Step 1 — Créer sa première propriété

- Form : nom, adresse, type (apartment/house/studio), couleur
- Couleur : sélecteur avec les 5 property colors prédéfinis
- `POST /api/v1/properties`
- Transition fluide vers step 2

### 2. Step 2 — Connecter un calendrier iCal

- Explication : "Collez l'URL iCal de votre annonce Airbnb/Booking"
- Input URL + label (ex: "Airbnb")
- `POST /api/v1/properties/:propertyId/ical-sources`
- Option "Passer cette étape" (ghost button)
- Si connecté : afficher un spinner puis confirmation "X réservations importées"

### 3. Step 3 — Confirmation & redirect

- Écran de confirmation : "Votre propriété est prête !"
- Résumé : nom propriété, X réservations importées, X tâches auto-générées
- Bouton "Voir mon tableau de bord" (primary terra)
- Redirect vers `/dashboard`

### 4. Progress indicator

- Stepper horizontal : 3 dots avec labels
- Step actif en terra, done en vert, pending en gray
- Pas de back button (simplifier)

## Acceptance Criteria

- [ ] Le flow complet fonctionne : propriété → iCal → dashboard
- [ ] Skip iCal fonctionne (va directement au dashboard)
- [ ] La propriété apparaît ensuite dans la liste des propriétés
- [ ] Si iCal connecté, les réservations sont visibles après sync
- [ ] Tous les textes i18n
- [ ] Mobile-first, formulaires confortables sur petit écran

## API utilisées

- `POST /api/v1/properties` — créer propriété
- `POST /api/v1/properties/:id/ical-sources` — ajouter source iCal
- `GET /api/v1/reservations?propertyId=xxx` — vérifier les réservations importées

## Anti-patterns

- Ne PAS créer un wizard complexe avec 10 steps — 3 steps max
- Ne PAS bloquer sur le chargement iCal — optimistic UI, le sync se fait en background
