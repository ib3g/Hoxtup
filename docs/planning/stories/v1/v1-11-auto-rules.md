# v1-11 — Auto-Rules Management

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** MVP complet
**Phase :** V1 — Phase 2C (Vues avancées)

## Objectif

Interface pour configurer les règles d'auto-génération de tâches par propriété. Sophie peut activer/désactiver les tâches automatiques de ménage, check-in, inspection pour chaque propriété.

## Tâches

### 1. Section Auto-Rules dans le détail propriété

- Tab "Automatisations" dans la page propriété
- `GET /api/v1/properties/:propertyId/auto-rules` — liste des règles

### 2. Liste des règles

- Chaque règle : type (CLEANING, CHECKIN, CHECKOUT, INSPECTION), activé/désactivé (toggle switch), délai (ex: "1h avant check-in"), assignee par défaut (optionnel)
- Toggle : `PATCH /api/v1/properties/:propertyId/auto-rules/:ruleId` body: `{ enabled: true/false }`

### 3. Configuration avancée

- Pour chaque règle activée :
  - Délai : combien de temps avant/après l'événement déclencheur
  - Assignee par défaut : si défini, la tâche est directement assignée
  - Description template : texte par défaut pour la tâche générée

### 4. Preview

- Afficher un exemple : "Quand une réservation arrive → Tâche ménage créée 3h avant check-in, assignée à Fatima"

## Acceptance Criteria

- [ ] Liste des règles par propriété affichée
- [ ] Toggle on/off fonctionne
- [ ] Configuration délai et assignee par défaut
- [ ] Preview compréhensible
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/properties/:propertyId/auto-rules` — liste
- `PATCH /api/v1/properties/:propertyId/auto-rules/:ruleId` — modifier
