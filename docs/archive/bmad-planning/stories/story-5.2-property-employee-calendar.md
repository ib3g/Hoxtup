# Story 5.2: Property Calendar & Employee Calendar

## Epic: 5 - Calendar & Scheduling

As an **owner, admin, or manager**,
I want to filter the calendar by a single property or a single staff member,
So that I can focus on one property's schedule or one team member's workload.

## Requirements Covered

- FR37: Property calendar (single property filter)
- FR38: Employee calendar (single staff filter)

## Acceptance Criteria

**Given** I am on the global calendar view
**When** I select a property from the PropertySelector
**Then** the calendar filters to show only events for that property
**And** the property name and color dot appear in the calendar header
**And** I can clear the filter to return to the global view

**Given** I select multiple properties in the PropertySelector
**When** the calendar updates
**Then** only events from the selected properties are shown
**And** active filters appear as removable badges below the filter bar

**Given** I navigate to a property's profile page
**When** I click "Calendar"
**Then** the calendar opens pre-filtered to that property

**Given** I am on the global calendar
**When** I select a staff member from the team filter
**Then** the calendar filters to show only tasks assigned to that person
**And** the staff member's name appears in the calendar header
**And** reservations for their assigned properties are still visible

**Given** I navigate to a team member's profile
**When** I click "Calendar"
**Then** the calendar opens pre-filtered to that staff member's tasks

**Given** I am a Manager
**When** I use the property filter
**Then** I only see properties assigned to me in the PropertySelector
**And** I only see staff assigned to my properties in the team filter

**Given** I am a Staff Autonomous user
**When** I access the calendar
**Then** it is automatically filtered to my tasks only
**And** no property or team filter is available

**Given** filters are applied
**When** I navigate between day/week/month views
**Then** the filters persist across view changes
**And** filters reset when I leave the calendar screen

## Technical Notes

- API: same calendar endpoint with query params `?propertyId=X&userId=Y`
- PropertySelector: multi-select dropdown with color dots (from Story 2.1)
- Team filter: dropdown with user avatars/names
- URL params: `?property=uuid&user=uuid` for deep linking
- Manager scope: API enforces property/user filtering based on RBAC
- Staff scope: API auto-filters to `assigned_user_id = current_user`
