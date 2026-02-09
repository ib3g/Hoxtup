# Story 1.4: User Login, Logout & Token Refresh

## Epic: 1 - Foundation & Secure Access

As a **registered user**,
I want to securely log in, stay authenticated across sessions, and log out,
So that I can access my organization's data without repeated logins and trust my session is secure.

## Requirements Covered

- FR8: Secure authentication with JWT, automatic credential refresh, persistent sessions
- NFR6: JWT with HttpOnly cookies, access 15min + refresh 7d with rotation
- NFR10: Owner safeguards (re-authentication for destructive ops)

## Acceptance Criteria

**Given** I am on the login page with valid credentials
**When** I submit my email and password
**Then** I receive a JWT access token (15min, stored in memory) and refresh token (7d, HttpOnly cookie)
**And** I am redirected to my role-appropriate entry point (Owner/Admin → Dashboard, Staff → Next Task)

**Given** I submit invalid credentials
**When** the server processes the login
**Then** I receive a 401 Unauthorized error with message "Invalid email or password"
**And** no information leaks about whether the email exists
**And** failed attempts are rate-limited (5 attempts per 15 minutes per IP)

**Given** my access token has expired (after 15 minutes)
**When** my frontend makes an API request
**Then** the client automatically calls `POST /api/v1/auth/refresh` with the HttpOnly cookie
**And** a new access token and rotated refresh token are issued
**And** the original request is retried transparently

**Given** my refresh token has expired (after 7 days)
**When** I attempt to refresh
**Then** I am redirected to the login page
**And** all tokens are invalidated

**Given** I click "Logout"
**When** the server processes the request
**Then** the refresh token cookie is cleared
**And** the refresh token is invalidated server-side
**And** I am redirected to the login page

**Given** a refresh token is reused (potential theft)
**When** the server detects token reuse
**Then** all refresh tokens for that user are invalidated (token family rotation)
**And** the user must re-authenticate

**Given** the login page on mobile
**When** I view the form
**Then** it uses the same form patterns as registration (one field per row, sticky submit, auto-focus)
**And** all text uses translation keys

## Technical Notes

- API endpoints:
  - `POST /api/v1/auth/login` — body: `{ email, password }` → response: `{ user, accessToken }` + Set-Cookie
  - `POST /api/v1/auth/refresh` — cookie-based → response: `{ accessToken }` + rotated Set-Cookie
  - `POST /api/v1/auth/logout` — clears cookie + invalidates refresh token
- Access token: jose signed JWT, stored in memory (Zustand store), 15min TTL
- Refresh token: opaque token stored in DB, HttpOnly Secure SameSite=Lax cookie, 7d TTL
- Token family tracking for rotation detection
- Frontend: openapi-fetch interceptor for automatic token refresh on 401
- Rate limiting: express-rate-limit on auth endpoints
