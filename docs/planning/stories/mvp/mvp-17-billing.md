# mvp-17 — Billing & Subscription

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-02 (App Shell)

## Objectif

Page billing : voir le plan actuel, les plans disponibles, upgrader via Polar checkout, annuler.

## Tâches

### 1. Page `/billing`

- Section "Plan actuel" : nom du plan, prix, nombre de propriétés, date renouvellement
- Si Free : bannière "Passez à Starter pour ajouter plus de propriétés"
- Section "Plans disponibles" : cards pour chaque plan

### 2. Cards plans

Afficher les 5 plans avec comparaison :

- **Free** (0€, 1 propriété) — "Votre plan" si actif
- **Starter** (69€/mois, 2-7 propriétés) — "Recommandé" badge pour Sophie
- **Pro** (199€/mois, 8-15 propriétés)
- **Scale** (399€/mois, 16-25 propriétés)
- **Agency** (custom, 26+) — "Contactez-nous"

Chaque card : prix, limite propriétés, features incluses, CTA "Choisir ce plan"

`GET /api/v1/billing/plans` — plans avec pricing

### 3. Checkout Polar

- Clic sur "Choisir ce plan" → redirect vers Polar Checkout (sandbox en dev)
- Retour après paiement → webhook Polar met à jour la subscription
- Afficher un état "En cours de traitement" pendant que le webhook arrive
- Polling `GET /api/v1/billing` pour détecter le changement

### 4. Annulation

- Bouton "Annuler mon abonnement" dans la section plan actuel
- Re-auth nécessaire (Better Auth reauthMiddleware)
- Dialog confirmation avec message clair sur ce qui se passe
- `POST /api/v1/billing/cancel`
- Retour au plan Free à la fin de la période payée

### 5. Subscription guard UI

- Si l'utilisateur tente d'ajouter une propriété au-delà de sa limite → modal "Limite atteinte"
- CTA "Upgrade" dans la modal → redirige vers `/billing`

## Acceptance Criteria

- [ ] Plan actuel affiché correctement
- [ ] Plans disponibles avec pricing et CTA
- [ ] Checkout Polar fonctionne (sandbox)
- [ ] Après paiement, le plan est mis à jour
- [ ] Annulation fonctionne avec re-auth
- [ ] Subscription guard affiche la modal de limite
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/billing` — subscription courante
- `GET /api/v1/billing/plans` — plans disponibles
- `POST /api/v1/billing/cancel` — annuler (nécessite re-auth)

## Notes techniques

- Polar SDK côté frontend n'est pas nécessaire — le backend gère les webhooks
- Le checkout est un redirect vers une URL Polar (pas un iframe)
- En dev, utiliser le sandbox Polar (pas de vrai paiement)
