# Story 8.2: Trial Management & Plan Transitions

## Epic: 8 - Billing & Subscription

As an **owner**,
I want a 30-day free trial when I sign up and smooth transitions between plans,
So that I can evaluate the platform before committing and change plans as my needs evolve.

## Requirements Covered

- FR29: Subscription engine (partial — 30-day free trial, grace period, data retention)

## Acceptance Criteria

**Given** a new organization is created
**When** the owner completes registration
**Then** a 30-day free trial is automatically started
**And** the trial includes all Pro plan features (up to 15 properties)
**And** no credit card is required during trial

**Given** my trial has 7 days remaining
**When** I access the app
**Then** a subtle banner appears: "Votre essai gratuit se termine dans 7 jours"
**And** the banner includes a "Choose a plan" CTA

**Given** my trial has 1 day remaining
**When** I access the app
**Then** the banner becomes more prominent (amber background)
**And** the message is: "Votre essai se termine demain — choisissez un plan pour continuer"

**Given** my trial expires without subscribing
**When** I access the app on day 31
**Then** my account enters a 15-day grace period
**And** I can view all my data (read-only) but cannot create or modify records
**And** a blocking modal prompts me to choose a plan

**Given** the grace period expires (day 46)
**When** the system processes the expiry
**Then** my organization enters "archived" state
**And** data is preserved for 6 months (GDPR retention policy)
**And** I can still log in and see a page: "Your data is archived. Subscribe to reactivate."

**Given** I subscribe during the grace period
**When** payment is processed
**Then** my account is fully reactivated immediately
**And** all data and settings are intact

**Given** I subscribe after archival (within 6 months)
**When** payment is processed
**Then** my organization is unarchived and fully restored

**Given** 6 months have passed since archival
**When** the retention policy triggers
**Then** all organization data is permanently deleted (GDPR compliance)
**And** the organization record is anonymized

## Technical Notes

- Trial: `Subscription` created with `status: 'trialing'`, `trial_end: now + 30 days`
- BullMQ scheduled jobs: trial reminders at 7d, 3d, 1d before expiry
- Grace period: `status: 'past_due'`, 15-day window
- Archival: `status: 'archived'`, `archived_at` timestamp
- Permanent deletion: BullMQ job checking `archived_at + 6 months`
- Deletion: cascading soft-delete of all org data, then hard-delete after confirmation
- Read-only mode: middleware checking subscription status, blocking write operations
- Reactivation: update `status` back to `active` on successful payment
