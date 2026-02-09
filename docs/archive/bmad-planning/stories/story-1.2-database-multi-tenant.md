# Story 1.2: Database Schema & Multi-Tenant Foundation

## Epic: 1 - Foundation & Secure Access

As a **platform operator**,
I want tenant-isolated data storage with Row-Level Security,
So that each organization's data is securely separated and no cross-tenant data leakage is possible.

## Requirements Covered

- NFR5: Multi-tenant isolation via PostgreSQL RLS
- NFR7: Data protection (AES-256 at rest)
- NFR15: Daily automated backups with 30-day retention
- Architecture: Prisma 7 + RLS via `$extends`

## Acceptance Criteria

**Given** the Hoxtup-api project
**When** I run `npx prisma migrate dev`
**Then** the database creates `Organization`, `User`, and `Role` tables with proper relationships
**And** all tables include `organization_id` as tenant discriminator column
**And** `created_at` and `updated_at` timestamps are present on all tables

**Given** the Prisma client
**When** it is instantiated with `$extends` for RLS
**Then** all queries automatically filter by the current tenant's `organization_id`
**And** no query can access data from another organization without explicit bypass

**Given** a Row-Level Security policy on the `Organization` table
**When** a database query is executed
**Then** PostgreSQL enforces tenant isolation at the database level
**And** even raw SQL queries respect RLS policies

**Given** the database configuration
**When** I inspect the connection
**Then** TLS is enforced for all database connections
**And** connection pooling is configured via Prisma

**Given** the seed script
**When** I run `npx prisma db seed`
**Then** a test organization with Owner, Admin, Manager, and Staff users is created
**And** seed data is idempotent (running twice does not duplicate)

## Technical Notes

- Prisma 7 (Rust-free) with `$extends` for RLS enforcement
- Money columns: integer type (centimes), never float
- Currency column: string (ISO 4217 code) per organization
- All IDs: UUID v7 (time-sortable)
- snake_case for all DB column names
- Indexes on `organization_id` for every tenant-scoped table
