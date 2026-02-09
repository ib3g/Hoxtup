# Story 8.3: Billing Settings & Invoice Management

## Epic: 8 - Billing & Subscription

As an **owner**,
I want to manage my payment method, view invoices, and see my usage relative to my plan,
So that I have full control over my subscription and financial transparency.

## Requirements Covered

- FR29: Subscription engine (partial — billing management, invoices)

## Acceptance Criteria

**Given** I navigate to Settings → Billing
**When** the page loads
**Then** I see: current plan name and tier, monthly cost, next billing date, payment method (brand + last 4 digits), property usage (e.g., "3/5 properties used")

**Given** I want to update my payment method
**When** I click "Update payment method"
**Then** I am redirected to a Stripe Customer Portal session
**And** I can add/change my card securely via Stripe's hosted UI
**And** no card data is processed by our server

**Given** I want to view my invoices
**When** I click "Invoices"
**Then** I see a list of all past invoices with: date, amount, status (paid/unpaid/void), PDF download link
**And** invoices are fetched from Stripe API

**Given** I click on an invoice
**When** the PDF opens
**Then** it shows: Hoxtup billing details, my organization details, line items, total, payment status
**And** the invoice is Stripe-generated (compliant with EU invoicing requirements)

**Given** my property count approaches my plan limit
**When** I am at 80%+ of my limit (e.g., 4/5 properties on Starter)
**Then** a subtle notification appears on the billing page: "You're approaching your plan limit"
**And** an "Upgrade" CTA is displayed

**Given** I want to cancel my subscription
**When** I click "Cancel subscription"
**Then** a confirmation dialog appears explaining: subscription remains active until end of billing period, data enters grace period after that
**And** cancellation requires re-authentication (owner safeguard)

**Given** I cancel my subscription
**When** the current billing period ends
**Then** my account enters the grace period flow from Story 8.2
**And** no further charges are made

**Given** the billing page on mobile
**When** I view it
**Then** the layout uses compact cards for plan info, usage bar, and payment method
**And** invoice list is scrollable with skeleton loading

## Technical Notes

- Stripe Customer Portal: `stripe.billingPortal.sessions.create()` for payment method management
- Stripe Invoices API: `stripe.invoices.list({ customer })` for invoice history
- Invoice PDF: Stripe-hosted PDF URL (no server-side generation)
- Usage tracking: `organization.property_count` vs `plan.max_properties`
- Cancellation: `stripe.subscriptions.update({ cancel_at_period_end: true })`
- Re-auth for cancel: same re-authentication middleware as owner destructive ops (Story 1.5)
- API endpoints:
  - `GET /api/v1/billing` — current subscription + usage
  - `POST /api/v1/billing/portal` — create Stripe portal session
  - `GET /api/v1/billing/invoices` — list invoices
  - `POST /api/v1/billing/cancel` — cancel subscription (re-auth required)
