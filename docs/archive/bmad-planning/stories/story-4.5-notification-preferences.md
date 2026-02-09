# Story 4.5: User Notification Preferences

## Epic: 4 - Notifications & Alerts

As a **user**,
I want to control which notifications I receive and through which channels,
So that I'm informed about what matters to me without being overwhelmed.

## Requirements Covered

- FR45: Notification preferences (enable/disable per notification type per channel per user)

## Acceptance Criteria

**Given** I navigate to Settings → Notifications
**When** the preferences page loads
**Then** I see a matrix of notification types × channels (in-app, email)
**And** each combination has a toggle (enabled/disabled)
**And** defaults are: all in-app enabled, email enabled only for critical events (incidents, sync failures, stock alerts)

**Given** I disable email notifications for "Task Assigned"
**When** a task is assigned to me
**Then** I receive an in-app notification but no email
**And** the preference is persisted across sessions

**Given** I disable in-app notifications for "Task Completed"
**When** a task I created is completed
**Then** no in-app notification is created for me
**And** my unread count is not incremented

**Given** an Owner or Admin
**When** they view notification preferences
**Then** they see all notification types relevant to their role
**And** critical notifications (incidents) cannot be fully disabled — at minimum in-app remains on

**Given** a Staff Autonomous user
**When** they view notification preferences
**Then** they only see notification types relevant to staff (task assigned, task overdue)
**And** they cannot see organizational notifications (sync failure, stock alerts)

**Given** the notification worker processes an event
**When** it determines recipients
**Then** it checks each recipient's preferences before creating the notification
**And** respects both the type preference and channel preference

**Given** a new user joins the organization
**When** their account is created
**Then** default notification preferences are set based on their role
**And** they can customize from Settings

## Technical Notes

- Prisma model: `NotificationPreference` with `user_id`, `notification_type`, `channel` (in_app/email), `enabled`
- API endpoints:
  - `GET /api/v1/notifications/preferences` — get current user's preferences
  - `PATCH /api/v1/notifications/preferences` — bulk update preferences
- Default preferences: seeded on user creation based on role
- Critical notification override: `incident_reported` always creates in-app (configurable email)
- Preference check: performed in notification worker before creating Notification record or queuing email
- Role-based visibility: Staff only sees staff-relevant types in the settings UI
