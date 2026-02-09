# Story 7.4: Role Switcher Mode Toggle

## Epic: 7 - Dashboard & Operational Intelligence

As an **owner, admin, or manager**,
I want to switch between Manager Mode (executive dashboard, analytics, assignment) and Field Mode (task list, quick actions),
So that I can use the right interface for my current context — planning at the office or working in the field.

## Requirements Covered

- FR49: Role switcher mode toggle (Manager Mode ↔ Field Mode)
- FR50: Persistent mode preference per session
- FR51: Role switcher access control (Owner/Admin/Manager only; Staff sees Field Mode only)

## Acceptance Criteria

**Given** I am an Owner, Admin, or Manager
**When** I view the app header or settings
**Then** I see a mode toggle switch: "Manager" ↔ "Terrain"
**And** the current mode is visually indicated

**Given** I switch to Manager Mode
**When** the toggle activates
**Then** the dashboard changes to the Executive Dashboard (Story 7.1)
**And** the BottomNavBar shows 4 tabs: Home, Calendar, Team, More
**And** the interface emphasizes analytics, assignment, and overview features

**Given** I switch to Field Mode
**When** the toggle activates
**Then** the dashboard changes to the Field Staff Dashboard (Story 7.2)
**And** the BottomNavBar shows 3 tabs: Tasks, Planning, Incident
**And** the interface emphasizes task execution and quick actions

**Given** I select a mode
**When** I close and reopen the app (within the same session)
**Then** the last selected mode is restored automatically
**And** the preference is stored client-side (Zustand persisted store)

**Given** I log out and log back in
**When** the session starts
**Then** the mode defaults to my role-appropriate mode:
- Owner/Admin: Manager Mode
- Manager: Manager Mode
- Staff: Field Mode (no toggle)

**Given** I am a Staff Autonomous user
**When** I access the app
**Then** no mode toggle is visible
**And** I always see Field Mode

**Given** the mode toggle on mobile
**When** I tap it
**Then** the mode switches with a crossfade transition (150ms)
**And** the navigation bar updates immediately

**Given** the Adaptive Focus Mode UX principle
**When** the mode is active
**Then** the navigation, content, and available actions all adapt to the selected context
**And** there is no "hybrid" state — each mode is a complete, coherent experience

## Technical Notes

- Client-side state: Zustand store with `persist` middleware (localStorage)
- Mode enum: `MANAGER`, `FIELD`
- Default by role: `OWNER` → MANAGER, `ADMIN` → MANAGER, `MANAGER` → MANAGER, `STAFF_AUTONOMOUS` → FIELD
- Toggle component: custom segmented control using shadcn/ui Tabs primitives
- Navigation swap: conditional rendering of BottomNavBar variant based on mode
- Dashboard swap: conditional rendering of Executive vs Field dashboard
- Access control: toggle hidden for STAFF roles (frontend) + API returns only mode-appropriate data
- No API call on toggle — purely client-side UI switch; data fetched via respective dashboard endpoints
