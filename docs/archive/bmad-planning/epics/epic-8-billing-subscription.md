# Epic 8: Billing & Subscription

Users can subscribe to the right plan for their portfolio size, manage their subscription, and benefit from a 30-day free trial.

**FRs covered:** FR29

**NFRs addressed:** NFR7 (encryption for financial data), NFR9 (GDPR data retention)

**Technical scope:**

- Stripe integration (webhooks, checkout sessions)
- Property-count tiers (Free 0€, Starter 69€, Pro 199€, Scale 399€, Agency custom)
- 30-day free trial with automated transition
- Subscription provisioning worker (BullMQ)
- Grace period (15 days) + data retention policy (6-month archive, permanent deletion)
- Billing settings page (current plan, usage, invoices, upgrade/downgrade)

**Dependencies:** Epic 1 (auth, org) + Epic 2 (property count for tier calculation)

## Stories

- [Story 8.1: Stripe Integration & Subscription Plans](../stories/story-8.1-stripe-subscription-plans.md)
- [Story 8.2: Trial Management & Plan Transitions](../stories/story-8.2-trial-plan-transitions.md)
- [Story 8.3: Billing Settings & Invoice Management](../stories/story-8.3-billing-settings-invoices.md)
