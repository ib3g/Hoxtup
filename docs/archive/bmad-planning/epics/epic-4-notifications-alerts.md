# Epic 4: Notifications & Alerts

Users are always informed when something important happens — task assignments, stock alerts, incidents, sync failures — through in-app and email notifications with per-user channel preferences.

**FRs covered:** FR42, FR43, FR44, FR45

**NFRs addressed:** NFR16 (BullMQ retry + durability), NFR14 (99.5% uptime for notification delivery)

**Technical scope:**

- EventEmitter → BullMQ notification worker pipeline
- In-app notification feed (real-time, unread badge count)
- Email notifications via Nodemailer + Brevo SMTP
- 7+ notification triggers (new reservation, task assigned, task overdue, task completed, incident reported, stock below threshold, iCal sync failure)
- Per-user notification preferences (enable/disable per type per channel)
- NotificationBadge component (red alerts, amber pending, teal info)
- Push notification deep-linking to relevant screens

**Dependencies:** Epic 1 (auth, users). Enhanced by Epic 2 (reservation events), Epic 3 (task events)

## Stories

- [Story 4.1: Notification Infrastructure & Event Pipeline](../stories/story-4.1-notification-infrastructure.md)
- [Story 4.2: In-App Notification Feed & Badge](../stories/story-4.2-in-app-notification-feed.md)
- [Story 4.3: Email Notification Engine](../stories/story-4.3-email-notification-engine.md)
- [Story 4.4: Notification Trigger Configuration](../stories/story-4.4-notification-triggers.md)
- [Story 4.5: User Notification Preferences](../stories/story-4.5-notification-preferences.md)
