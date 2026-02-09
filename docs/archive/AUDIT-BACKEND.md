# Audit Backend — Février 2026

> Audit complet fichier par fichier du backend Hoxtup-api.
> Verdict final en bas du document.

---

## 1. Ce qui est BIEN fait (à garder)

### Prisma Schema (`prisma/schema.prisma`) — ✅ Excellent

- 695 lignes, 25+ modèles, tous avec `@map` snake_case
- Enums correctement définis et mappés
- Relations bien structurées avec `onDelete` appropriés
- Index pertinents sur les colonnes fréquemment filtrées
- Modèles métier complets : Task, Reservation, Incident, FusionPair, TaskConflict, TaskAutoRule, ConsumableItem, Asset, Revenue, Subscription
- **Verdict : garder tel quel à 100%**

### Architecture patterns — ✅ Bon

- **Event Bus** (`common/events/`) : EventEmitter bien typé avec 11 événements
- **State Machine** (`task-state-machine.ts`) : transitions propres et testables
- **RBAC** (`types/roles.ts` + `types/permissions.ts`) : matrice complète, 5 rôles, 24 permissions
- **Middleware chain** : auth → tenant → subscriptionGuard → rbac → scope → controller
- **RFC 7807** error format avec `AppError` base class et sous-classes
- **Verdict : architecture à réutiliser**

### Docker & Config — ✅ Fonctionnel

- `docker-compose.yml` : PG 16, Redis 7, Mailhog, API dev container avec volumes
- `Dockerfile.dev` + `docker-entrypoint.dev.sh` : hot-reload via tsx watch
- `Dockerfile` (prod) : multi-stage build correct
- **Verdict : garder tel quel**

### Package.json — ✅ Stack correcte

- Express 5, Prisma 7.3, Better Auth 1.4.18, BullMQ, ioredis, Zod 4, pino
- Versions cohérentes et récentes
- **Verdict : garder tel quel**

---

## 2. Bugs CRITIQUES trouvés

### BUG-1 : RLS jamais utilisé — SÉCURITÉ 🔴

**Fichier :** `config/database.ts` + tous les services

Le code définit `forTenant()` et `getTenantDb()`. Le middleware `tenant.middleware.ts` crée bien `req.db = getTenantDb(tenantId)`. Mais **AUCUN service n'utilise `req.db`**. Tous les services importent directement `prisma` (le client global sans RLS) et filtrent manuellement avec `where: { organizationId }`.

```typescript
// tenant.middleware.ts — crée req.db
(req as unknown as TenantRequest).db = getTenantDb(tenantId)

// properties.service.ts — IGNORE req.db, utilise prisma global
import { prisma } from '../../config/database.js'
export async function listProperties(organizationId: string, ...) {
  return prisma.property.findMany({ where: { organizationId } })
}
```

**Impact :** Row Level Security est configuré dans PostgreSQL mais jamais activé côté application. Un bug dans un seul `where` clause = fuite de données entre organisations.

**Effort de fix :** Refactorer TOUS les services pour recevoir le `db` tenant-scoped au lieu d'importer `prisma` global. Change la signature de chaque fonction de service.

---

### BUG-2 : Clé composée Prisma incorrecte dans notifications — RUNTIME ERROR 🔴

**Fichier :** `modules/notifications/notification-dispatcher.ts:68-69`

```typescript
const pref = await prisma.notificationPreference.findUnique({
  where: { userId_notificationType_channel: { userId, notificationType: type, channel } },
})
```

La clé unique dans le schema est sur **4 champs** (`organizationId + userId + notificationType + channel`), pas 3. Le nom Prisma généré est `organizationId_userId_notificationType_channel`. Ce code crashe à runtime avec une erreur Prisma.

**Impact :** Chaque notification dispatch échoue silencieusement (catch dans le dispatcher).

---

### BUG-3 : Seed incompatible avec Better Auth — AUTH CASSÉE 🔴

**Fichier :** `prisma/seed.ts`

Le seed hash les mots de passe avec `scryptSync` (custom), mais Better Auth utilise son propre algorithme de hashing (`bcrypt` ou `scrypt` avec un format spécifique). Les users seedés **ne peuvent pas se connecter** via Better Auth car le hash n'est pas au format attendu.

```typescript
// seed.ts — hash custom
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}` // format "salt:hash"
}
```

Better Auth attend un format différent. De plus, le seed ne crée pas les entrées `Account` nécessaires pour Better Auth.

**Impact :** Impossible de se connecter avec les users seedés.

---

### BUG-4 : OpenAPI spec incomplète + validation active — 500 ERRORS 🔴

**Fichier :** `openapi.yaml`

Nombreux `# TODO: Define Item schema` et `type: object` sans propriétés. Pendant ce temps, `app.ts` active la validation des réponses en dev/test :

```typescript
validateResponses: process.env.NODE_ENV !== 'production',
```

**Impact :** Les endpoints avec des schemas incomplets retournent des erreurs 500 en dev quand la réponse ne match pas le schema OpenAPI. Cela peut expliquer le "pas mal de choses qui ne marchent pas".

---

### BUG-5 : Property limit jamais vérifié — BUSINESS LOGIC 🟡

**Fichier :** `modules/billing/billing.service.ts` → `checkPropertyLimit()`

La fonction existe et est correctement implémentée, mais elle **n'est jamais appelée** dans `properties.service.ts:createProperty()`. Un user en plan FREE peut créer des propriétés illimitées.

---

### BUG-6 : Adminer manquant du docker-compose — DOCS 🟡

**Fichier :** `docker-compose.yml`

Le `QUICKSTART.md` documente Adminer sur `:8080` mais il n'est pas dans le `docker-compose.yml`.

---

## 3. Problèmes de qualité (non-bloquants)

### Q-1 : `fs.appendFileSync` dans error handler — BLOCKING I/O

```typescript
// error-handler.middleware.ts:19
fs.appendFileSync('error.log', `\n--- REQUEST ERROR...`)
```

Bloque l'event loop à chaque erreur. Devrait utiliser pino (déjà installé).

### Q-2 : `import { z } from 'zod'` au lieu de `'zod/v4'`

**Fichier :** `auth.controller.ts:2` — Utilise l'ancien import Zod.

### Q-3 : Semicolons défensifs partout

```typescript
; (req as unknown as AuthenticatedRequest).user = { ... }
```

Fonctionne mais non-standard. Vient d'un problème d'ASI (Automatic Semicolon Insertion).

### Q-4 : `console.error` au lieu de `logger`

Dans `auth.controller.ts:40`, `task-auto-generator.service.ts:113`, `reservation-cascade.service.ts:158-164`, `notification-dispatcher.ts` (5+ occurrences). Le logger pino est installé mais pas utilisé partout.

### Q-5 : Duplication code proxy vs transition

`proxyTransitionTask` (100 lignes) duplique ~80% de `transitionTask` (95 lignes). Devrait être factorisé.

### Q-6 : `reauthMiddleware` — estimation grossière

Calcule l'heure de création de session en soustrayant 7 jours de `expiresAt`. Fragile et incorrecte si la durée de session change.

### Q-7 : Prisma generator name

Schema dit `prisma-client-js` — devrait être `prisma-client` pour Prisma 7.

### Q-8 : `@/*` path alias dans tsconfig mais jamais utilisé

Tous les imports sont relatifs (`../../config/...`). L'alias est mort.

---

## 4. Évaluation module par module

| Module | Fichiers | Architecture | Bugs critiques | Qualité code | Verdict |
|---|---|---|---|---|---|
| **config/** | 8 | ✅ | BUG-1 (RLS) | ⚠️ Q-1 | Refactorer |
| **common/errors/** | 7 | ✅ | — | ✅ | Garder |
| **common/middleware/** | 11 | ✅ | — | ⚠️ Q-3,Q-6 | Nettoyer |
| **common/events/** | 2 | ✅ | — | ✅ | Garder |
| **common/types/** | 2 | ✅ | — | ✅ | Garder |
| **auth** | 7 | ✅ | BUG-3 (seed) | ⚠️ Q-2,Q-4 | Refactorer |
| **properties** | 5 | ✅ | BUG-1,5 | ✅ | Refactorer services |
| **reservations** | 8 | ✅ | BUG-1 | ✅ | Refactorer services |
| **ical** | 4 | ✅ | BUG-1 | ✅ | Refactorer services |
| **tasks** | 19 | ✅✅ | BUG-1 | ⚠️ Q-5 | Refactorer services |
| **notifications** | 9 | ✅ | BUG-1,2 | ⚠️ Q-4 | Refactorer |
| **calendar** | 4 | ✅ | BUG-1 | ✅ | Refactorer services |
| **inventory** | 6 | ✅ | BUG-1 | ✅ | Refactorer services |
| **dashboard** | 4 | ✅ | BUG-1 | ✅ | Refactorer services |
| **billing** | 4 | ✅ | BUG-5 | ✅ | Refactorer services |
| **workers/** | 3 | ✅ | — | ✅ | Garder |
| **openapi.yaml** | 1 | ⚠️ | BUG-4 | 🔴 Incomplet | Réécrire |

---

## 5. VERDICT FINAL

### L'architecture est bonne. L'implémentation a trop de bugs critiques.

Le BUG-1 (RLS non utilisé) à lui seul nécessite de **modifier la signature de CHAQUE fonction de CHAQUE service** pour passer le `db` tenant-scoped. C'est un refactoring massif qui touche tous les modules et tous les tests.

Combiné avec BUG-2 (notifications cassées), BUG-3 (seed cassé), BUG-4 (OpenAPI incomplet causant des 500), et BUG-5 (business logic manquante), le coût de fix-in-place est **comparable au coût d'un restart propre**.

### Recommandation : RESTART BACKEND avec récupération sélective

#### À GARDER tel quel (copier dans le nouveau projet) :
- `prisma/schema.prisma` — parfait, ne pas toucher
- `prisma/migrations/` — historique valide
- `docker-compose.yml` — ajouter Adminer
- `Dockerfile` + `Dockerfile.dev` — fonctionnels
- `package.json` — stack correcte
- `tsconfig.json` — config valide
- `.env` / `.env.example`
- `docker/init-db.sql`
- `prisma.config.ts`

#### À RÉÉCRIRE proprement (en suivant les stories) :
- `src/` complet — en utilisant l'architecture existante comme RÉFÉRENCE
- `openapi.yaml` — complet et correct dès le départ
- `prisma/seed.ts` — compatible Better Auth

#### Changements clés dans la réécriture :
1. **Tous les services reçoivent `db` en paramètre** (pas `import { prisma }`)
2. **OpenAPI contract-first** : spec complète AVANT le code
3. **Seed via Better Auth API** (pas de hash custom)
4. **pino partout** (pas de `console.error`)
5. **Zod v4** (`from 'zod/v4'`) partout
6. **Property limit enforced** dans le flow de création
7. **Tests par module** avec vrais appels API (supertest)

### Estimation restart backend : ~2 semaines

L'architecture existante sert de blueprint. On ne repart pas de zéro conceptuellement — on réimplémente proprement story par story en suivant les docs `docs/planning/`.

---

*Audit réalisé le 9 février 2026.*
