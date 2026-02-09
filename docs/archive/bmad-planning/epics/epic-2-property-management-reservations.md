# Epic 2: Property Management & Reservations

Users can create and manage their rental properties, connect them to Airbnb/Booking.com via iCal feeds, and see all reservations synchronized automatically with status indicators.

**FRs covered:** FR9, FR10, FR11, FR12, FR13, FR14, FR32, FR33, FR34, FR35

**NFRs addressed:** NFR4 (iCal sync performance), NFR2 (page load < 2s), NFR15 (daily backups)

**Technical scope:**

- Property CRUD with profile page (photo, address, capacity, type)
- Property archival (soft-delete preserving financial history)
- iCal source management (multiple sources per property)
- iCal polling worker (BullMQ recurring job, 15-30 min configurable)
- Reservation model (auto-created from iCal + manual creation)
- Dynamic task update logic (iCal changes → linked task updates)
- Sync status indicator + failure alerting (6h threshold)
- PropertySelector + PropertyColorDot components

**Dependencies:** Epic 1 (auth, org, RBAC)

## Stories

- [Story 2.1: Property CRUD & Profile](../stories/story-2.1-property-crud-profile.md)
- [Story 2.2: Property Archival & Soft Delete](../stories/story-2.2-property-archival.md)
- [Story 2.3: iCal Source Management](../stories/story-2.3-ical-source-management.md)
- [Story 2.4: iCal Sync Engine](../stories/story-2.4-ical-sync-engine.md)
- [Story 2.5: Manual Reservation Creation](../stories/story-2.5-manual-reservation-creation.md)
- [Story 2.6: Dynamic Reservation Updates & Task Linking](../stories/story-2.6-dynamic-reservation-updates.md)
