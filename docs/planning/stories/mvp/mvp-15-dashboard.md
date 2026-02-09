# mvp-15 — Dashboard Home

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-06 (Reservations), mvp-08 (Task List)
**Référence :** [frontend-guide.md](../../frontend-guide.md) — sections DashboardHeader, KPIBar

## Objectif

Page d'accueil après login. Deux vues : Dashboard manager (Owner/Admin/Manager) et Dashboard terrain (Staff).

## Tâches

### 1. Dashboard Manager (`/dashboard`)

#### DashboardHeader

- Greeting : "Bonjour, [prénom]" + date
- Message contextuel selon heure + état :
  - Matin + non assignées → "X tâches à assigner"
  - Matin + tout OK → "Tout est prêt pour aujourd'hui"
  - Incidents → "X incidents à traiter"
  - Soir + tout fait → "Journée complète"

#### KPIBar

- 3-4 KPIs en ligne :
  - Tâches aujourd'hui (total)
  - Check-ins aujourd'hui
  - Incidents ouverts (rouge si > 0)
  - Tâches en retard (rouge si > 0)
- Couleurs : vert si 0 problèmes, rouge si alertes, teal neutre

#### Tâches du jour

- Liste des TaskCards pour aujourd'hui (triées par heure)
- "Voir toutes les tâches" → lien vers `/tasks`

#### Alertes

- Incidents non résolus
- Tâches non assignées
- Réservations sans tâche (si auto-generation désactivée)

### 2. Dashboard Terrain (`/dashboard` pour Staff)

- Prochaine tâche en variante Prominent (grande carte, gros CTA)
- Compteur : "X tâches restantes aujourd'hui"
- Liste des tâches suivantes en variante Default
- Pas de KPIs, pas d'alertes complexes — juste "quoi faire maintenant"

### 3. Adaptation rôle

- `useAuth()` → `user.role` → rendu conditionnel
- Owner/Admin → Dashboard Manager
- Manager → Dashboard Manager (scopé aux propriétés assignées)
- Staff → Dashboard Terrain

## Acceptance Criteria

- [ ] Dashboard Manager affiche KPIs, tâches du jour, alertes
- [ ] Dashboard Terrain affiche la prochaine tâche en Prominent
- [ ] Le greeting est personnalisé (prénom + message contextuel)
- [ ] Les KPIs sont corrects (compteurs dynamiques)
- [ ] Clic sur TaskCard → détail tâche
- [ ] Skeleton loading pendant le fetch
- [ ] Responsive mobile/desktop
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/dashboard/home` — KPIs + tâches du jour + alertes (Owner/Admin/Manager)
- `GET /api/v1/dashboard/field` — prochaine tâche + compteur (Staff)
