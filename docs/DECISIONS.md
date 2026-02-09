# Decisions — Log des décisions techniques

> Chaque décision non triviale est documentée ici avec son contexte et ses alternatives rejetées.
> Format : Date | Décision | Contexte | Alternatives rejetées

---

## Auth

### 2026-01 — Better Auth au lieu de jose + argon2

**Décision :** Utiliser Better Auth 1.4.18 avec Prisma adapter + organization plugin.

**Contexte :** Le PRD initial prévoyait JWT custom (jose + argon2). Better Auth offre auth complète (signup, login, sessions, org, invitations, rôles) en une seule lib, avec intégration Express + React native.

**Alternatives rejetées :**
- `jose + argon2` : Trop de code custom pour session management, refresh tokens, CSRF. 2-3 semaines de dev économisées.
- `NextAuth` : Orienté Next.js, intégration Express complexe.
- `Lucia Auth` : Deprecated en faveur de recommandations custom.

**Impact :** Session-based auth (HttpOnly cookies) au lieu de JWT. Mount via `toNodeHandler(auth)` sur `/api/auth/*`. Organization plugin gère multi-tenant, rôles, invitations.

### 2026-01 — Cross-subdomain cookies désactivées en dev

**Décision :** `crossSubDomainCookies` activé uniquement en production (`.hoxtup.com`).

**Contexte :** En dev, `localhost` ne supporte pas les cookies cross-subdomain. L'option nécessite un `baseURL` avec un vrai domaine.

### 2026-01 — Session-based auth, pas JWT

**Décision :** Cookies HttpOnly de session via Better Auth, pas de JWT.

**Contexte :** Better Auth utilise nativement des sessions. Les JWT ajoutent de la complexité (refresh rotation, invalidation) sans bénéfice pour une app web classique. Les cookies HttpOnly sont plus sécurisés contre XSS.

---

## Base de données

### 2026-01 — Prisma 7.3.0 avec @prisma/adapter-pg (Direct TCP)

**Décision :** Prisma 7 avec adaptateur TCP direct, pas Accelerate.

**Contexte :** Prisma 7 est "Rust-free", plus léger. L'adapter-pg permet une connexion TCP directe sans proxy Prisma.

**Impact :** Generator = `prisma-client` (pas `prisma-client-js`). Output dans `src/generated/prisma`. `prisma.config.ts` requis.

### 2026-01 — Port PostgreSQL 5433 (pas 5432)

**Décision :** Docker PG exposé sur port 5433.

**Contexte :** Le port 5432 entre en conflit avec une installation PG locale. 5433 évite le conflit.

### 2026-01 — Dual PG roles : hoxtup (owner) + app_user (RLS)

**Décision :** Deux rôles PostgreSQL séparés.

**Contexte :**
- `hoxtup` : Owner, bypasse RLS naturellement. Utilisé pour migrations et seeds.
- `app_user` : Soumis à RLS. Utilisé par l'application via `APP_DATABASE_URL`.

**Impact :** `docker/init-db.sql` crée `app_user` automatiquement au premier démarrage PG. Après un `prisma migrate reset`, il faut re-GRANT les permissions.

### 2026-01 — RLS : cast organization_id en text

**Décision :** Les policies RLS comparent `organization_id::text = current_setting('app.tenant_id', TRUE)`.

**Contexte :** `current_setting` retourne toujours du text. Comparer directement un UUID échoue. Le cast `::text` résout le problème.

### 2026-01 — forTenant() utilise des transactions interactives

**Décision :** `$transaction(async (tx) => {...})` au lieu de batch transactions.

**Contexte :** L'adapter-pg ne propage pas `set_config` en mode batch. Seules les transactions interactives propagent correctement le `app.tenant_id` pour RLS.

---

## Billing

### 2026-01 — Polar au lieu de Stripe

**Décision :** Utiliser Polar comme Merchant of Record.

**Contexte :** Polar gère TVA, invoicing, compliance, Customer Portal. Simplifie énormément la gestion billing pour un solo dev. Stripe nécessiterait de gérer la TVA manuellement.

**Alternatives rejetées :**
- `Stripe` : Plus mature, mais gestion TVA/compliance manuelle. Overkill pour le lancement.
- `Lemon Squeezy` : Acquis par Stripe, avenir incertain.

**Impact :** SDK `@polar-sh/sdk`. Webhooks : `subscription.created`, `subscription.updated`, `subscription.canceled`. Sandbox pour dev.

> **Note :** Le story file 8.1 s'appelle encore "Stripe Integration" — c'est un artefact historique. L'implémentation utilise Polar.

---

## Express

### 2026-01 — Express 5 catch-all : `/{*splat}` pas `/*`

**Décision :** Utiliser `/{*splat}` pour les routes catch-all.

**Contexte :** Express 5 utilise path-to-regexp v8, qui ne supporte plus `/*`. La syntaxe `/{*splat}` est le remplacement.

### 2026-01 — Rate limiter : pas de custom keyGenerator

**Décision :** Utiliser le `keyGenerator` par défaut de `express-rate-limit` v8.

**Contexte :** Un custom `keyGenerator` avec `req.ip` provoque `ERR_ERL_KEY_GEN_IPV6`. Le default fonctionne correctement.

**Impact :** Rate limiter auth : 5 req/15min sur `/api/auth/sign-in/email`. Redis store en prod, memory store en test.

---

## Validation

### 2026-01 — Zod v4 (import depuis 'zod/v4')

**Décision :** Utiliser Zod v4 avec les nouvelles API top-level.

**Impact :**
- `z.email()` au lieu de `z.string().email()`
- `z.uuid()` au lieu de `z.string().uuid()`
- `z.url()` au lieu de `z.string().url()`
- `.min()` / `.max()` / `.regex()` restent valides sur `z.string()`

### 2026-01 — Validation Zod manuelle, pas express-openapi-validator runtime

**Décision :** Validation des requêtes via Zod dans les controllers, pas via `express-openapi-validator` en runtime.

**Contexte :** L'architecture prévoyait `express-openapi-validator` pour validation contract-first. En pratique, Zod est plus flexible et déjà utilisé partout. Le validateur OpenAPI ajoutait de la complexité sans bénéfice net pour un solo dev.

---

## Frontend

### 2026-01 — react-i18next : tout passe par t()

**Décision :** AUCUN texte hardcodé en français dans le frontend. Tout passe par `t()`.

**Impact :** Labels, placeholders, boutons, headings, empty states, messages d'erreur, confirm dialogs, aria-labels — tout dans les fichiers de traduction.

**Structure :** `Hoxtup-app/src/i18n/locales/fr/` avec 11 namespaces (common, auth, properties, reservations, settings, dashboard, tasks, calendar, inventory, billing, notifications).

### 2026-01 — Zod schemas dans les composants (pas dans des fichiers séparés)

**Décision :** Définir les schemas Zod de validation formulaire à l'intérieur du composant où `t()` est disponible.

**Contexte :** Les messages d'erreur Zod doivent passer par i18n. `t()` n'est disponible qu'à l'intérieur d'un composant React.

---

## Infrastructure

### 2026-02 — Backend full-Docker (docker compose up = tout)

**Décision :** Tout le backend tourne dans Docker : PostgreSQL, Redis, Node.js API, Mailhog, Adminer. Une seule commande `docker compose up` lance l'ensemble.

**Contexte :** En dev solo + AI agents, il faut minimiser le setup. Un seul prérequis (Docker) pour le backend. Le frontend (Next.js) reste en local car Turbopack hot-reload est plus performant hors container.

**Alternatives rejetées :**
- Node.js API en local + Docker pour PG/Redis seulement : nécessite Node.js 22 installé pour le backend, 2 terminaux manuels.
- Tout en Docker (y compris frontend) : Next.js hot-reload trop lent dans un container.

**Impact :**
- `DATABASE_URL` utilise `postgres` comme hostname (pas `localhost`)
- `REDIS_URL` utilise `redis` comme hostname
- `SMTP_HOST` utilise `mailhog` comme hostname
- Le code source `Hoxtup-api/src` est monté en volume pour le hot-reload
- Migrations Prisma et seed s'exécutent au démarrage du container API
- Services accessibles : API `:8000`, Mailhog UI `:8025`, Adminer `:8080`, PG `:5433`

---

## Testing

### 2026-01 — vitest avec testTimeout 15000ms

**Décision :** Timeout de 15 secondes pour les tests.

**Contexte :** Certains tests spawn des subprocesses (Prisma). Le timeout par défaut (5s) est insuffisant.

### 2026-01 — Rate limit tests dans un fichier séparé

**Décision :** Les tests de rate limiting sont dans `auth.ratelimit.test.ts`, pas dans le fichier de test auth principal.

**Contexte :** L'IP partagée entre tests épuise le quota. Fichier séparé = isolation.

### 2026-01 — vitest.config.ts contient les env vars de test

**Décision :** Toutes les variables d'environnement de test sont dans le bloc `env` de `vitest.config.ts`.

**Contexte :** Évite la dépendance à un `.env.test` et garantit que les tests sont reproductibles.
