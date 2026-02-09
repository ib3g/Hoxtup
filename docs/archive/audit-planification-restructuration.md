# Audit Strict & Restructuration de la Planification — Hoxtup

**Date:** 2026-02-09
**Périmètre analysé:** `_bmad-output/planning-artifacts/` + `docs/`
**Fichiers analysés:** 49 fichiers (détail en section 1)

---

## 0. Ce que j'ai compris de Hoxtup — L'essence du projet

### Le problème réel

Sophie gère 5 appartements Airbnb à Marrakech. Chaque matin, elle ouvre WhatsApp pour dire à Fatima quel appartement nettoyer. Elle vérifie son Excel pour voir les réservations. Elle griffonne sur un carnet les produits de ménage qui manquent. Elle oublie régulièrement de commander des draps. Un soir, un voyageur arrive et l'appartement n'est pas prêt — elle avait raté un message WhatsApp.

Karim, lui, gère 20 propriétés pour une agence à Casablanca. Il a 5 employés de terrain. Certains n'ont même pas de smartphone. Il passe 2 heures par jour à coordonner par téléphone ce que chacun doit faire, dans quel ordre, à quelle heure. Il ne sait jamais en temps réel si un ménage est fait ou non. Et quand un propriétaire client lui demande combien coûte la gestion de son appartement, il ne peut pas répondre.

**Le chaos opérationnel de la location courte durée, c'est ça.** Des outils fragmentés (Excel + WhatsApp + carnet + mémoire), aucune visibilité, des oublis, du stress, et une impossibilité de savoir ce que chaque propriété coûte réellement.

### Ce que Hoxtup est

Hoxtup est un **cockpit opérationnel** — un outil unique qui remplace Excel, WhatsApp, le carnet et la mémoire. Ce n'est pas un PMS (Property Management System) comme Lodgify ou Guesty qui parlent aux voyageurs. Hoxtup ne parle qu'aux **équipes internes** : le propriétaire, le manager, le personnel de terrain.

L'idée fondatrice est simple : **les réservations sont des événements déclencheurs d'opérations**. Une réservation Airbnb arrive via iCal → le système génère automatiquement les tâches (ménage, check-in, inspection) → les tâches sont assignées à l'équipe → l'équipe les exécute sur son téléphone → le manager voit tout en temps réel → les coûts sont suivis automatiquement.

C'est la chaîne complète : **réservation → tâche → exécution → visibilité**.

### Les deux mondes dans une seule app

Le génie du concept est le **dual-persona** :

- **Le monde du manager** (Sophie, Karim) : un tableau de bord, des KPIs, un calendrier global, des alertes, de la planification. Besoin : "Je vois tout, je contrôle tout, je suis serein."
- **Le monde du terrain** (Fatima) : une liste de tâches ultra-simple. Ma prochaine tâche, un gros bouton "Commencer", un gros bouton "Terminé", et un bouton "Signaler un problème" si quelque chose ne va pas. Besoin : "Je sais exactement quoi faire, pas de confusion."

Ces deux mondes cohabitent dans la même application responsive. Le manager et l'employée de ménage utilisent le même produit, mais l'interface s'adapte à leur rôle.

### Ce qui différencie Hoxtup

Trois éléments différenciateurs ressortent clairement :

1. **La gestion de stock intégrée** — Aucun concurrent (Properly, Turno, Breezeway) ne propose un suivi des consommables (produits de ménage, kits d'accueil) avec des alertes de seuil bas. C'est le "plus jamais en rupture de savon" qui crée le moment "aha" chez Sophie.

2. **Le Task Fusion Engine** — Quand un départ à 11h est suivi d'une arrivée à 14h sur le même appartement, le système propose automatiquement de fusionner les deux tâches en un seul "Turnover". C'est malin, ça fait gagner du temps, et aucun concurrent ne le fait.

3. **Le pricing agressif** — 50-78% moins cher que le marché (Properly facture ~45€/propriété, Hoxtup commence à ~10€/propriété en Starter). L'entrée par le marché marocain, où la compétition locale est quasi inexistante, est stratégiquement pertinente.

### Le sentiment visé

Les documents expriment un objectif émotionnel très clair, et c'est ce qui donne son âme au projet :

> *"Je me sens serein."*
> *"Je n'oublie rien."*
> *"Je vois tout."*
> *"Je contrôle mes coûts."*
> *"Ici, tout est sous contrôle."*

Hoxtup n'est pas un outil de productivité froid. C'est un **réducteur de stress**. Le design "calm by default" (palette teal/terra cotta, pas de rouge agressif, micro-animations subtiles, état "Zen" quand tout est fait) sert directement cet objectif. Le produit doit inspirer la confiance dès la première ouverture — et la maintenir dans la routine quotidienne.

### Le modèle économique

SaaS B2B en tiers par nombre de propriétés :
- **Free** (1 propriété) — porte d'entrée, pas de carte de crédit
- **Starter 69€/mois** (2-7 propriétés) — Sophie
- **Pro 199€/mois** (8-15 propriétés) — Karim
- **Scale 399€/mois** (16-25 propriétés) — agences moyennes
- **Agency custom** (26+)

Le Free-to-Starter est le levier de conversion principal. Sophie essaie gratuitement avec 1 propriété. En une semaine, elle comprend que ça marche. Elle ajoute ses 4 autres propriétés → paywall naturel.

### Mon résumé en une phrase

**Hoxtup, c'est l'anti-chaos pour les gestionnaires de locations courte durée : un outil calme, simple et complet qui transforme la coordination WhatsApp + Excel en un cockpit opérationnel où rien n'est oublié et chaque propriété est sous contrôle.**

---

## 1. Verdict Brut

**La planification est-elle bonne ? PARTIELLEMENT**

**Pourquoi :**

La planification est **théoriquement correcte mais impraticable à l'échelle**. Les documents contiennent individuellement de l'information de qualité — bonne vision produit, personas cohérentes, stack technique solide. Mais l'ensemble crée un système documentaire qui **noie le développeur sous 300+ pages de prose**, force des allers-retours constants entre 49 fichiers, et contient des contradictions internes non résolues qui obligent à prendre des décisions produit à la volée pendant le code.

**Le problème fondamental n'est pas le contenu — c'est l'architecture de l'information.**

Un développeur solo qui ouvre ce dossier pour la première fois ne sait pas par où commencer, quoi lire en priorité, et ce qui est encore valide vs ce qui a été supplanté par les décisions prises en cours de développement.

---

## 2. Inventaire Complet des Fichiers

### `_bmad-output/planning-artifacts/` (44 fichiers)

| Fichier | Rôle supposé | Taille | Problème identifié |
|:---|:---|:---|:---|
| `prd.md` | PRD formalisé (909 lignes) | 44 Ko | Contient un frontmatter BMAD workflow, des user journeys détaillées, des FRs/NFRs. Source de vérité produit. |
| `prd-validation-report.md` | Rapport de validation du PRD (601 lignes) | 26 Ko | **Artefact de processus, pas de produit.** Documente les problèmes trouvés puis corrigés. Inutile post-correction. |
| `architecture.md` | Document d'architecture (1057 lignes) | 50 Ko | Complet et bien structuré. Mais 1057 lignes = illisible pour référence rapide. Mélange décisions, patterns, et structure projet. |
| `epics.md` | Breakdown épiques + FRs (415 lignes) | 28 Ko | **Duplique 80% du PRD** en re-listant tous les FRs/NFRs. Les épiques elles-mêmes ne font que 150 lignes sur 415. |
| `ux-design-specification.md` | Spécification UX complète (1603 lignes) | 85 Ko | **Le plus gros fichier du projet.** 85 Ko de spec UX pour un MVP. Contient des décisions excellentes noyées dans une prose excessive. |
| `ux-design-directions.html` | Mockups HTML interactifs | 65 Ko | Artefact de décision visuelle. Utile une fois, puis archivable. |
| `logo-brief.md` | Brief logo | 3.8 Ko | OK, concis, finalisé. |
| `epics/epic-*.md` (8 fichiers) | Fiches épiques individuelles | ~1 Ko chacun | **Doublons purs** de `epics.md`. Même contenu copié-collé dans des fichiers séparés. |
| `stories/story-*.md` (35 fichiers) | User stories | ~2-3 Ko chacun | Format cohérent (AC + Technical Notes). Qualité variable — certaines sont actionnables, d'autres trop vagues. |

### `docs/` (13 fichiers)

| Fichier | Rôle supposé | Problème identifié |
|:---|:---|:---|
| `docs/brainstorm/PRD_MVP.md` | Brainstorm initial PRD MVP (FR) | **Input document — supplanté par `prd.md`**. Conservé comme source historique. |
| `docs/brainstorm/PRD_complet_Design_Pricing.md` | Brainstorm PRD + Design + Pricing (FR) | **Input document — supplanté**. Quasi-identique à PRD_MVP avec ajouts. |
| `docs/brainstorm/Design_Produit_Vision_UI_UX.md` | Vision design/UX initiale (FR) | **Input document — supplanté par UX spec**. |
| `docs/brainstorm/Hoxtup_Kit.md` | Mini kit branding | Utile comme référence branding. Court et actionnable. |
| `docs/brainstorm/Landing_page_marketing_conversion.md` | Structure landing page | **Hors scope MVP dev.** Pas de valeur pour le développement actuel. |
| `docs/brainstorm/Propositoino de logo/` (7 fichiers) | Propositions logo (HTML + PNG) | Artefacts visuels. Le choix est fait dans `logo-brief.md`. Archivable. |
| `docs/prd.md` | PRD original pré-BMAD | **Doublon/ancêtre** du PRD dans planning-artifacts. |

### Bilan quantitatif

| Métrique | Valeur |
|:---|:---|
| **Fichiers totaux** | 49 |
| **Volume texte total** | ~300+ Ko (~4000+ lignes de prose) |
| **Doublons identifiés** | 12 fichiers (8 epics individuels + 3 brainstorms supplanté + 1 ancien PRD) |
| **Fichiers artefacts de processus** | 3 (validation report, UX directions HTML, logo proposals) |
| **Fichiers actionnables pour un dev** | ~38 stories + architecture + PRD = ~40 |
| **Ratio signal/bruit** | ~60% — 40% du volume ne sert plus |

---

## 3. Analyse Structurelle

### Hiérarchie de l'information

La hiérarchie actuelle est :

```
docs/brainstorm/       ← Inputs bruts (FR, non formalisés)
docs/prd.md            ← Ancien PRD (supplanté)
planning-artifacts/
  prd.md               ← PRD formalisé (source de vérité produit)
  prd-validation-report.md ← Rapport de validation (artefact processus)
  architecture.md      ← Architecture (source de vérité technique)
  ux-design-specification.md ← UX (source de vérité design)
  epics.md             ← Découpage épiques + FRs (redondant avec PRD)
  epics/               ← 8 fiches épiques (redondant avec epics.md)
  stories/             ← 35 user stories (actionnables)
```

**Problème central : il n'y a pas de document d'entrée unique.**

Un développeur doit deviner :
1. Quel PRD lire ? (`docs/prd.md` ou `planning-artifacts/prd.md` ?)
2. Les brainstorms sont-ils encore valides ?
3. `epics.md` ou les fichiers `epics/*.md` ?
4. Comment les 1603 lignes de UX spec se traduisent en actions de dev ?

### Continuité entre documents

| Transition | État |
|:---|:---|
| Brainstorms → PRD | ✅ Correcte (PRD synthétise les inputs) |
| PRD → Architecture | ⚠️ **Contradictions** (PRD dit JWT/Stripe, Architecture dit Better Auth/Polar) |
| PRD → Epics | ⚠️ **Redondance** (epics.md re-copie 57 FRs + 20 NFRs du PRD) |
| Architecture → Stories | ⚠️ **Décalage** (stories réfèrent "JWT auth" alors que l'archi dit Better Auth) |
| UX Spec → Stories | ⚠️ **Faible** (stories ne réfèrent presque jamais la UX spec directement) |
| Epics → Stories | ✅ Correcte (chaque story réfère son epic et ses FRs) |

### Réponse explicite : Un dev peut-il savoir quoi faire, dans quel ordre, et pourquoi ?

**QUOI FAIRE :** Partiellement. Les stories sont structurées avec des Acceptance Criteria. Mais certaines mélangent backend + frontend + UX en une seule story, rendant le scope flou.

**DANS QUEL ORDRE :** Non clairement. L'ordre des épiques est implicite via le dependency graph dans `epics.md`, mais il n'y a pas de roadmap visuelle simple. Les 42 stories ne sont pas priorisées au-delà de l'ordre numérique.

**POURQUOI :** Partiellement. Les FRs sont tracés, mais le "pourquoi business" (quelle valeur utilisateur cette story délivre en premier) est noyé dans la prose du PRD.

### Où la chaîne de décision se casse

1. **PRD → Architecture :** Le PRD mentionne JWT/Stripe. L'architecture a basculé sur Better Auth/Polar. Le PRD n'a jamais été mis à jour. Résultat : le dev qui lit le PRD prend des décisions basées sur des infos obsolètes.

2. **Architecture → Implémentation :** L'architecture dit `express-openapi-validator` pour la validation runtime. En pratique (d'après les memories), ce n'est pas utilisé — les routes sont validées par Zod manuellement. L'architecture n'a pas été mise à jour.

3. **UX Spec → Stories :** La UX spec définit 14 composants custom avec des specs détaillées (TaskCard 5 états, BottomNavBar, etc.). Les stories ne réfèrent pas ces specs. Un dev frontend ne sait pas quel composant construire à quel moment.

4. **Stories → Réalité du code :** Les stories planning (dans `planning-artifacts/stories/`) et les stories d'implémentation (dans `_bmad-output/implementation-artifacts/`) sont deux jeux différents. Lequel fait autorité ?

---

## 4. Analyse Opérationnelle (Point de vue Dev Senior)

### Ce qui crée de la friction

**F1 — Volume documentaire disproportionné pour un solo dev**
- 4000+ lignes de prose pour un MVP de 3 mois
- Un développeur solo ne peut pas maintenir 49 fichiers de planification et coder en même temps
- Le temps passé à naviguer la documentation est du temps volé au code

**F2 — Contradictions non résolues entre documents**
- PRD dit "JWT + Stripe". Architecture dit "Better Auth + Polar". Implémentation utilise Better Auth + Polar
- PRD NFR dit "WCAG Level A". UX Spec dit "WCAG Level AA". Architecture dit "supports both"
- PRD dit "Task lifecycle: 6 states" avec `Fusion Suggested`. Les stories implémentent 5 états (Pending, Todo, InProgress, Completed, Incident)
- Story 8.1 s'appelle "Stripe Integration" mais l'implémentation utilise Polar

**F3 — Stories trop grosses et mal découpées**
- Story 1.8 "App Shell, Design System & Responsive Layout" = scaffolding complet du frontend (design tokens, fonts, layout, nav, responsive, 14+ composants). C'est 2-3 sprints de travail dans une seule story
- Story 3.4 "Task Fusion Engine" = détection SQL + state machine + composant frontend + rejection tracking. Au moins 3 stories distinctes
- Les stories mélangent systématiquement backend API + frontend UI + UX polish. Pour un solo dev itératif, c'est impraticable

**F4 — Absence de définition claire du "done" par couche**
- Aucune story ne dit explicitement "cette story est backend-only" ou "frontend-only"
- Résultat : le dev doit décider seul s'il implémente le backend d'abord, le frontend d'abord, ou les deux ensemble
- D'après les memories, le backend a été fait en entier (191 tests, 8 épiques), puis le frontend commencera. Les stories ne reflètent pas cette réalité

**F5 — Technical Notes insuffisantes dans les stories**
- Certaines stories ont des notes techniques utiles (endpoints API, modèles Prisma)
- D'autres n'ont que du copier-coller de l'architecture sans valeur ajoutée
- Aucune story ne mentionne les patterns de test attendus, les edge cases critiques, ou les dépendances de migration

**F6 — Pas de convention claire pour les décisions prises en cours de route**
- Beaucoup de décisions techniques ont été prises pendant le développement (Better Auth au lieu de jose/argon2, Prisma interactive transactions, Express 5 catch-all syntax)
- Ces décisions vivent dans les "memories" du système mais ne sont documentées nulle part dans les fichiers de planification
- Un nouveau développeur (ou le même dev après 3 semaines de pause) n'a aucune trace écrite

### Ce qui manque pour implémenter sans improviser

1. **Un fichier de décisions techniques (ADR - Architecture Decision Records)** — chaque décision prise en cours de dev avec le pourquoi
2. **Un mapping story → endpoints API** — quel endpoint existe, quel endpoint reste à faire
3. **Un état des lieux "ce qui est fait vs ce qui reste"** — actuellement seul le `sprint-status.yaml` existe, mais il ne dit pas quoi dans chaque story est fait
4. **Des stories frontend-only** — le backend est fait, les stories actuelles mélangent les deux couches
5. **Un guide de démarrage rapide** — "voici comment lancer le projet, voici l'état actuel, voici les 5 prochaines choses à faire"

### Ce qui force à prendre des décisions produit non documentées

1. **Pricing tiers :** Le PRD dit "Starter 69€, 2-7 properties". Les stories disent "Starter up to 5". Les plans config dans le code disent autre chose. Le dev doit trancher.
2. **Task states :** Le PRD définit 6 états. L'implémentation en a 5. Où est documenté le choix de retirer "Fusion Suggested" comme état ?
3. **Calendar library :** L'UX spec hésite entre "Custom build on date-fns + CSS Grid" et "FullCalendar with heavy Tailwind theming". Aucune décision prise.
4. **Charts library :** La UX spec mentionne Recharts. Aucune story ne couvre le choix et la mise en place.
5. **Offline queue :** Mentionné dans la UX spec et l'architecture. Aucune story ne le couvre. Le dev doit décider si c'est MVP ou post-MVP.

---

## 5. Analyse Produit (Point de vue PO/PM)

### Vision : claire ou non ?

**Claire au niveau macro, floue au niveau micro.**

La vision "cockpit opérationnel pour locations courte durée" est limpide. Les personas (Sophie, Karim, Fatima) sont excellentes — c'est le point fort de cette planification. Le positionnement marché (50% moins cher, Maroc en premier) est clair.

Mais la vision ne se traduit pas en **priorités exécutables**. Tout est "MVP" — 13 modules, 57 FRs, 42 stories. C'est un MVP de 3 mois qui contient :
- Task Fusion Engine (feature différenciante complexe)
- Stock management avec asset tracking
- 4 vues calendrier
- Financial reporting avec charts
- Billing avec Stripe/Polar integration
- Notifications email + in-app
- i18n infrastructure
- Multi-currency
- Design system complet avec 14 composants custom

**C'est au minimum 6-9 mois de travail pour un développeur solo, pas 3.**

### Priorisation : explicite ou floue ?

**Floue.** Il n'y a aucun document qui dit :
- "Voici les 5 features à livrer en premier pour avoir des utilisateurs qui paient"
- "Voici ce qu'on peut couper si on manque de temps"
- "Voici le vrai MVP vs le MVP idéal"

Les épiques sont ordonnées par dépendance technique (Foundation → Properties → Tasks → ...), pas par valeur business. C'est logique pour le code, mais ça ne dit pas quand le produit est **utilisable et vendable**.

### Dépendances : bien gérées ou implicites ?

**Le dependency graph dans `epics.md` est correct mais incomplet.** Il montre les dépendances entre épiques, mais pas :
- Les dépendances intra-stories (quelle story dans Epic 3 dépend de quelle story dans Epic 2)
- Les dépendances frontend ↔ backend (le frontend Epic 5 Calendar dépend des API Epic 2 + Epic 3)
- Les dépendances avec des services externes (Polar account setup, Brevo SMTP config)

### Backlog : exploitable ou théorique ?

**Théorique.** Les 42 stories sont un catalogue de features, pas un backlog priorisé. Il n'y a pas de :
- Story points ou estimation d'effort
- Priorité (must-have / should-have / nice-to-have)
- Critère de "shippable increment" — à quel point le produit est-il utilisable ?

---

## 6. Analyse Business / SaaS

### Alignement valeur ↔ effort

| Feature | Valeur business | Effort dev | Verdict |
|:---|:---|:---|:---|
| Properties + Reservations + iCal | **Critique** (sans ça, pas de produit) | Moyen | ✅ Garder en priorité absolue |
| Tasks + Assignment | **Haute** (coordination équipe = pain #1) | Moyen | ✅ Garder en priorité haute |
| Stock Management | **Haute** (différenciateur clé) | Moyen | ✅ Garder mais simplifier |
| Task Fusion Engine | Moyenne (différenciateur UX) | **Élevé** | ⚠️ Repousser post-launch |
| 4 Calendar Views | Moyenne | Élevé | ⚠️ Commencer avec 1 vue, itérer |
| Financial Reporting + Charts | Moyenne | Élevé | ⚠️ Version ultra-light d'abord |
| Asset Tracking | Faible pour early users | Moyen | ⚠️ Post-launch |
| Notifications Email | Haute | Faible | ✅ Garder |
| Notifications In-App | Moyenne | Moyen | ✅ Garder version simple |
| i18n Infrastructure | Nécessaire (FR only) | Faible | ✅ Garder |
| Multi-Currency | Faible (EUR + MAD = 2 devises fixes) | Faible | ✅ Garder mais simplifier |
| Billing/Subscription | Critique à terme | Élevé | ⚠️ Stripe Checkout simple, pas d'usine |
| Design System 14 composants custom | Faible pour early MVP | **Très élevé** | ❌ Utiliser shadcn/ui par défaut |
| Temporal Dashboard Adaptation | Faible | Moyen | ❌ Post-launch |
| Proxy Task Management | Moyenne | Élevé | ⚠️ Simplifier drastiquement |
| Zen State / Micro-animations | Faible | Moyen | ❌ Post-launch |
| Offline Queue | Faible pour MVP web | Élevé | ❌ Post-launch |

### Clarté du MVP

**Le MVP n'est pas un MVP — c'est un V1 complète.**

Un vrai MVP pour un SaaS de gestion locative serait :
1. Créer un compte + une org
2. Ajouter des propriétés
3. Connecter iCal → voir les réservations
4. Créer/assigner/compléter des tâches
5. Voir un calendrier simple
6. Recevoir des notifications basiques
7. Billing simple (Stripe Checkout, pas de subscription management complex)

Tout le reste (stock management, asset tracking, 4 vues calendrier, financial reporting, task fusion, proxy management, temporal dashboard, 14 composants custom, multi-currency formatting, offline queue) est du **nice-to-have pour un lancement initial**.

### Sur-ingénierie vs sous-spécification

**Sur-ingénierie massive côté planning et UX. Sous-spécification côté exécution.**

- La UX spec fait 85 Ko (1603 lignes). C'est plus long que beaucoup de codebases MVP entières. Elle définit des micro-animations, des palettes de 8 couleurs pour les propriétés, des adaptations temporelles par heure du jour. Pour un early SaaS avec 0 utilisateurs.
- En contraste, les stories manquent de détails exécutables : pas de wireframes simples, pas de schéma de BDD par story, pas d'API contract par endpoint.

### Éléments inutiles pour un early SaaS

1. **`prd-validation-report.md`** — Artefact de processus. Les corrections ont été appliquées au PRD. Ce fichier ne sert plus.
2. **`ux-design-directions.html`** — La direction est choisie. Archivable.
3. **Les 8 fichiers `epics/*.md`** — Doublons purs de `epics.md`.
4. **Les 5 brainstorm files** — Supplanté par le PRD formalisé.
5. **`docs/prd.md`** — Ancien PRD supplanté.
6. **Temporal Dashboard Adaptation** (morning/midday/evening content) — Over-engineering pour 0 users.
7. **Offline Queue** — Le produit est un web app responsive, pas un PWA. Graceful degradation suffit.
8. **Voice-to-text for incidents** — Mentionné comme "v1.1" mais pollue la spec UX actuelle.
9. **Property Owner Client role** — Marqué "Post-MVP" mais prend de la place dans chaque document.

---

## 7. Benchmark — Best Practices SaaS Performants

### Comparaison avec les standards

| Critère | Best Practice SaaS | État Hoxtup | Écart |
|:---|:---|:---|:---|
| **Docs de planification** | 1 PRD (<5 pages) + 1 tech spec (<10 pages) + stories | 1 PRD (909 lignes) + 1 archi (1057 lignes) + 1 UX (1603 lignes) + 42 stories + epics + validation report | **3-5x trop de documentation** |
| **MVP scope** | 3-5 features core, ship in 4-8 weeks | 13 modules, 57 FRs, 42 stories | **3-4x trop large** |
| **Story granularity** | 1-3 jours de travail par story | Certaines stories = 1-3 semaines | **Stories trop grosses** |
| **Decision tracking** | ADRs (1 page par décision) | Néant (décisions dans les memories AI) | **Aucun tracking formel** |
| **Feedback loop** | Ship → Measure → Iterate toutes les 2 semaines | Plan complet avant de tester avec des users | **Pas de loop feedback** |
| **Living docs** | Docs mises à jour quand le code change | Docs figées à la création | **Docs déjà obsolètes** |

### Ce que font les SaaS qui réussissent

1. **Linear** — A lancé avec un kanban simple. Task fusion = ajouté 2 ans après.
2. **Notion** — A lancé avec notes + pages. Base de données = ajouté après validation du product-market fit.
3. **Properly** (concurrent direct Hoxtup) — A lancé avec scheduling + checklists. Stock management = ajouté après 1000+ clients.

**Leçon :** Ship le core, mesure l'adoption, ajoute les features différenciantes quand tu as des utilisateurs qui les demandent.

---

## 8. Problèmes Critiques

### P1 — Documentation obsolète et contradictoire (CRITIQUE)

- **Description :** Le PRD, l'architecture, les epics et les stories contiennent des informations contradictoires sur des choix fondamentaux (auth, billing, task states, pricing tiers, WCAG level).
- **Origine :** Structure — les documents ont été créés séquentiellement mais jamais synchronisés après les décisions d'implémentation.
- **Impact :** Un dev qui lit le PRD prend des décisions basées sur des infos fausses. Les revues de code référencent des specs obsolètes.

### P2 — Pas de source de vérité unique (CRITIQUE)

- **Description :** La même information existe dans 3-5 endroits différents (FRs dans PRD + epics.md + epic files + stories). Quand une info change, les copies ne sont pas mises à jour.
- **Origine :** Séquence — le processus BMAD génère des artefacts redondants par design.
- **Impact :** Le dev perd confiance dans la documentation et finit par ignorer les specs, improvisant les décisions.

### P3 — MVP scope irréaliste pour un solo dev (CRITIQUE)

- **Description :** 42 stories, 13 modules, 57 FRs pour un MVP de 3 mois par un développeur solo.
- **Origine :** Vision — l'ambition produit n'a pas été contrainte par la capacité d'exécution.
- **Impact :** Le projet ne sera jamais "fini". Le dev court après un scope qui recule. Pas de feedback utilisateur car rien n'est shippable.

### P4 — Stories non découpées par couche (MAJEUR)

- **Description :** Chaque story mélange backend API + frontend UI + UX polish. Le dev a fait tout le backend d'abord (191 tests), mais les stories ne reflètent pas cette approche.
- **Origine :** Contenu — les stories sont écrites du point de vue utilisateur, pas du point de vue exécution technique.
- **Impact :** Le dev doit mentalement décomposer chaque story en "ce que je fais maintenant" vs "ce que je ferai plus tard". Pas de tracking granulaire possible.

### P5 — UX Spec disproportionnée et non connectée à l'exécution (MAJEUR)

- **Description :** 1603 lignes de spec UX, mais les stories frontend ne réfèrent pas les sections pertinentes. Les composants custom sont définis en détail mais aucune story ne dit "implémente TaskCard selon la spec UX section X".
- **Origine :** Structure — la UX spec est un document standalone, pas un document de référence intégré au workflow de dev.
- **Impact :** Le dev ignore la UX spec et improvise le frontend, ou passe des heures à chercher la spec pertinente.

### P6 — Décisions d'implémentation non documentées (MAJEUR)

- **Description :** Des dizaines de décisions critiques (Better Auth vs jose, Prisma interactive transactions, Express 5 syntax, Zod v4 API changes) vivent uniquement dans les memories du système AI, pas dans des fichiers du projet.
- **Origine :** Processus — pas de convention pour documenter les décisions en cours de route.
- **Impact :** Continuité perdue entre sessions. Un autre dev (ou le même dev dans 3 semaines) n'a aucune trace.

---

## 9. Actions Recommandées

### À SUPPRIMER

| Fichier/Élément | Justification |
|:---|:---|
| `prd-validation-report.md` | Artefact de processus. Corrections appliquées. Zéro valeur résiduelle. |
| `epics/epic-*.md` (8 fichiers) | Doublons purs de `epics.md`. |
| `ux-design-directions.html` | Direction choisie. Archiver dans `docs/archive/`. |
| `docs/prd.md` | Supplanté par `planning-artifacts/prd.md`. |
| Les sections "Post-MVP" dans chaque document | Polluent la lecture. Mettre dans un seul fichier `roadmap-post-mvp.md`. |

### À SIMPLIFIER

| Élément | Action concrète |
|:---|:---|
| **PRD (909 lignes)** | Réduire à ~200 lignes : Executive Summary, MVP Scope (features list), Personas (tableau), Pricing (tableau), Success Metrics (tableau). Retirer les user journeys détaillées (les mettre dans un fichier séparé si besoin). |
| **Architecture (1057 lignes)** | Extraire en 3 docs : (1) `tech-stack.md` (~50 lignes : stack + versions + pourquoi), (2) `api-conventions.md` (~100 lignes : naming, error format, patterns), (3) `project-structure.md` (~50 lignes : arbre de fichiers). |
| **UX Spec (1603 lignes)** | Extraire un `frontend-guide.md` (~150 lignes) : design tokens, composant library, patterns obligatoires (button hierarchy, skeleton loading, toast feedback). Le reste = archive de référence. |
| **Epics (415 lignes)** | Réduire au strict nécessaire : liste des épiques + dependency graph + lien vers stories. Supprimer la re-copie des 57 FRs/20 NFRs. |
| **42 stories** | Découper en stories backend-only et stories frontend-only. Objectif : chaque story = 1-3 jours max. |

### À RESTRUCTURER

| Élément | Nouvelle structure |
|:---|:---|
| **Dossier `docs/brainstorm/`** | Déplacer vers `docs/archive/brainstorm/`. Ce sont des inputs historiques, pas des docs de travail. |
| **`_bmad-output/planning-artifacts/`** | Renommer en `docs/planning/`. Le path `_bmad-output` est un artefact du framework BMAD, pas un path logique pour un projet. |
| **Stories** | Séparer en `stories/backend/` et `stories/frontend/` (ou tagguer clairement dans chaque story). |
| **Arborescence docs** | Voir section "Plan de Réorganisation" ci-dessous. |

### À AJOUTER

| Document manquant | Contenu |
|:---|:---|
| **`docs/DECISIONS.md`** | Log des décisions prises en cours de dev. Format : date + décision + contexte + alternatives rejetées. Reprendre toutes les décisions des memories AI. |
| **`docs/STATUS.md`** | État des lieux : ce qui est fait (backend 191 tests), ce qui reste (tout le frontend), les blockers actuels. Mis à jour régulièrement. |
| **`docs/QUICKSTART.md`** | Comment lancer le projet en 5 minutes. Docker compose, env vars, migrations, seed, dev servers. |
| **`docs/MVP-SCOPE.md`** | Le VRAI MVP réduit : les 7-10 features absolument nécessaires pour un premier utilisateur payant. Avec une colonne "cut if needed". |
| **`docs/API-MAP.md`** | Liste de tous les endpoints API existants avec leur status (fait / testé / manquant). Générable depuis les routes. |

### À DÉPLACER

| Élément | De → Vers |
|:---|:---|
| User Journeys détaillées | PRD → `docs/archive/user-journeys.md` |
| UX Spec sections 9-14 (mockups, flows, components) | UX Spec → `docs/archive/ux-design-detail.md` |
| Brainstorm files | `docs/brainstorm/` → `docs/archive/brainstorm/` |
| Logo proposals | `docs/brainstorm/Propositoino de logo/` → `docs/archive/logo-proposals/` |
| Post-MVP features de tous les docs | Partout → `docs/roadmap-post-mvp.md` |

---

## 10. Plan de Réorganisation Proposé

### Structure cible

```
docs/
├── MVP-SCOPE.md          ← Le VRAI MVP. 1-2 pages. Features priorisées. (NOUVEAU)
├── QUICKSTART.md          ← Lancer le projet en 5 min. (NOUVEAU)
├── STATUS.md              ← Ce qui est fait / ce qui reste. (NOUVEAU)
├── DECISIONS.md           ← Log des décisions techniques. (NOUVEAU)
├── API-MAP.md             ← Endpoints existants + status. (NOUVEAU)
├── planning/
│   ├── prd.md             ← PRD simplifié (~200 lignes)
│   ├── architecture.md    ← Tech stack + conventions + structure (simplifié)
│   ├── frontend-guide.md  ← Design tokens, composants, patterns UX (extrait de UX spec)
│   ├── epics.md           ← Liste épiques + dependency graph (simplifié)
│   └── stories/
│       ├── backend/       ← Stories backend-only (fait)
│       └── frontend/      ← Stories frontend-only (à faire)
├── reference/
│   ├── prd-full.md        ← PRD complet original (référence, pas lecture courante)
│   ├── architecture-full.md ← Architecture complète originale
│   ├── ux-design-spec.md  ← UX spec complète originale
│   └── logo-brief.md
└── archive/
    ├── brainstorm/        ← Inputs initiaux
    ├── prd-validation-report.md
    ├── ux-design-directions.html
    └── logo-proposals/
```

### Rôle de chaque artefact

| Fichier | Audience | Quand le lire | Fréquence de mise à jour |
|:---|:---|:---|:---|
| `MVP-SCOPE.md` | Dev (toi) | Chaque début de sprint | Quand le scope change |
| `QUICKSTART.md` | Dev, contributeurs | Premier lancement | Quand l'infra change |
| `STATUS.md` | Dev (toi) | Chaque session de travail | Chaque session |
| `DECISIONS.md` | Dev (toi), futur dev | Quand une question "pourquoi X ?" se pose | Quand une décision est prise |
| `API-MAP.md` | Dev frontend | Avant chaque feature frontend | Quand un endpoint est ajouté |
| `planning/prd.md` | Référence produit | Quand on remet en question une feature | Rarement |
| `planning/architecture.md` | Référence technique | Quand on crée un nouveau module | Rarement |
| `planning/frontend-guide.md` | Dev frontend | Avant chaque composant | Quand un pattern change |
| `reference/*` | Archive | Quand on a besoin du contexte complet | Jamais |
| `archive/*` | Historique | Jamais en pratique | Jamais |

### Ordre logique d'utilisation

1. **Nouveau sur le projet ?** → `QUICKSTART.md` → `STATUS.md` → `MVP-SCOPE.md`
2. **Début d'une session de dev ?** → `STATUS.md` → prochaine story dans `stories/`
3. **Question produit ?** → `planning/prd.md` → si pas assez → `reference/prd-full.md`
4. **Question technique ?** → `DECISIONS.md` → `planning/architecture.md`
5. **Frontend à construire ?** → `planning/frontend-guide.md` → `API-MAP.md`

---

## 11. Règles Simples pour la Suite

### Principes

1. **Un document, une source de vérité.** Si une information existe à deux endroits, un des deux est faux. Choisir un seul endroit et linker depuis les autres.

2. **Si tu ne lis pas un document avant de coder, supprime-le.** Un document non lu est un document menteur — il donne l'illusion de contrôle sans fournir de valeur.

3. **Documente les décisions, pas les intentions.** "On utilise Better Auth parce que..." > "On pourrait utiliser jose ou Better Auth..."

4. **Une story = 1-3 jours max.** Si tu ne peux pas finir une story en 3 jours, elle est trop grosse. Découpe.

5. **Ship before perfect.** Le Task Fusion Engine n'a aucune valeur si personne n'utilise le produit. Ship les propriétés + réservations + tâches + calendrier simple. Le reste viendra.

6. **Met à jour STATUS.md à chaque fin de session.** 5 lignes suffisent. "Fait aujourd'hui : X. Prochain : Y. Bloqué sur : Z."

### Erreurs à ne plus reproduire

1. **Ne plus générer de documents redondants.** Pas de fichiers `epics/*.md` quand `epics.md` existe. Pas de PRD dans deux dossiers.

2. **Ne plus planifier le frontend et le backend dans la même story.** Deux couches = deux stories. Le backend est testable indépendamment. Le frontend est testable indépendamment.

3. **Ne plus écrire de UX spec de 1600 lignes avant d'avoir un seul utilisateur.** La UX se découvre avec les users, pas dans un document. Définir les tokens, les patterns clés, et itérer.

4. **Ne plus laisser les décisions d'implémentation dans les memories AI uniquement.** Chaque décision non triviale va dans `DECISIONS.md`. C'est 2 minutes d'écriture qui économisent 2 heures de confusion future.

5. **Ne plus définir un "MVP" avec 42 stories et 13 modules.** Un MVP = la plus petite chose qui résout le problème #1 de Sophie (réservations + tâches + calendrier). Tout le reste est V1.1+.

### Garde-fous

- **Avant d'ajouter une feature au scope :** Est-ce que Sophie en a besoin pour payer 69€/mois ? Si non, c'est post-launch.
- **Avant de créer un nouveau document :** Est-ce qu'un document existant peut être mis à jour à la place ? Si oui, mets à jour.
- **Avant de commencer une story :** Est-ce que je sais exactement ce que "done" signifie ? Si je ne peux pas l'expliquer en 2 phrases, la story est trop vague.
- **Toutes les 2 semaines :** Relis `STATUS.md` et `MVP-SCOPE.md`. Est-ce qu'on est plus proche de shippable ? Si non, quelque chose ne va pas.

---

## 12. Point bloquant identifié

**Aucun point bloquant formel** — toute l'information nécessaire pour l'analyse était disponible dans les fichiers.

Cependant, une **décision produit est requise avant de continuer** :

> **Quel est le vrai MVP minimal ?** Les documents actuels définissent un scope V1 complet (13 modules, 42 stories). Pour restructurer efficacement les stories et la planification, il faut d'abord décider quelles features sont **launch-blocking** vs **post-launch**. Sans cette décision, toute restructuration ne fera que réorganiser le même scope irréaliste.

**Recommandation :** Définir un scope "Launch V0" de 15-20 stories max couvrant le chemin critique : Registration → Properties → iCal → Reservations → Tasks (basic) → Calendar (1 view) → Notifications (basic) → Billing (simple checkout). Tout le reste devient "V1.1".

---

*Fin de l'audit.*
