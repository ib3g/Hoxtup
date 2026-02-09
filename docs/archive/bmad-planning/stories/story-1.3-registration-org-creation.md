# Story 1.3: User Registration & Organization Creation

## Epic: 1 - Foundation & Secure Access

As a **property manager**,
I want to register with my email and create my organization in one flow,
So that I can start setting up my rental management workspace immediately.

## Requirements Covered

- FR1: Multi-tenant self-service registration creating unique Organization ID
- FR8: Secure JWT authentication (partial — registration flow)

## Acceptance Criteria

**Given** I am on the registration page
**When** I submit valid registration data (first name, last name, email, password, organization name)
**Then** a new Organization is created with a unique ID
**And** my user account is created with the Owner role
**And** I receive a JWT access token (15min) and a refresh token (7d HttpOnly cookie)
**And** I am redirected to the onboarding flow

**Given** I submit a registration with an email that already exists
**When** the server processes the request
**Then** I receive a 409 Conflict error with a user-friendly message
**And** no duplicate organization or user is created

**Given** I submit a registration with a weak password
**When** the server validates the input
**Then** I receive a 422 Validation Error with specific password requirements
**And** password must be minimum 8 characters with at least 1 uppercase, 1 lowercase, and 1 number

**Given** the registration is successful
**When** the system creates the user
**Then** the password is hashed with argon2 (never stored in plaintext)
**And** the JWT is signed with jose library
**And** the refresh token is set as HttpOnly, Secure, SameSite=Lax cookie on `.hoxtup.com`

**Given** the registration page on mobile
**When** I view the form
**Then** it follows mobile-first design with one field per row
**And** the submit button is sticky (visible above keyboard)
**And** the form auto-focuses the first empty field
**And** keyboard types match inputs (email keyboard for email field)

**Given** I am on the registration page
**When** I submit the form
**Then** I see immediate visual feedback (< 200ms) with skeleton loading
**And** no spinner is used

## Technical Notes

- API: `POST /api/v1/auth/register` — body: `{ firstName, lastName, email, password, organizationName }`
- Response: `{ user: { id, firstName, lastName, email, role }, organization: { id, name }, accessToken }`
- Set-Cookie header for refresh token
- Zod validation on request body
- All text via translation keys (react-i18next), zero hardcoded strings
- Frontend: Next.js registration page with React Hook Form + Zod client validation
