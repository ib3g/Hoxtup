# Epic 1: Foundation & Secure Access

Users can register, create their organization, invite team members with proper roles, and securely access the platform — in their language and currency.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR52, FR53, FR54, FR55, FR56, FR57

**NFRs addressed:** NFR5 (RLS multi-tenant), NFR6 (JWT auth), NFR7 (TLS + AES-256), NFR9 (GDPR), NFR10 (owner safeguards), NFR11 (100 users), NFR12 (10x growth path), NFR13 (i18n + multi-currency), NFR17 (WCAG AA), NFR18 (field usability), NFR19 (48px touch targets), NFR20 (rem typography)

**Technical scope:**

- Project scaffolding (polyrepo: Hoxtup-api + Hoxtup-app, Docker Compose, CI/CD)
- Database schema + Prisma 7 + RLS policies
- JWT auth (jose + argon2, HttpOnly cookies, refresh rotation)
- RBAC engine (5 roles with permission matrix)
- i18n infrastructure (react-i18next, JSON namespaces, French)
- Multi-currency infrastructure (EUR + MAD, integer centimes)
- App Shell (layout, BottomNavBar, DashboardHeader skeleton)
- Design system (Tailwind v4, shadcn/ui, Palette C tokens, Outfit + Inter fonts)
- OpenAPI 3.1 contract + express-openapi-validator
- Error handling (RFC 7807) + structured logging (pino)

**Dependencies:** None — foundation epic

## Stories

- [Story 1.1: Project Scaffolding & Dev Environment](../stories/story-1.1-project-scaffolding.md)
- [Story 1.2: Database Schema & Multi-Tenant Foundation](../stories/story-1.2-database-multi-tenant.md)
- [Story 1.3: User Registration & Organization Creation](../stories/story-1.3-registration-org-creation.md)
- [Story 1.4: User Login, Logout & Token Refresh](../stories/story-1.4-auth-login-logout-refresh.md)
- [Story 1.5: RBAC Engine & Permission Matrix](../stories/story-1.5-rbac-permission-matrix.md)
- [Story 1.6: Team Member Invitation & Management](../stories/story-1.6-team-invitation-management.md)
- [Story 1.7: Internationalization & Multi-Currency](../stories/story-1.7-i18n-multi-currency.md)
- [Story 1.8: App Shell, Design System & Responsive Layout](../stories/story-1.8-app-shell-design-system.md)
