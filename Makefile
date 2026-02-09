# ──────────────────────────────────────────────
# Hoxtup — Development Makefile
# ──────────────────────────────────────────────

.PHONY: help api-check app-build app-dev docker-up docker-down commit api-lint app-lint

# Default
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Backend ──────────────────────────────────

api-check: ## Backend typecheck (tsc --noEmit)
	cd Hoxtup-api && pnpm typecheck

api-lint: ## Backend lint
	cd Hoxtup-api && pnpm lint

# ── Frontend ─────────────────────────────────

app-build: ## Frontend production build
	cd Hoxtup-app && pnpm build

app-dev: ## Frontend dev server (turbopack)
	cd Hoxtup-app && pnpm dev

app-lint: ## Frontend lint
	cd Hoxtup-app && pnpm lint

# ── Combined ─────────────────────────────────

check: api-check app-build ## Backend typecheck + Frontend build
	@echo "✅ All checks passed"

lint: api-lint app-lint ## Lint both projects

# ── Docker ───────────────────────────────────

docker-up: ## Start all Docker services
	docker compose up -d

docker-down: ## Stop all Docker services
	docker compose down

docker-logs: ## Tail API container logs
	docker compose logs -f api

docker-rebuild: ## Rebuild and restart API container
	docker compose up -d --build api

# ── Git ──────────────────────────────────────

status: ## Git status
	git status --short

# ── Prisma ───────────────────────────────────

db-migrate: ## Run Prisma migrations
	cd Hoxtup-api && pnpm prisma migrate dev

db-studio: ## Open Prisma Studio
	cd Hoxtup-api && pnpm prisma studio

db-generate: ## Regenerate Prisma client
	cd Hoxtup-api && pnpm prisma generate
