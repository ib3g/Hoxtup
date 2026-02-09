-- Create test database for vitest (separate from dev)
CREATE DATABASE hoxtup_test OWNER hoxtup;

\c hoxtup_test

-- Create app_user role grants on test DB
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
