# Quickstart — Lancer Hoxtup en 5 minutes

## Prérequis

- **Docker** + Docker Compose (seul prérequis pour le backend)
- **Node.js 22 LTS** (via nvm, `.nvmrc` à la racine — uniquement pour le frontend)
- **Git**

## Architecture locale

```text
docker compose up
  ├── postgres    :5433  ← PostgreSQL 16 (données persistantes)
  ├── redis       :6379  ← Redis 7 (BullMQ, rate limiting, cache)
  ├── api         :8000  ← Hoxtup-api (Node.js 22 + Express 5, hot-reload)
  ├── mailhog     :8025  ← Emails capturés (UI web pour voir les mails envoyés)
  └── adminer     :8080  ← Admin DB (interface web PostgreSQL)

Local (hors Docker) :
  └── next-app    :3000  ← Hoxtup-app (Next.js 16, npm run dev)
```

**Tout le backend tourne dans Docker.** Le frontend tourne en local (Next.js hot-reload + Turbopack est plus rapide hors container).

## 1. Cloner et configurer

```bash
git clone <repo-url> && cd Hoxtup-project
```

```bash
# Variables d'environnement
cp .env.example .env
cp Hoxtup-api/.env.example Hoxtup-api/.env
cp Hoxtup-app/.env.example Hoxtup-app/.env.local
```

### Variables backend (`Hoxtup-api/.env`)

| Variable | Valeur dev | Description |
|:---|:---|:---|
| `DATABASE_URL` | `postgresql://hoxtup:hoxtup@postgres:5432/hoxtup` | PG owner (dans Docker = hostname `postgres`, port 5432 interne) |
| `APP_DATABASE_URL` | `postgresql://app_user:app_user@postgres:5432/hoxtup` | PG RLS (dans Docker = hostname `postgres`) |
| `BETTER_AUTH_SECRET` | (générer une string aléatoire 32+ chars) | Secret pour Better Auth |
| `BETTER_AUTH_URL` | `http://localhost:8000` | URL racine du backend (vue depuis le navigateur) |
| `REDIS_URL` | `redis://redis:6379` | Redis (dans Docker = hostname `redis`) |
| `SMTP_HOST` | `mailhog` | Mailhog SMTP (dans Docker = hostname `mailhog`) |
| `SMTP_PORT` | `1025` | Port SMTP Mailhog |

### Variables frontend (`Hoxtup-app/.env.local`)

| Variable | Valeur dev |
|:---|:---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_AUTH_URL` | `http://localhost:8000` |

## 2. Lancer le backend (une seule commande)

```bash
docker compose up -d
```

Cela lance **tout** :

- **PostgreSQL 16** — `localhost:5433` (port externe, 5432 interne)
- **Redis 7** — `localhost:6379`
- **Hoxtup API** — `localhost:8000` (Node.js 22, hot-reload via volume mount)
- **Mailhog** — `localhost:8025` (UI web) + `localhost:1025` (SMTP)
- **Adminer** — `localhost:8080` (connexion : server=`postgres`, user=`hoxtup`, pass=`hoxtup`, db=`hoxtup`)

Le script `docker/init-db.sql` crée automatiquement le rôle `app_user` au premier démarrage.

Les migrations Prisma et le seed s'exécutent automatiquement au démarrage du container API.

## 3. Lancer le frontend

```bash
nvm use 22
cd Hoxtup-app && npm install && npm run dev
# → http://localhost:3000
```

## 4. Vérifier que tout marche

```bash
# Health check API
curl http://localhost:8000/api/v1/health
# → {"status":"ok"}

# Voir les emails envoyés
open http://localhost:8025

# Voir la base de données
open http://localhost:8080

# Tests backend (191 tests) — dans le container
docker compose exec api npx vitest run
```

## 5. Commandes utiles

```bash
# Logs API en temps réel
docker compose logs -f api

# Relancer les migrations manuellement
docker compose exec api npx prisma migrate dev

# Reset complet de la DB (attention : perd les données)
docker compose exec api npx prisma migrate reset --force

# Arrêter tout
docker compose down

# Arrêter + supprimer les volumes (reset total)
docker compose down -v
```

## Points d'attention

- **Port PG externe = 5433** (pour éviter conflit avec PG local), port interne Docker = 5432
- **Dual PG roles** : `hoxtup` (owner, bypasse RLS) pour migrations/seeds, `app_user` (soumis à RLS) pour l'app runtime
- **Better Auth** gère l'auth via `/api/auth/*` (session cookies HttpOnly)
- **Express 5** : catch-all route = `/{*splat}` (pas `/*`)
- **Prisma 7** : generator = `prisma-client`, output dans `src/generated/prisma`
- **Mailhog** capture TOUS les emails en dev — aucun email n'est réellement envoyé
- **Hot-reload** : le code source `Hoxtup-api/src` est monté en volume dans le container, les changements sont détectés automatiquement
