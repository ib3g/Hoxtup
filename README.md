# Hoxtup

Operational management platform for short-term rental properties.

## Architecture

Polyrepo co-located — two independent projects in one repository:

- **Hoxtup-api/** — Express backend (Node.js 22, TypeScript, ESM)
- **Hoxtup-app/** — Next.js 16 frontend (App Router, Turbopack, TypeScript)

## Prerequisites

- [Node.js 22 LTS](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

## Quick Start

### 1. Clone & configure environment

```bash
git clone <repo-url>
cd Hoxtup-project

# Copy environment files
cp .env.example .env
cp Hoxtup-api/.env.example Hoxtup-api/.env
cp Hoxtup-app/.env.example Hoxtup-app/.env.local
```

### 2. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL (port 5432) and Redis (port 6379).

### 3. Start the API

```bash
cd Hoxtup-api
pnpm install
pnpm dev
```

API runs on [http://localhost:8000](http://localhost:8000). Health check: `GET /api/v1/health`

### 4. Start the frontend

```bash
cd Hoxtup-app
pnpm install
pnpm dev
```

App runs on [http://localhost:3000](http://localhost:3000).

### 5. Generate API types (frontend)

```bash
cd Hoxtup-app
pnpm generate:api
```

## Scripts

### Hoxtup-api

| Script | Description |
|:---|:---|
| `pnpm dev` | Start dev server (tsx watch) |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run compiled output |
| `pnpm test` | Run tests (vitest) |
| `pnpm lint` | Lint with ESLint |

### Hoxtup-app

| Script | Description |
|:---|:---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests (vitest) |
| `pnpm lint` | Lint with ESLint |
| `pnpm generate:api` | Generate OpenAPI types |

## Project Structure

```
Hoxtup-project/
├── .github/workflows/      # CI pipelines
├── docker-compose.yml       # PG 16 + Redis 7
├── Hoxtup-api/              # Express backend
│   ├── src/
│   │   ├── app.ts           # Express app + middleware
│   │   ├── server.ts        # HTTP entry point
│   │   ├── config/          # Env validation (Zod)
│   │   ├── common/          # Shared middleware, errors, utils
│   │   └── modules/         # Feature modules
│   └── openapi.yaml         # API contract (source of truth)
└── Hoxtup-app/              # Next.js frontend
    └── src/
        ├── app/             # App Router pages
        ├── components/      # UI components
        ├── lib/             # Utilities, API client
        └── generated/       # OpenAPI types (gitignored)
```

## Naming Conventions

| Element | Convention | Example |
|:---|:---|:---|
| Component files | PascalCase | `TaskCard.tsx` |
| Utility files | kebab-case | `date-utils.ts` |
| Functions | camelCase | `getTasksByProperty()` |
| Types/Interfaces | PascalCase | `Task`, `CreateTaskInput` |
| API endpoints | kebab-case, plural | `/api/v1/task-assignments` |
| JSON fields | camelCase | `{ "firstName": "Barry" }` |
| DB columns | snake_case | `first_name` |

## Branch Protection

Configure on GitHub:
- Require PR reviews before merge
- Require status checks: `API CI`, `App CI`
- Require branches to be up to date before merge
