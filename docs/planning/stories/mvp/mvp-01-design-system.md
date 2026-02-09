# mvp-01 — Design System & Tokens

**Status :** `todo`
**Scope :** Frontend only
**Dépendances :** Aucune (première story)
**Référence :** [frontend-guide.md](../../frontend-guide.md)

## Objectif

Configurer Tailwind CSS v4, les fonts, les couleurs de la Palette C "Fusion Méditerranée", et les composants shadcn/ui de base pour que toutes les stories suivantes puissent les utiliser directement.

## Tâches

### 1. Tailwind config — Palette C

Configurer dans `globals.css` (Tailwind v4 utilise CSS custom properties) :

- Brand : `--brand-primary: #2c4f5c`, `--brand-accent: #d28370`, `--color-cta: #a06050`, `--color-immersive: #1e2d35`
- Backgrounds : `--bg-primary: #f9fafb`, `--bg-secondary: #eef0f2`
- Status : `--status-success: #2D8A6E`, `--status-warning: #E6A347`, `--status-error: #C45B4A`, `--status-info: #83c6e1`
- Property colors : `--prop-1` à `--prop-5`

### 2. Fonts — Outfit + Inter

- Télécharger `.woff2` subset pour Outfit (variable, headings) et Inter (body)
- Placer dans `public/fonts/`
- `@font-face` dans `globals.css` avec `font-display: swap`
- Configurer Tailwind : `font-heading: Outfit`, `font-body: Inter`

### 3. Typography scale

Configurer les tokens typographiques :

- `text-display` : 28px Outfit 600
- `text-heading` : 20px Outfit 600
- `text-subheading` : 16px Outfit 500
- `text-body` : 14px Inter 400
- `text-label` : 14px Inter 500
- `text-caption` : 12px Inter 400

### 4. shadcn/ui components de base

Installer via CLI les composants fondamentaux :

```bash
npx shadcn@latest add button card badge toast dialog sheet skeleton input label select textarea
```

Configurer le thème shadcn pour utiliser les tokens Hoxtup (pas les defaults).

### 5. Accessibility base

- Focus ring : `2px solid #264653, offset 2px`
- Touch targets : min 48x48px sur tous les boutons
- `prefers-reduced-motion` : transitions à 0ms
- Base rem (pas px) pour toutes les font sizes

## Acceptance Criteria

- [ ] Les couleurs Palette C sont disponibles via classes Tailwind (`bg-brand-primary`, `text-cta`, etc.)
- [ ] Outfit et Inter se chargent correctement (pas de FOUT visible)
- [ ] Les composants shadcn/ui utilisent les couleurs Hoxtup
- [ ] Un composant `Button` avec les 4 variantes (primary terra, secondary teal, ghost, destructive) fonctionne
- [ ] Le focus ring est visible et conforme
- [ ] `prefers-reduced-motion` est respecté

## Anti-patterns

- Ne PAS utiliser les couleurs par défaut shadcn/ui (zinc, slate)
- Ne PAS utiliser `px` pour les font sizes
- Ne PAS ajouter de composants non listés (les ajouter quand les stories les nécessitent)
