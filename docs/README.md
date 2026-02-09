# Hoxtup — Documentation

## Qu'est-ce que Hoxtup ?

Hoxtup est un **cockpit opérationnel SaaS B2B** pour la gestion des locations courte durée (Airbnb & assimilés). Il remplace Excel + WhatsApp + carnet + mémoire par un outil unique où rien n'est oublié et chaque propriété est sous contrôle.

**Chaîne de valeur :** Réservation (iCal) → Tâches auto-générées → Assignation équipe → Exécution terrain → Visibilité manager → Suivi des coûts.

**Dual-persona :** Le manager voit un tableau de bord stratégique. Le staff de terrain voit une liste de tâches ultra-simple. Même app, interface adaptée au rôle.

---

## Comment naviguer cette documentation

### Tu démarres sur le projet ?

1. [QUICKSTART.md](./QUICKSTART.md) — Lancer le projet en 5 minutes
2. [STATUS.md](./STATUS.md) — Ce qui est fait, ce qui reste, les blockers
3. [MVP-SCOPE.md](./MVP-SCOPE.md) — Le scope du MVP (première release shippable)

### Tu commences une session de dev ?

1. [STATUS.md](./STATUS.md) — Où on en est
2. [planning/stories/_index.md](./planning/stories/_index.md) — Prochaine story à implémenter
3. [API-MAP.md](./API-MAP.md) — Endpoints backend disponibles (pour le frontend)

### Tu as une question produit ?

→ [planning/prd.md](./planning/prd.md) — PRD simplifié (vision, personas, features, pricing)

### Tu as une question technique ?

→ [DECISIONS.md](./DECISIONS.md) — Toutes les décisions prises avec le pourquoi
→ [planning/architecture.md](./planning/architecture.md) — Stack, conventions, patterns

### Tu construis du frontend ?

→ [planning/frontend-guide.md](./planning/frontend-guide.md) — Design tokens, composants, patterns UX
→ [API-MAP.md](./API-MAP.md) — Tous les endpoints API avec leurs paramètres

### Tu veux voir la vision long terme ?

→ [V1-ROADMAP.md](./V1-ROADMAP.md) — Roadmap complète : MVP → V1 → V1.1+

---

## Structure du dossier docs/

```text
docs/
├── README.md              ← Tu es ici
├── QUICKSTART.md          ← Lancer le projet en 5 min
├── STATUS.md              ← État actuel du projet (à mettre à jour chaque session)
├── DECISIONS.md           ← Log de toutes les décisions techniques
├── MVP-SCOPE.md           ← Scope MVP (première release)
├── V1-ROADMAP.md          ← Roadmap complète MVP → V1 → V1.1+
├── API-MAP.md             ← Tous les endpoints API avec status
├── planning/
│   ├── prd.md             ← PRD simplifié (~200 lignes)
│   ├── architecture.md    ← Architecture & conventions techniques
│   ├── frontend-guide.md  ← Guide frontend : tokens, composants, patterns UX
│   ├── epics.md           ← Épiques et dependency graph
│   └── stories/
│       ├── _index.md      ← Index de toutes les stories avec status
│       ├── mvp/           ← Stories frontend MVP (Phase 1)
│       └── v1/            ← Stories frontend V1 (Phase 2 + 3)
└── archive/               ← Anciens documents (brainstorms, BMAD outputs, audit)
```

## Règles pour maintenir cette doc

1. **Un document = une source de vérité.** Jamais la même info à deux endroits.
2. **STATUS.md est mis à jour à chaque fin de session.** 5 lignes suffisent.
3. **DECISIONS.md reçoit chaque décision non triviale.** 2 minutes d'écriture = 2h de confusion évitée.
4. **Les stories terminées sont marquées `done` dans `_index.md`.** Pas de fichier supplémentaire.
5. **Pas de nouveau document sans raison.** Mettre à jour un existant plutôt que créer un nouveau.
