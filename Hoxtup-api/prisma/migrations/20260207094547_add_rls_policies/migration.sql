-- Enable Row-Level Security on tenant-scoped tables
-- Note: We do NOT use FORCE ROW LEVEL SECURITY so the table owner (Prisma connection user)
-- can bypass RLS for migrations, seeds, and admin operations.
-- RLS is enforced when app.tenant_id is set via set_config in application code.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy for users table
CREATE POLICY tenant_isolation_users ON users
  USING (organization_id::text = current_setting('app.tenant_id', TRUE));

-- Tenant isolation policy for organizations table
CREATE POLICY tenant_isolation_orgs ON organizations
  USING (id::text = current_setting('app.tenant_id', TRUE));