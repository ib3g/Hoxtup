# Story 1.5: RBAC Engine & Permission Matrix

## Epic: 1 - Foundation & Secure Access

As an **organization owner**,
I want a role-based access control system with 5 distinct roles and granular permissions,
So that each team member has exactly the right level of access to features and data.

## Requirements Covered

- FR2: RBAC with 5 roles (Owner, Admin, Manager, Staff Autonomous, Staff Managed)
- FR3: Owner exclusive rights (delete org, transfer ownership)
- FR4: Admin full operational access (no delete org/transfer)
- FR5: Manager scoped access for assigned properties
- FR6: Staff Autonomous mobile-optimized task access
- FR7: Staff Managed proxy representation (no app access)

## Acceptance Criteria

**Given** the permission system is configured
**When** a request is made to any protected endpoint
**Then** the RBAC middleware checks the user's role against the required permission
**And** returns 403 Forbidden if the user lacks the required permission

**Given** a user with the Owner role
**When** they access organization management features
**Then** they can delete the organization, transfer ownership, and manage all settings
**And** destructive operations (delete org, transfer) require re-authentication

**Given** a user with the Admin role
**When** they access the platform
**Then** they can manage properties, staff, tasks, analytics, and billing
**And** they cannot delete the organization or transfer ownership

**Given** a user with the Manager role
**When** they access the platform
**Then** they can only manage properties and staff assigned to them
**And** they can validate tasks and view costs for their assigned properties
**And** they cannot access billing or organization-wide settings

**Given** a user with the Staff Autonomous role
**When** they access the platform
**Then** they see only their assigned tasks in a mobile-optimized view
**And** they can update task status and report incidents
**And** they cannot access properties, team management, or analytics

**Given** a Staff Managed profile
**When** it exists in the system
**Then** it has no login credentials and no app access
**And** it is represented as a team member for task assignment purposes
**And** only Owner/Admin/Manager can manage tasks on their behalf

**Given** the permission matrix
**When** I inspect the role definitions
**Then** each role has explicit allow/deny for every resource and action
**And** permissions are stored in code (not DB) for performance and auditability

## Technical Notes

- Permission middleware: `requirePermission('resource:action')` pattern
- Roles defined as enum: `OWNER`, `ADMIN`, `MANAGER`, `STAFF_AUTONOMOUS`, `STAFF_MANAGED`
- Permission matrix: static map of role → allowed permissions
- Manager scope: filtered by `property_assignments` join table
- Staff Managed: `User` record with `has_account: false`, no `password_hash`
- Owner-only operations: `requireRole('OWNER')` + re-auth middleware
