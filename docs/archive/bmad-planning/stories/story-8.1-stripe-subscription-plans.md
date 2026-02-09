# Story 8.1: Stripe Integration & Subscription Plans

## Epic: 8 - Billing & Subscription

As an **owner**,
I want to subscribe to a plan that fits my portfolio size via a secure Stripe checkout,
So that I can access all features and scale as my business grows.

## Requirements Covered

- FR29: Subscription engine (partial — Stripe integration, property-count tiers)

## Acceptance Criteria

**Given** I am an Owner on the free tier
**When** I navigate to Settings → Billing
**Then** I see all available plans with pricing, feature comparison, and my current plan highlighted
**And** plans are: Free (0€, 1 property), Starter (69€/mo, up to 5), Pro (199€/mo, up to 15), Scale (399€/mo, up to 50), Agency (custom)

**Given** I select a plan to subscribe
**When** I click "Subscribe"
**Then** I am redirected to a Stripe Checkout session
**And** the checkout shows the plan name, price, and billing cycle (monthly)
**And** payment is processed securely via Stripe (no card data touches our server)

**Given** Stripe processes the payment successfully
**When** the webhook `checkout.session.completed` fires
**Then** the organization's subscription is activated
**And** the plan tier and limits are updated in the database
**And** the owner receives a confirmation email with invoice link

**Given** Stripe payment fails
**When** the webhook reports failure
**Then** the subscription remains on the current plan
**And** the owner receives a notification: "Payment failed — please update your payment method"

**Given** I am on the Starter plan with 5 properties
**When** I try to add a 6th property
**Then** I see a message: "Upgrade to Pro for up to 15 properties"
**And** a CTA links to the billing page

**Given** I want to upgrade from Starter to Pro
**When** I click "Upgrade" on the billing page
**Then** Stripe handles prorated billing automatically
**And** the plan change takes effect immediately

**Given** I want to downgrade my plan
**When** I select a lower plan
**Then** the downgrade is scheduled for the end of the current billing cycle
**And** I am warned if my current property count exceeds the new plan's limit

**Given** the billing page
**When** I view my subscription details
**Then** I see: current plan, next billing date, payment method (last 4 digits), monthly cost

## Technical Notes

- Stripe integration: `stripe` npm package
- Webhook endpoint: `POST /api/v1/webhooks/stripe` (signature verification via `stripe.webhooks.constructEvent`)
- Events handled: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Prisma model: `Subscription` with `organization_id`, `stripe_customer_id`, `stripe_subscription_id`, `plan_tier`, `status`, `current_period_end`
- Plan tiers: stored in config, not DB (avoids schema changes for pricing updates)
- Property limit enforcement: middleware checking `organization.property_count <= plan.max_properties`
- Stripe Customer: created on first subscription, linked to Organization
