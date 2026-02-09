# mvp-08 — Task List & Filtering

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-05 (Properties)
**Référence :** [frontend-guide.md](../../frontend-guide.md) — section TaskCard

## Objectif

Page tâches principale : liste filtrée, "Mes tâches" pour le staff, et le composant TaskCard réutilisable.

## Tâches

### 1. Composant TaskCard

Le composant le plus important de l'app. Implémenter les 5 états visuels :

- `pending_validation` — border amber, fond tinted, CTA "Valider"
- `validated` / `assigned` — border couleur propriété, fond blanc
- `in_progress` — border terra, fond blanc + subtle glow, CTA "Terminer"
- `completed` — border vert, opacité 0.5, strikethrough
- `blocked` — border rouge, fond tinted, CTA "Résoudre"

Infos affichées : type (CLEANING/CHECKIN/CHECKOUT/INSPECTION/TURNOVER/CUSTOM), propriété (ColorDot + nom), assignee, date/heure, statut.

Variante Default (72px, liste) et Prominent (140px, prochaine tâche staff).

### 2. Page liste `/tasks`

- Liste TaskCards triées par date (plus urgentes d'abord)
- Filtres : statut (multi-select), propriété, assignee, plage de dates
- Toggle "Mes tâches" / "Toutes" (selon rôle)
- Staff voit uniquement ses tâches (`GET /tasks/my`)
- Owner/Admin/Manager voit toutes (`GET /tasks` ou `/tasks/scoped`)
- Skeleton loading

### 3. Vue "Mes tâches" staff

- Prochaine tâche en variante Prominent (grande carte, CTA full-width)
- Liste des tâches suivantes en variante Default
- Compteur : "3 tâches aujourd'hui, 1 en cours"

### 4. Bouton "Créer une tâche" (visible pour Owner/Admin/Manager/Staff Autonomous)

- Bouton FAB (floating action button) sur mobile
- Ouvre form création (voir mvp-11)

## Acceptance Criteria

- [ ] TaskCard affiche correctement les 5 états visuels
- [ ] La liste affiche les tâches triées par urgence
- [ ] Les filtres fonctionnent (statut, propriété, assignee, dates)
- [ ] Staff voit uniquement ses tâches
- [ ] Owner/Admin voit toutes les tâches (scopées pour Manager)
- [ ] Variante Prominent fonctionne pour la prochaine tâche
- [ ] Skeleton loading pendant le fetch
- [ ] Tous les textes i18n
- [ ] Touch targets ≥ 48px sur mobile

## API utilisées

- `GET /api/v1/tasks` — toutes les tâches (Owner/Admin)
- `GET /api/v1/tasks/my` — mes tâches (Staff)
- `GET /api/v1/tasks/scoped` — tâches scopées (Manager)
