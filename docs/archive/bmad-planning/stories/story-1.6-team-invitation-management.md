# Story 1.6: Team Member Invitation & Management

## Epic: 1 - Foundation & Secure Access

As an **owner or admin**,
I want to invite team members, assign them roles, and manage the team roster,
So that my organization has the right people with the right access to operate efficiently.

## Requirements Covered

- FR2: RBAC role assignment during invitation
- FR6: Staff Autonomous with account
- FR7: Staff Managed without account (proxy representation)

## Acceptance Criteria

**Given** I am an Owner or Admin
**When** I navigate to Team Management
**Then** I see a list of all team members with their name, email, role, and status (active, pending invite)

**Given** I click "Invite Member"
**When** I fill in name, email, and select a role (Admin, Manager, Staff Autonomous)
**Then** an invitation email is sent via Brevo SMTP
**And** the invitee appears in the team list with status "Pending"
**And** the invitation contains a secure, time-limited link (48h expiry)

**Given** I receive an invitation email
**When** I click the invitation link within 48 hours
**Then** I am directed to a registration page pre-filled with my email
**And** I set my password and complete my profile
**And** I am added to the organization with the assigned role

**Given** I click an expired invitation link
**When** the server validates the token
**Then** I see a user-friendly message "This invitation has expired"
**And** the admin can resend the invitation

**Given** I want to add a Staff Managed member
**When** I click "Add Staff Managed" and enter their name
**Then** a team member profile is created without email or password
**And** they appear in the team list with role "Staff Managed"
**And** they are available for task assignment

**Given** I want to change a team member's role
**When** I select a new role from the dropdown
**Then** the role is updated immediately
**And** the user's permissions change on their next request
**And** role changes are logged in the audit trail

**Given** I want to remove a team member
**When** I click "Remove" and confirm the action
**Then** the member is soft-deleted (deactivated, not destroyed)
**And** their historical data (completed tasks, logs) is preserved
**And** they can no longer access the platform

**Given** I am a Manager
**When** I access Team Management
**Then** I can only see team members assigned to my properties
**And** I cannot invite new members or change roles

## Technical Notes

- API endpoints:
  - `GET /api/v1/team` — list members (filtered by role permissions)
  - `POST /api/v1/team/invite` — send invitation
  - `POST /api/v1/team/accept-invite` — accept invitation with token
  - `POST /api/v1/team/staff-managed` — create Staff Managed profile
  - `PATCH /api/v1/team/:id/role` — update role
  - `DELETE /api/v1/team/:id` — soft-delete member
- Email: Nodemailer + Brevo SMTP (300/day free tier)
- Invitation token: jose signed JWT with 48h TTL
- Audit log: `team_audit_log` table (actor_id, target_id, action, timestamp)
