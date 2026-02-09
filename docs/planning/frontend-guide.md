# Frontend Guide — Design Tokens, Composants, Patterns UX

> Ce document est la référence unique pour tout développement frontend. Chaque composant, couleur, et pattern est défini ici.

---

## Design Tokens

### Couleurs — Palette C "Fusion Méditerranée"

> *"Teal reads, terra cotta acts"* — Le teal structure la lecture (calme, confiance). Le terra cotta invite à l'action (chaleur, engagement).

**Brand :**

| Token CSS | Hex | Tailwind | Usage |
|:---|:---|:---|:---|
| `--brand-primary` | `#2c4f5c` | `brand-primary` | Headings, labels, task titles, nav |
| `--brand-accent` | `#d28370` | `brand-accent` | Logo dot, highlights décoratifs |
| `--color-cta` | `#a06050` | `cta` | Boutons primaires, CTAs, tabs actifs |
| `--color-immersive` | `#1e2d35` | `immersive` | Backgrounds sombres (sidebar desktop) |
| `--bg-primary` | `#f9fafb` | `bg-primary` | Fond pages, cards |
| `--bg-secondary` | `#eef0f2` | `bg-secondary` | Fonds secondaires, dividers |

**Fonctionnelles :**

| Token CSS | Hex | Usage | Accessibilité |
|:---|:---|:---|:---|
| `--status-success` | `#2D8A6E` | Tâche complétée, confirmations | AA Normal (4.8:1) |
| `--status-warning` | `#E6A347` | Attention, stock alerts, pending | AA Large only — toujours doublé avec icône |
| `--status-error` | `#C45B4A` | Urgent, incidents, erreurs | AA Large (4.1:1) |
| `--status-info` | `#83c6e1` | Badges info, tips | Décoratif seulement — jamais pour du texte seul |

**Propriétés (color-coding) :**

| Slot | Hex | Token |
|:---|:---|:---|
| Property 1 | `#2c4f5c` | `--prop-1` |
| Property 2 | `#c47a68` | `--prop-2` |
| Property 3 | `#2D8A6E` | `--prop-3` |
| Property 4 | `#6366F1` | `--prop-4` |
| Property 5 | `#E6A347` | `--prop-5` |
| Property 6+ | HSL rotation | Généré dynamiquement |

### Typographie

| Token | Taille | Font | Weight | Usage |
|:---|:---|:---|:---|:---|
| `text-display` | 28px | Outfit | 600 | Titres de pages |
| `text-heading` | 20px | Outfit | 600 | Headers de sections |
| `text-subheading` | 16px | Outfit | 500 | Titres de cards, KPIs |
| `text-body` | 14px | Inter | 400 | Body text, descriptions |
| `text-label` | 14px | Inter | 500 | Labels, nav items, boutons |
| `text-caption` | 12px | Inter | 400 | Timestamps, meta |
| `text-micro` | 10px | Inter | 500 | Pill labels (utiliser avec parcimonie) |

**Fonts :** Self-hosted `.woff2`, Outfit (variable, ~35ko) + Inter subset (~30ko). `font-display: swap`.

### Spacing

Base unit : **4px**. Tokens : `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-6` (24px), `space-8` (32px), `space-10` (40px).

### Breakpoints

| Breakpoint | Range | Cible | Layout |
|:---|:---|:---|:---|
| **Mobile** | < 768px | Fatima, Sophie mobile | Single column, BottomNavBar |
| **Tablet** | 768-1024px | Karim on-site | 2 colonnes, sidebar collapsible |
| **Desktop** | > 1024px | Karim bureau | Split panel, sidebar permanente, pas de bottom nav |

---

## Hiérarchie de boutons — Règle "Terra Cotta Acts"

**UN SEUL bouton primaire par écran.** C'est le bouton terra cotta. Tout le reste est secondaire ou ghost.

| Niveau | Style | Couleur | Usage | Exemple |
|:---|:---|:---|:---|:---|
| **Primary** | Solid, full-width mobile | `#a06050` terra | 1 par écran : action principale | "Valider", "Commencer", "Terminer" |
| **Secondary** | Outline (1px border) | `#2c4f5c` teal | Actions de support | "Voir détails", "Filtrer" |
| **Ghost** | Text only | `#2c4f5c` teal | Actions tertiaires | "Annuler", "Retour" |
| **Destructive** | Solid | `#C45B4A` rouge | Actions irréversibles | "Supprimer", "Signaler problème" |

Sizing : min-height 48px mobile, touch targets ≥ 48x48px, border-radius 6px, font Inter 500 0.875rem.

---

## Feedback Patterns

| Situation | Pattern | Durée | Visuel |
|:---|:---|:---|:---|
| Action constructive (validate, complete) | Instant + toast undo | Toast 5s | Toast vert `#2D8A6E`, lien "Annuler" |
| Action destructive (cancel, delete) | Dialog confirmation d'abord | Jusqu'à dismiss | Alert Dialog avec bouton destructive |
| Erreur réseau | Toast avec retry | Persistant | Toast rouge `#C45B4A`, bouton "Réessayer" |
| Sync background (iCal) | Silencieux | — | Calme : l'absence de bruit EST le feedback |
| Changement d'état tâche | Animation inline | 300ms | Transition color bar + checkmark |

**Toast position :** Bas de l'écran, au-dessus du BottomNavBar (16px gap). Max 2 toasts empilés.

---

## Composants custom Hoxtup

### `AppShell`

Layout racine. Gère header + content + navigation selon le rôle.

| Rôle | Header | Navigation | Tabs |
|:---|:---|:---|:---|
| Owner/Admin | DashboardHeader (greeting + KPIs) | BottomNavBar (mobile), Sidebar (desktop) | Home · Calendar · Team · More |
| Staff | Header simplifié (nom + compteur tâches) | BottomNavBar | Tasks · Planning · Incident |

### `TaskCard`

Composant le plus utilisé. 5 états visuels alignés sur le lifecycle.

| État | Border gauche | Background | CTA | Opacité |
|:---|:---|:---|:---|:---|
| `pending_validation` | `#E6A347` amber | `#FEF9E7` tint | "Valider" terra | 1.0 |
| `validated` / `assigned` | Couleur propriété | blanc | — | 1.0 |
| `in_progress` | `#a06050` terra | blanc + subtle glow | "Terminer" terra | 1.0 |
| `completed` | `#2D8A6E` vert | blanc | — | 0.5 + strikethrough |
| `blocked` | `#C45B4A` rouge | `#FEF2F0` tint | "Résoudre" rouge | 1.0 |

2 variantes : **Default** (72px, liste) et **Prominent** (140px, prochaine tâche Fatima, CTA full-width 56px).

### `DashboardHeader`

Header adaptatif avec greeting personnalisé, date, message contextuel.

Messages contextuels :
- Matin + tâches non assignées → "3 tâches à assigner"
- Matin + tout assigné → "Tout est prêt pour aujourd'hui"
- Midi + alertes → "1 alerte à traiter"
- Soir + tout fait → "Journée complète ✓"

### `KPIBar`

3-4 KPIs en ligne. Valeurs en Outfit (large), labels en Inter (small).
Couleurs : `#2D8A6E` pour 0 alertes (bon), `#C45B4A` pour >0 incidents, `#2c4f5c` neutre.

### `BottomNavBar`

4 tabs Owner (Home · Calendar · Team · More), 3 tabs Staff (Tasks · Planning · Incident).
Actif : terra `#a06050`. Inactif : gray `#94a3b8`. Height 56px. Touch targets ≥ 48x48px.

### `PropertyColorDot`

Indicateur coloré par propriété. 3 tailles : Small (6px inline), Medium (10px cards), Large (16px selectors).

### `NotificationBadge`

Rouge (`#C45B4A`) pour alertes, amber (`#E6A347`) pour pending, teal (`#2c4f5c`) pour info. Numérique ou dot-only.

---

## Form Patterns

- **Required :** Pas de marqueur (assumé par défaut)
- **Optional :** Label "(optionnel)" en gray `#94a3b8`
- **Validation :** Inline temps réel (debounce 300ms), erreur en rouge `#C45B4A` sous le champ
- **Mobile :** 1 champ par ligne, keyboard type adapté, submit toujours visible (sticky)
- **Spacing :** 16px entre champs, 4px label→input, input min-height 44px

---

## Navigation Patterns

**Entry points par rôle :**
- Owner → Dashboard (KPIs + tâches du jour)
- Admin/Manager → Dashboard (tâches non assignées first)
- Staff → Next Task (carte proéminente)

**Bottom nav :** Actif = terra, inactif = gray. Badge sur tab. Max 4 tabs owner, 3 tabs staff.

**Modals/Overlays :**
- Sheet (bottom drawer) : actions contextuelles, détails tâches. Dismiss swipe-down.
- Dialog : confirmations destructives uniquement. Cancel (ghost) + Confirm (primary/destructive).
- Toast : feedback actions. Auto-dismiss 3-5s.
- Jamais empiler modals (pas de dialog dans un sheet).

---

## Loading & Empty States

**Loading :** Skeleton loading (shadcn/ui `Skeleton`). Jamais de spinners. Optimistic UI pour actions user.

**Empty states :**

| Contexte | Icône | Message | CTA |
|:---|:---|:---|:---|
| Pas de propriétés | Maison | "Ajoutez votre première propriété" | "Créer" (primary) |
| Pas de tâches | Soleil/zen | "Rien de prévu aujourd'hui" | "Voir le calendrier" (ghost) |
| Pas d'équipe | Personnes | "Invitez votre équipe" | "Inviter" (primary) |
| Recherche vide | Loupe | "Aucun résultat pour [query]" | "Effacer" (ghost) |

---

## Accessibilité (WCAG 2.1 AA)

- Touch targets ≥ 48x48px
- Tout en `rem` (jamais `px` pour les font sizes)
- Focus ring : `2px solid #264653, offset 2px`
- `prefers-reduced-motion` respecté (0ms transitions)
- `prefers-contrast: high` augmente les bordures
- Couleur jamais seule pour indiquer un état (toujours icône + couleur)
- Semantic HTML : `<header>`, `<main>`, `<nav>`, `<article>`
- ARIA labels sur tous les composants custom
- Skip-to-content link

---

## Règles i18n

- **AUCUN texte hardcodé.** Tout passe par `t()` de react-i18next.
- Namespaces : common, auth, properties, reservations, settings, dashboard, tasks, calendar, inventory, billing, notifications
- Default namespace : `common`. Fallback : `fr`.
- Zod schemas de validation : définis dans le composant (où `t()` est disponible)
- Nouveaux namespaces doivent être enregistrés dans `src/i18n/config.ts`
