# mvp-02 — App Shell & Navigation

**Status :** `done`
**Scope :** Frontend only
**Dépendances :** mvp-01 (Design System)
**Référence :** [frontend-guide.md](../../frontend-guide.md) — sections AppShell, BottomNavBar

## Objectif

Implémenter le layout racine de l'application : header, navigation responsive (BottomNavBar mobile, Sidebar desktop), AuthGuard, et adaptation par rôle.

## Tâches

### 1. Layout `(dashboard)/layout.tsx`

- Wrapper AuthGuard : redirige vers `/login` si pas de session
- Charger les données user + org via TanStack Query
- Layout responsive : single-column mobile, split-panel desktop

### 2. BottomNavBar (mobile < 768px)

- **Owner/Admin :** 4 tabs — Home (LayoutDashboard) · Calendar (Calendar) · Team (Users) · More (Menu)
- **Staff :** 3 tabs — Tasks (CheckSquare) · Planning (Calendar) · Incident (AlertTriangle)
- Actif : terra `#a06050`, inactif : gray `#94a3b8`
- Height : 56px, touch targets ≥ 48x48px
- Badge NotificationBadge sur tab Home/Tasks
- Utiliser Lucide icons

### 3. Sidebar desktop (> 1024px)

- Background immersive `#1e2d35`
- Logo Hoxtup en haut
- Nav items avec icônes Lucide
- Sections : Dashboard, Properties, Reservations, Tasks, Calendar, Team, Inventory (V1 badge), Billing, Settings
- Active item : terra highlight
- Collapsible (icône-only mode)

### 4. DashboardHeader

- Greeting personnalisé : "Bonjour, [prénom]" + date du jour
- Message contextuel basé sur l'heure et l'état des tâches
- Mobile : compact (1 ligne greeting, 1 ligne contexte)
- Desktop : plus spacieux avec date visible

### 5. Adaptation par rôle

- `useAuth()` retourne `user.role` → conditionner les nav items
- Owner/Admin : navigation complète
- Manager : pas de Billing, pas de Settings avancés
- Staff Autonomous : Tasks, Calendar, Incidents
- Staff Managed : Tasks uniquement

## Acceptance Criteria

- [ ] Le layout s'affiche correctement mobile (< 768px) et desktop (> 1024px)
- [ ] BottomNavBar affiche les bons tabs selon le rôle
- [ ] La navigation fonctionne (clic sur tab → route correcte)
- [ ] Le header affiche le greeting avec le bon prénom
- [ ] AuthGuard redirige vers `/login` si pas de session
- [ ] Le sidebar est collapsible sur desktop
- [ ] Tous les textes passent par `t()` (i18n)

## API utilisées

- `GET /api/auth/get-session` — session courante
- Pas d'autre API nécessaire pour cette story

## Anti-patterns

- Ne PAS dupliquer la logique de rôle — créer un hook `useNavItems(role)` qui retourne les items
- Ne PAS hardcoder les textes de navigation
- Ne PAS utiliser `position: fixed` pour le BottomNavBar — utiliser `sticky` avec `bottom: 0`
