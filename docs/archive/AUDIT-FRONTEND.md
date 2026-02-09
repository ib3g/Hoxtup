# Audit Frontend — Février 2026

> Audit complet fichier par fichier du frontend Hoxtup-app (32 fichiers .tsx).
> Verdict final en bas du document.

---

## 1. Ce qui est BIEN fait (à garder)

### i18n — ✅ Bien structuré

- 11 namespaces (common, auth, dashboard, tasks, properties, calendar, inventory, billing, notifications, settings, reservations)
- Config propre dans `i18n/config.ts` avec `i18next-browser-languagedetector`
- La majorité des textes passent par `t()` (quelques exceptions notées ci-dessous)

### Auth client — ✅ Correct

- `lib/auth-client.ts` : Better Auth React client avec organization plugin
- `hooks/useAuth.ts` : hook pratique pour session + org
- `lib/api-client.ts` : openapi-fetch typé avec les types générés

### CSS Variables — ✅ Palette light mode correcte

- `globals.css` implémente correctement "Fusion Méditerranée" en light mode
- Variables de sidebar teal, accent terra cotta, success/warning/danger
- Focus ring, reduced-motion, base layer corrects

### Routing — ✅ Structure App Router correcte

- Route groups `(auth)` et `(dashboard)` bien séparées
- 13 pages dashboard + 3 pages auth + 1 page racine
- Layout dashboard avec AppShell + ErrorBoundary

### Components utilitaires — ✅ Corrects

- `PropertyColorDot` : simple, réutilisable, `aria-hidden`
- `EmptyState` : composition propre avec icône + titre + action
- `Skeleton` / `SkeletonList` / `SkeletonCard` : états de chargement
- `ErrorBoundary` : class component correcte avec fallback i18n
- `TaskCard` : le composant le plus abouti, avec undo timer et status-based styling

---

## 2. Bugs CRITIQUES

### FE-BUG-1 : ZÉRO composant shadcn/ui utilisé — DESIGN 🔴

**Fichier :** `components.json` configuré (style new-york, Lucide, cssVariables) mais **aucun composant `components/ui/` n'existe**.

Chaque formulaire utilise du HTML natif :

```tsx
// login/page.tsx — input HTML brut
<input className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm..." />

// tasks/page.tsx — select HTML brut
<select className="rounded-lg border px-2 py-1 text-sm">
```

L'UX spec prévoit : Button, Input, Label, Select, Dialog, Popover, DatePicker, Toast, Sheet, Tabs. **Rien n'est installé.**

C'est exactement ce que tu décris : "juste du HTML simple, pas du tout moderne."

---

### FE-BUG-2 : Mauvaises polices chargées — DESIGN 🔴

**Fichier :** `app/layout.tsx:6-13`

```tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
```

L'UX spec demande **Inter** (body) et **Outfit** (headings). Le CSS les référence (`--font-sans: 'Inter'`, `--font-heading: 'Outfit'`) mais les polices ne sont jamais chargées. Le navigateur utilise les polices système par défaut.

---

### FE-BUG-3 : Dark mode cassé — DESIGN 🔴

**Fichier :** `globals.css:93-125`

Le thème light utilise correctement la palette "Fusion Méditerranée". Le dark mode utilise des **valeurs oklch génériques** copiées de shadcn/ui par défaut — aucun rapport avec la charte graphique Hoxtup.

---

### FE-BUG-4 : Import dupliqué — COMPILATION ERROR 🔴

**Fichier :** `reservations/page.tsx:10,13`

```tsx
import { SkeletonList } from '@/components/common/Skeleton'  // ligne 10
import { SkeletonList } from '@/components/common/Skeleton'  // ligne 13 — DOUBLON
```

Erreur de compilation.

---

### FE-BUG-5 : API client incohérent — QUALITÉ 🟡

Pages utilisant `api` (openapi-fetch, typé) :
- properties, tasks, property detail

Pages utilisant `fetch()` brut avec `API_URL` hardcodé :
- calendar, notifications, staff, inventory, billing, analytics, incidents, settings

Perte totale de type-safety sur 8 des 13 pages.

---

### FE-BUG-6 : Dashboard affiche "0" en dur — FONCTIONNEL 🔴

**Fichier :** `dashboard/page.tsx:35-58`

```tsx
<DashboardCard icon={Building2} title={t('properties:title')} value="0" href="/properties" />
<DashboardCard icon={CheckSquare} title={t('tasks:title')} value="0" href="/tasks" />
```

Le dashboard ne fait **aucun appel API**. Les KPIs sont des strings hardcodées.

---

### FE-BUG-7 : BottomNavBar ignore le rôle réel — RBAC 🟡

**Fichier :** `AppShell.tsx:13`

```tsx
export function AppShell({ children, role = 'owner' }: AppShellProps) {
```

Le rôle n'est jamais lu depuis le contexte auth. Tous les utilisateurs voient la navigation "manager" même les staff.

---

## 3. Architecture manquante

### MISSING-1 : TanStack Query — AUCUN

L'architecture requiert TanStack Query pour le server state. À la place, chaque page fait :

```tsx
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const loadData = useCallback(async () => { ... }, [])
useEffect(() => { if (isAuthenticated) loadData() }, [])
```

Ce pattern est copié-collé dans **13 pages**. Résultat :
- Aucun cache
- Aucun refetch automatique
- Aucune déduplication de requêtes
- Aucune invalidation après mutation

### MISSING-2 : Zustand — AUCUN

L'architecture requiert Zustand pour le client state (user role, active org, sidebar state, etc.). Non installé.

### MISSING-3 : Framer Motion — AUCUN

L'UX spec requiert Framer Motion pour les animations (page transitions, task status changes, skeleton loading). Non installé. Seuls `animate-spin` et `transition-colors` CSS sont utilisés.

### MISSING-4 : React Hook Form sur les pages dashboard — AUCUN

Les pages auth (login, register) utilisent correctement React Hook Form + Zod. Mais TOUTES les pages dashboard (properties, tasks, reservations, iCal, staff, settings) utilisent `FormData` brut sans validation :

```tsx
const form = new FormData(e.currentTarget)
const body = { name: form.get('name') as string }
```

Aucune validation côté client, aucun message d'erreur.

### MISSING-5 : Toast / notification system — AUCUN

Aucun toast provider. Les opérations réussissent ou échouent silencieusement. Les erreurs vont dans `console.error`.

### MISSING-6 : Dialog pour confirmations — AUCUN

Utilise `window.confirm()` pour les actions destructives au lieu d'un Dialog shadcn/ui.

### MISSING-7 : DatePicker — AUCUN

Utilise `<input type="date">` et `<input type="datetime-local">` natifs au lieu du DatePicker de l'UX spec.

---

## 4. Problèmes de qualité

### Q-1 : Auth guard dupliqué 13 fois

`auth-guard.tsx` existe comme composant mais **n'est jamais utilisé**. Chaque page copie-colle :

```tsx
useEffect(() => {
  if (!authLoading && !isAuthenticated) { router.replace('/login'); return }
  if (isAuthenticated) loadData()
}, [isAuthenticated, authLoading, router, loadData])
```

Devrait être un middleware Next.js ou un layout wrapper.

### Q-2 : `<a href>` au lieu de `<Link>`

`dashboard/page.tsx:84`, `login/page.tsx:144`, `register/page.tsx:234` utilisent `<a href>` au lieu de `<Link>` de Next.js. Cause des rechargements complets de page.

### Q-3 : Pages monolithiques (200-340 lignes)

Tasks = 337 lignes, property detail = 311 lignes, reservations = 219 lignes. Tout dans un seul composant : data fetching, forms, rendu, logique de filtre.

### Q-4 : Hardcoded French malgré i18n

- `incidents/page.tsx:24-29` : `typeLabel()` avec strings FR en dur
- `billing/page.tsx:29-41` : `formatPrice()` et `statusLabel()` en dur
- `calendar/page.tsx:221` : `'Résa'` en dur
- Nombreux `defaultValue` dans `t()` qui devraient être dans les JSON

### Q-5 : `console.error` partout

Chaque catch block fait `console.error(...)` sans feedback à l'utilisateur.

### Q-6 : `import { z } from 'zod'` dans login

`login/page.tsx:3` importe de `'zod'` (v3 syntax), `register/page.tsx:5` importe de `'zod/v4'`. Incohérent.

---

## 5. Évaluation par zone

| Zone | Fichiers | Design spec | Fonctionnel | Moderne | Verdict |
|---|---|---|---|---|---|
| **Config** (package.json, tsconfig, components.json) | 4 | ✅ | ✅ | ✅ | Garder |
| **globals.css** (light theme) | 1 | ✅ | ✅ | ✅ | Garder, fix dark |
| **i18n** | 13 | ✅ | ✅ | ✅ | Garder |
| **lib/** (api-client, auth-client, utils, currency) | 4 | ✅ | ✅ | ✅ | Garder |
| **hooks/** | 2 | ✅ | ✅ | ✅ | Garder |
| **Auth pages** (login, register, invite) | 3 | 🔴 HTML brut | ⚠️ | 🔴 | Réécrire |
| **Layout** (root, auth, dashboard) | 3 | 🔴 Mauvaises polices | ✅ | ⚠️ | Réécrire |
| **AppShell** (Sidebar, BottomNav) | 3 | ⚠️ Structure OK | 🔴 Rôle ignoré | ⚠️ | Réécrire |
| **Dashboard page** | 1 | 🔴 KPIs en dur | 🔴 Aucun API call | 🔴 | Réécrire |
| **Properties** (list + detail) | 2 | 🔴 HTML forms | ⚠️ | 🔴 | Réécrire |
| **Tasks** | 1 | ⚠️ TaskCard OK | ⚠️ | 🔴 | Réécrire |
| **Reservations** | 1 | 🔴 Import cassé | 🔴 | 🔴 | Réécrire |
| **Calendar** | 1 | 🔴 Pas de timeline | ⚠️ | 🔴 | Réécrire |
| **Other pages** (6) | 6 | 🔴 HTML brut | ⚠️ | 🔴 | Réécrire |
| **components/ui/** | 0 | 🔴 INEXISTANT | — | — | Installer |

---

## 6. VERDICT FINAL

### Le frontend est un PROTOTYPE, pas une application moderne.

Tu as 100% raison : c'est du HTML basique avec des classes Tailwind manuelles. Aucun composant UI moderne, aucun design system, aucune animation, aucun state management.

### Recommandation : RESTART FRONTEND COMPLET

#### À GARDER tel quel :

```
GARDER :
├── package.json           (ajouter: @tanstack/react-query, zustand, framer-motion)
├── tsconfig.json
├── components.json        (config shadcn/ui correcte)
├── next.config.ts
├── src/i18n/              (config + toutes les traductions)
├── src/lib/               (api-client, auth-client, utils, currency)
├── src/hooks/             (useAuth, useCurrency)
├── src/generated/         (types API)
└── src/app/globals.css    (fix: fonts + dark theme)
```

#### À RÉÉCRIRE :

```
RÉÉCRIRE :
├── src/app/layout.tsx             (charger Inter + Outfit au lieu de Geist)
├── src/app/page.tsx
├── src/app/(auth)/*               (avec shadcn/ui Input, Button, Card)
├── src/app/(dashboard)/*          (toutes les 13 pages)
├── src/components/features/*      (AppShell, Sidebar, BottomNav, TaskCard, etc.)
├── src/components/common/*        (refactorer avec shadcn/ui)
└── src/components/auth-guard.tsx   (transformer en middleware/layout guard)
```

#### À CRÉER (n'existe pas) :

```
CRÉER :
├── src/components/ui/             (npx shadcn@latest add button input label select dialog ...)
├── src/hooks/queries/             (TanStack Query hooks par module)
├── src/stores/                    (Zustand stores)
├── src/components/providers/      (QueryClientProvider, etc.)
└── src/middleware.ts              (Next.js middleware auth)
```

### Changements clés dans la réécriture :

1. **shadcn/ui partout** — Button, Input, Label, Select, Dialog, Popover, DatePicker, Toast, Sheet, Tabs
2. **TanStack Query** — 1 hook par module (`useProperties`, `useTasks`, `useReservations`, etc.)
3. **Zustand** — stores pour user role, active org, sidebar, filters
4. **Framer Motion** — page transitions, list animations, task status changes
5. **React Hook Form + Zod** — sur TOUS les formulaires, pas seulement auth
6. **Inter + Outfit** — polices correctes via `next/font/google`
7. **Dark theme** — Fusion Méditerranée en oklch, pas les defaults shadcn
8. **Auth middleware** — Next.js `middleware.ts` au lieu de 13x `useEffect`
9. **openapi-fetch partout** — plus de `fetch()` brut

### Estimation restart frontend : ~2-3 semaines

Combiné avec le backend (~2 semaines), le restart complet = **~4-5 semaines** pour une app production-ready.

---

*Audit réalisé le 9 février 2026.*
