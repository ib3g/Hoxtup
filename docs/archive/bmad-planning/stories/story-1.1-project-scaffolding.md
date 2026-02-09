# Story 1.1: Project Scaffolding & Dev Environment

## Epic: 1 - Foundation & Secure Access

As a **developer**,
I want a properly configured polyrepo with backend and frontend projects, shared tooling, and local dev infrastructure,
So that I can start building features with a consistent, type-safe, production-ready codebase.

## Requirements Covered

- Architecture: Polyrepo co-located structure (Hoxtup-api + Hoxtup-app)
- Architecture: Docker Compose for PostgreSQL + Redis
- Architecture: OpenAPI 3.1 contract-first
- Architecture: GitHub Actions CI/CD skeleton

## Acceptance Criteria

**Given** a fresh clone of the repository
**When** I run `docker compose up -d`
**Then** PostgreSQL (port 5432) and Redis (port 6379) are running and accessible locally

**Given** the Hoxtup-api project
**When** I run `npm run dev` from `Hoxtup-api/`
**Then** an Express server starts on `localhost:8000` with TypeScript strict mode, ESM, and pino structured logging
**And** a health endpoint `GET /api/v1/health` returns `{ status: "ok" }`

**Given** the Hoxtup-app project
**When** I run `npm run dev` from `Hoxtup-app/`
**Then** a Next.js 16 app starts on `localhost:3000` with App Router, Turbopack, and TypeScript strict mode

**Given** the API project
**When** the server starts
**Then** express-openapi-validator loads the `openapi.yaml` contract and validates all requests/responses
**And** RFC 7807 Problem Details error format is used for all error responses

**Given** the repository root
**When** I inspect the project structure
**Then** I see `Hoxtup-api/` and `Hoxtup-app/` as independent projects with separate `package.json`, `tsconfig.json`
**And** shared ESLint + Prettier configs enforce consistent code style
**And** naming conventions are enforced: camelCase (code/JSON), snake_case (DB), kebab-case (URLs), PascalCase (components/types)

**Given** a push to the main branch
**When** GitHub Actions CI runs
**Then** both projects are linted, type-checked, and unit-tested independently
**And** failing checks block merge

## Technical Notes

- Express setup: manual (no generator), Node.js 22 LTS
- Next.js setup: `create-next-app` with App Router, Turbopack, Tailwind v4
- OpenAPI contract: `Hoxtup-api/openapi.yaml` with `/api/v1/health` endpoint defined
- Logging: pino + pino-http for request logging
- Docker Compose: `docker-compose.yml` at repo root with PostgreSQL 16 + Redis 7
- Rate limiting skeleton: express-rate-limit + rate-limit-redis
- CORS whitelist: `app.hoxtup.com` + `localhost:3000` (credentials: true)
