# Story 4.2: In-App Notification Feed & Badge

## Epic: 4 - Notifications & Alerts

As a **user**,
I want to see a real-time notification feed with unread count,
So that I'm always aware of important events without leaving my current screen.

## Requirements Covered

- FR42: In-app notifications (real-time feed, badge count for unread)

## Acceptance Criteria

**Given** I am logged in
**When** I tap the notification bell icon in the header
**Then** a notification feed opens (sheet on mobile, popover on desktop)
**And** notifications are listed in reverse chronological order
**And** unread notifications have a distinct visual treatment (bold title, teal dot)

**Given** new notifications arrive
**When** I am on any screen
**Then** the NotificationBadge on the bell icon updates with the unread count
**And** the badge animates on increment (scale bounce)
**And** the badge uses contextual colors: red for incidents/alerts, amber for pending, teal for info

**Given** I tap on a notification
**When** it has a deep link
**Then** I am navigated to the relevant screen (task detail, incident, property)
**And** the notification is marked as read

**Given** I want to mark all notifications as read
**When** I tap "Mark all as read"
**Then** all unread notifications are updated to read
**And** the badge count resets to 0

**Given** the notification feed
**When** I scroll down
**Then** older notifications load via infinite scroll (paginated)
**And** skeleton loading is used during fetch

**Given** the BottomNavBar
**When** there are unread notifications
**Then** the relevant tab (Home for admin, Tasks for staff) shows a notification dot
**And** the dot disappears when notifications are read

**Given** the notification feed on mobile
**When** I view it
**Then** it opens as a full-height sheet (85% viewport max)
**And** dismisses with swipe-down

## Technical Notes

- API endpoints:
  - `GET /api/v1/notifications` — paginated feed (cursor-based)
  - `GET /api/v1/notifications/unread-count` — badge count
  - `PATCH /api/v1/notifications/:id/read` — mark single as read
  - `PATCH /api/v1/notifications/read-all` — mark all as read
- Real-time: polling every 30s (MVP) — WebSocket upgrade in future
- NotificationBadge component: 3 variants (numeric count, dot-only, hidden)
- Feed pagination: cursor-based using `created_at` for consistent ordering
- TanStack Query: `useQuery` with 30s refetch interval for unread count
