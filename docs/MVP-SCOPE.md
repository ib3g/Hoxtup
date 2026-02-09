# MVP Scope — Première release shippable

> **Objectif :** Livrer la plus petite version qui permet à Sophie (5 appartements, Marrakech) de remplacer WhatsApp + Excel par Hoxtup et de payer 69€/mois.

## Critère de succès MVP

Sophie peut :

1. Créer son compte et son organisation
2. Ajouter ses 5 propriétés
3. Connecter ses calendriers iCal Airbnb/Booking
4. Voir ses réservations dans un calendrier
5. Voir les tâches auto-générées (ménage, check-in)
6. Assigner des tâches à Fatima
7. Fatima voit sa prochaine tâche et la complète sur son téléphone
8. Sophie reçoit une notification quand c'est fait
9. Sophie peut voir un tableau de bord simple (tâches du jour, alertes)
10. Sophie passe au plan Starter quand elle ajoute sa 2ème propriété

**Si Sophie fait tout ça en une semaine d'utilisation, le MVP est réussi.**

---

## Périmètre MVP — 17 stories fullstack

> Suite aux audits backend et frontend (voir `archive/AUDIT-BACKEND.md` et `archive/AUDIT-FRONTEND.md`), chaque story est désormais **fullstack** : backend API (réécriture) + frontend UI (réécriture). L'infrastructure est conservée (Prisma schema, docker, config).

### Phase 1A — Fondations (stories 01-04)

| # | Story | Scope | Dépendances |
|:---|:---|:---|:---|
| mvp-01 | Design System & Tokens | Tailwind config, fonts (Outfit+Inter), couleurs Palette C, shadcn/ui setup | Aucune |
| mvp-02 | App Shell & Navigation | Layout responsive, BottomNavBar, Sidebar, AuthGuard, providers (QueryClient, Zustand) | mvp-01 |
| mvp-03 | Auth Pages | Login, Register, flow post-signup (création org). Backend : Better Auth setup + org endpoint | mvp-01, mvp-02 |
| mvp-04 | Onboarding Flow | Création première propriété, connexion iCal. Backend : property + ical endpoints | mvp-03 |

### Phase 1B — Core opérationnel (stories 05-11)

| # | Story | Scope | Dépendances |
|:---|:---|:---|:---|
| mvp-05 | Properties List & Detail | Backend : CRUD + property limits. Frontend : liste, détail, forms shadcn/ui | mvp-02 |
| mvp-06 | Reservations List | Backend : CRUD réservations. Frontend : liste, filtres, création | mvp-05 |
| mvp-07 | iCal Management | Backend : sources iCal + sync job. Frontend : gestion sources par propriété | mvp-05 |
| mvp-08 | Task List & Filtering | Backend : queries tâches, scoped/my. Frontend : TaskCard, liste, filtres | mvp-05 |
| mvp-09 | Task Detail & Transitions | Backend : state machine transitions. Frontend : détail, boutons transition, optimistic UI | mvp-08 |
| mvp-10 | Task Assignment | Backend : assign/bulk-assign. Frontend : MemberSelector, bulk assign | mvp-08 |
| mvp-11 | Manual Task Creation | Backend : création tâche manuelle. Frontend : form React Hook Form + Zod | mvp-08 |

### Phase 1C — Visibilité & gestion (stories 12-17)

| # | Story | Scope | Dépendances |
|:---|:---|:---|:---|
| mvp-12 | Calendar View | Backend : endpoint calendrier unifié. Frontend : vue semaine, events, navigation | mvp-06, mvp-08 |
| mvp-13 | Team Management | Backend : team endpoints + staff managed. Frontend : liste, inviter, rôles | mvp-02 |
| mvp-14 | Notifications | Backend : dispatch + CRUD notifications. Frontend : centre notifs, badge, préférences | mvp-02 |
| mvp-15 | Dashboard Home | Backend : endpoints dashboard/home + field. Frontend : KPIs, tâches du jour, vue terrain | mvp-08, mvp-06 |
| mvp-16 | Settings & Profile | Backend : profile/org endpoints. Frontend : settings page, logout | mvp-02 |
| mvp-17 | Billing & Subscription | Backend : Polar integration + plans. Frontend : plans, checkout, annulation | mvp-02 |

---

## Ce qui est explicitement HORS MVP

Ces features sont reportées à V1 (backend + frontend) :

- Stock management (consommables, mouvements)
- Asset tracking
- Financial reporting & charts
- Task Fusion Engine (suggestions de fusion UI)
- Proxy task management (agir au nom d'un staff)
- Calendar multi-vues (4 vues : global, propriété, employé, type)
- Dashboard KPIs avancés & temporal adaptation
- Task conflict detection UI
- Incident reporting form (version simplifiée OK en MVP, version complète en V1)

---

## Définition de "Done" pour le MVP

- [ ] Les 17 stories fullstack sont implémentées (backend API + frontend UI)
- [ ] Backend : OpenAPI spec complète, services tenant-scoped, tests par module
- [ ] Frontend : shadcn/ui partout, TanStack Query, React Hook Form + Zod sur tous les forms
- [ ] L'app est responsive (mobile-first, fonctionne sur desktop)
- [ ] Tous les textes passent par i18n (t()) — pas de texte hardcodé
- [ ] Les pages critiques sont testées manuellement sur mobile (iPhone SE, Galaxy A14)
- [ ] Le checkout Polar fonctionne (sandbox)
- [ ] Le flow complet Sophie est fonctionnel : signup → propriété → iCal → tâches → assign → complete
- [ ] Le flow Fatima est fonctionnel : login → voir ma tâche → commencer → terminer
- [ ] Deploy : API sur Coolify VPS, App sur Vercel
