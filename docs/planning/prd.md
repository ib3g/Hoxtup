# PRD — Hoxtup

## Vision

Hoxtup est un **cockpit opérationnel SaaS B2B** pour la gestion des locations courte durée. Il remplace la coordination fragmentée (WhatsApp + Excel + carnet + mémoire) par un outil unique, calme et complet.

**Tagline :** *Run operations effortlessly.*

**Ce que Hoxtup n'est PAS :** un PMS (Property Management System), un channel manager, un outil de pricing dynamique, ou un CRM voyageurs. Hoxtup parle aux **équipes internes**, pas aux voyageurs.

## Personas

| Persona | Rôle | Contexte | Besoin principal | Device |
|:---|:---|:---|:---|:---|
| **Sophie** | Owner | 5 appartements, Marrakech, gère seule | "Je vois tout, je contrôle tout, je suis sereine" | Mobile + Desktop |
| **Karim** | Admin/Manager | 20 propriétés, agence, 5 employés | "Qui fait quoi aujourd'hui ? Combien ça coûte ?" | Desktop + Tablet |
| **Fatima** | Staff Terrain | Ménage, pas toujours tech-savvy | "Quelle est ma prochaine tâche ? C'est tout." | Mobile uniquement |
| **Ahmed** | Client (post-MVP) | Propriétaire qui délègue à Karim | "Comment va mon appartement ?" | Mobile (lecture seule) |
| **Barry** | Super-Admin | Développeur, admin technique | Monitoring, support, debug | Desktop |

## Chaîne de valeur

```text
Réservation (iCal/manuel)
  → Tâches auto-générées (ménage, check-in, inspection)
    → Assignation équipe
      → Exécution terrain (mobile)
        → Visibilité manager (dashboard)
          → Suivi des coûts (stock, assets, revenus)
```

## RBAC — 5 rôles

| Rôle | Peut voir | Peut agir | Scope |
|:---|:---|:---|:---|
| **Owner** | Tout | Tout (billing, archive, RBAC) | Toute l'organisation |
| **Admin** | Tout | Gestion tâches, équipe, propriétés | Toute l'organisation |
| **Manager** | Propriétés assignées | Assigner, proxy, incidents | Propriétés scopées |
| **Staff Autonomous** | Ses tâches + création | Créer, compléter, incidents | Ses assignations |
| **Staff Managed** | Ses tâches uniquement | Compléter, incidents | Ses assignations (pas de compte propre, géré en proxy) |

## Modules fonctionnels

| # | Module | MVP | V1 | Description |
|:---|:---|:---|:---|:---|
| 1 | Auth & IAM | ✅ | ✅ | Inscription, login, sessions, organisation, invitations |
| 2 | Properties | ✅ | ✅ | CRUD propriétés, archivage, couleur par propriété |
| 3 | Reservations | ✅ | ✅ | Manuelles + iCal sync, source tracking |
| 4 | Tasks | ✅ | ✅ | Lifecycle (6 états), auto-generation, assignment, completion |
| 5 | Task Fusion | ❌ | ✅ | Détection overlap, suggestion fusion Turnover, accept/reject |
| 6 | Calendar | ✅ (1 vue) | ✅ (4 vues) | Unified view (tâches + réservations + incidents) |
| 7 | Notifications | ✅ | ✅ | In-app + email, préférences, badges |
| 8 | Team | ✅ | ✅ | Invitations, rôles, staff managed, scope par propriété |
| 9 | Dashboard | ✅ (basic) | ✅ (avancé) | KPIs, tâches du jour, vue terrain, activité |
| 10 | Inventory | ❌ | ✅ | Consommables, mouvements, seuils, alertes |
| 11 | Assets | ❌ | ✅ | Équipements, coût d'achat, catégories |
| 12 | Financials | ❌ | ✅ | Revenus, coûts par propriété, P&L simple |
| 13 | Billing | ✅ | ✅ | Plans (Polar), checkout, subscription, webhooks |
| 14 | i18n | ✅ (FR) | ✅ (FR+EN) | Internationalisation, multi-currency (EUR+MAD) |
| 15 | Settings | ✅ | ✅ | Profil, org settings, préférences |

## Pricing

| Plan | Prix/mois | Propriétés | Cible |
|:---|:---|:---|:---|
| **Free** | 0€ | 1 | Essai, onboarding |
| **Starter** | 69€ | 2-7 | Sophie (petits propriétaires) |
| **Pro** | 199€ | 8-15 | Karim (agences moyennes) |
| **Scale** | 399€ | 16-25 | Agences en croissance |
| **Agency** | Custom | 26+ | Grandes agences |

**Modèle de conversion :** Free → Starter naturel quand Sophie ajoute sa 2ème propriété.

## Différenciateurs

1. **Stock intégré** — Suivi consommables + alertes seuil bas. Aucun concurrent ne le fait.
2. **Task Fusion** — Détection automatique d'overlap, suggestion Turnover. Unique.
3. **Pricing agressif** — 50-78% moins cher que Properly/Lodgify.
4. **Dual-persona** — Manager et staff terrain dans la même app, interface adaptée.
5. **Marché Maroc** — Premier entrant sur un marché en croissance rapide, quasi aucune compétition locale.

## Non-Functional Requirements (résumé)

| Catégorie | Cible |
|:---|:---|
| **Performance** | < 200ms feedback UI, < 3s page load sur 4G Maroc |
| **Sécurité** | RLS multi-tenant, HttpOnly cookies, TLS, AES-256 |
| **GDPR** | Suppression données sur demande, export, consentement |
| **Accessibilité** | WCAG 2.1 Level AA, 48px touch targets, rem typography |
| **Scalabilité** | 100 users jour 1, architecture 10x growth |
| **i18n** | FR (jour 1), EN (V1.1), RTL-ready (CSS logical properties) |
