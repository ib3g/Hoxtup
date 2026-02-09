# Story 2.1: Property CRUD & Profile

## Epic: 2 - Property Management & Reservations

As an **owner or admin**,
I want to create, view, update, and manage my rental properties with detailed profiles,
So that I can organize my portfolio and have all property information in one place.

## Requirements Covered

- FR32: Property CRUD (create, view, update, archive)
- FR33: Property profile (photo, address, capacity, linked iCal, assigned staff, active reservations)

## Acceptance Criteria

**Given** I am an Owner or Admin
**When** I navigate to Properties
**Then** I see a list of all my organization's properties with name, address, property color dot, and active reservation count

**Given** I click "Create Property"
**When** I fill in required fields (name, address, capacity, property type) and optional fields (photo, notes)
**Then** the property is created with an auto-assigned color from the 8-color property palette
**And** I am redirected to the property profile page

**Given** I submit a property with missing required fields
**When** the form validates
**Then** inline error messages appear below the invalid fields in red `#C45B4A`
**And** the submit button remains disabled until all required fields are valid

**Given** I view a property profile
**When** the page loads
**Then** I see: photo (or placeholder), name, address, capacity, property type, color dot
**And** I see linked iCal sources with sync status
**And** I see assigned staff members with roles
**And** I see active reservations count with next check-in/check-out dates

**Given** I click "Edit" on a property
**When** I modify fields and save
**Then** the property is updated immediately (optimistic UI)
**And** a success toast appears with "Annuler" undo option (5s)

**Given** I am a Manager
**When** I access Properties
**Then** I see only properties assigned to me
**And** I can view and edit them but not create new ones or archive

**Given** the property list on mobile
**When** I view properties
**Then** each property shows as a card with PropertyColorDot + name + address + reservation count
**And** cards are full-width, single column layout

**Given** the PropertyColorDot component
**When** a property is created
**Then** it receives an auto-assigned color from 8 distinctive colors
**And** this color is used consistently across calendar, tasks, and property list

## Technical Notes

- API endpoints:
  - `GET /api/v1/properties` — list (paginated, filtered by role scope)
  - `POST /api/v1/properties` — create
  - `GET /api/v1/properties/:id` — profile detail
  - `PATCH /api/v1/properties/:id` — update
- Prisma model: `Property` with `organization_id`, `name`, `address`, `capacity`, `type`, `color_index`, `photo_url`, `archived_at`
- Property types enum: `APARTMENT`, `HOUSE`, `VILLA`, `STUDIO`, `ROOM`, `OTHER`
- Photo upload: multipart/form-data → store on VPS local filesystem (MVP)
- PropertySelector component: dropdown with color dot + name, multi-select support
- PropertyColorDot: 3 sizes (6px inline, 10px cards, 16px selectors)
