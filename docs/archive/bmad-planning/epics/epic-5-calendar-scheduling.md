# Epic 5: Calendar & Scheduling

Users can visualize all operations across time with 4 calendar views (global, by property, by employee, by task type) with intuitive color-coding and day/week/month navigation.

**FRs covered:** FR36, FR37, FR38, FR39, FR40, FR41

**NFRs addressed:** NFR1 (< 200ms interaction feedback), NFR3 (< 800ms analytics queries)

**Technical scope:**

- Global calendar (all properties, all task types)
- Property calendar (single property filter)
- Employee calendar (single staff member filter)
- Type-filtered calendar (cleaning, maintenance, inspection, check-in/out)
- Day/week/month navigation with PillToggle
- Visual encoding (color-coded by task type + property color)
- Distinct treatment for pending-validation vs confirmed tasks
- TimelineItem component (chronological day view)
- Calendar interactions (tap → detail sheet)

**Dependencies:** Epic 2 (reservations) + Epic 3 (tasks)

## Stories

- [Story 5.1: Global Calendar View](../stories/story-5.1-global-calendar-view.md)
- [Story 5.2: Property Calendar & Employee Calendar](../stories/story-5.2-property-employee-calendar.md)
- [Story 5.3: Type-Filtered Calendar & Visual Encoding](../stories/story-5.3-type-filter-visual-encoding.md)
