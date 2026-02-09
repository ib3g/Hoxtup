# Story 4.3: Email Notification Engine

## Epic: 4 - Notifications & Alerts

As an **owner or admin**,
I want to receive email alerts for critical events,
So that I'm informed even when I'm not actively using the app.

## Requirements Covered

- FR43: Email notifications (configurable email alerts for critical events)

## Acceptance Criteria

**Given** a critical event occurs (incident reported, iCal sync failure 6h+, stock below threshold)
**When** the notification worker processes the event
**Then** an email is sent to the relevant users via Brevo SMTP
**And** the email uses a branded HTML template with Hoxtup logo and Palette C colors

**Given** an email notification is sent
**When** the recipient opens the email
**Then** they see: event title, brief description, action button linking to the app
**And** the email is in the recipient's preferred language (FR by default)
**And** the email footer contains unsubscribe link for that notification type

**Given** the email template system
**When** emails are generated
**Then** all text uses the i18n translation key system
**And** templates are stored as server-side rendered HTML with dynamic variables

**Given** the Brevo SMTP free tier limit (300 emails/day)
**When** the daily limit approaches
**Then** a warning is logged
**And** emails are prioritized: incidents > stock alerts > sync failures > task assignments

**Given** an email fails to send
**When** the SMTP returns an error
**Then** the BullMQ job retries 3 times with exponential backoff
**And** the failure is logged with recipient, template, and error details

**Given** the email system
**When** a notification is sent both in-app and via email
**Then** both channels are handled independently
**And** the in-app notification is created regardless of email delivery status

## Technical Notes

- Nodemailer + Brevo SMTP transport
- BullMQ queue: `emails` (separate from notifications queue for independent scaling)
- Email templates: `Hoxtup-api/src/templates/email/{lang}/{template}.html`
- Template engine: simple variable replacement `{{variable}}`
- Templates: `incident-reported`, `sync-failure`, `stock-alert`, `task-assigned`, `welcome`, `invite`
- Rate limiting: track daily email count in Redis, prioritize by severity
- Brevo SMTP credentials via environment variables (never hardcoded)
