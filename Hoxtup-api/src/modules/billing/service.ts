import type { PrismaClient } from '../../generated/prisma/client.js'
import type { PlanTier } from '../../generated/prisma/client.js'
import { polar } from '../../config/polar.js'
import { config } from '../../config/index.js'
import { getPlanByTier, getPlanByProductId } from '../../config/plans.js'
import { logger } from '../../config/logger.js'

export async function getOrCreateSubscription(db: PrismaClient, organizationId: string) {
  let sub = await db.subscription.findUnique({
    where: { organizationId },
  })

  if (!sub) {
    sub = await db.subscription.create({
      data: {
        organizationId,
        planTier: 'FREE',
        status: 'TRIALING',
      },
    })
  }

  return sub
}

export async function createCheckoutUrl(
  db: PrismaClient,
  organizationId: string,
  planTier: PlanTier,
): Promise<string> {
  if (!polar) {
    throw new Error('Polar is not configured')
  }

  const plan = getPlanByTier(planTier)
  if (!plan.polarProductId || plan.tier === 'FREE') {
    throw new Error(`Cannot checkout for plan: ${planTier}`)
  }

  const sub = await getOrCreateSubscription(db, organizationId)

  const checkout = await polar.checkouts.create({
    products: [plan.polarProductId],
    successUrl: config.POLAR_SUCCESS_URL,
    metadata: {
      organizationId,
      subscriptionId: sub.id,
    },
  })

  return checkout.url
}

export async function cancelSubscription(db: PrismaClient, organizationId: string) {
  const sub = await db.subscription.findUnique({
    where: { organizationId },
  })

  if (!sub) {
    throw new Error('No subscription found')
  }

  if (sub.polarSubscriptionId && polar) {
    try {
      await polar.subscriptions.update({
        id: sub.polarSubscriptionId,
        subscriptionUpdate: { cancelAtPeriodEnd: true },
      })
    } catch (err) {
      logger.error({ err, subscriptionId: sub.polarSubscriptionId }, 'Failed to cancel on Polar')
    }
  }

  await db.subscription.update({
    where: { organizationId },
    data: { cancelledAt: new Date() },
  })
}

export async function handleWebhookEvent(db: PrismaClient, event: WebhookEvent) {
  const { type, data } = event

  logger.info({ type }, 'Processing Polar webhook')

  if (type === 'subscription.created' || type === 'subscription.updated') {
    const metadata = data.metadata as Record<string, string> | undefined
    const organizationId = metadata?.organizationId
    if (!organizationId) {
      logger.warn({ type, data }, 'Webhook missing organizationId in metadata')
      return
    }

    const productId = data.product_id ?? data.productId
    const plan = productId ? getPlanByProductId(productId) : undefined

    await db.subscription.upsert({
      where: { organizationId },
      update: {
        polarSubscriptionId: data.id,
        polarCustomerId: data.customer_id ?? data.customerId ?? null,
        planTier: plan?.tier ?? 'FREE',
        status: mapPolarStatus(data.status),
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
        cancelledAt: data.canceled_at ? new Date(data.canceled_at) : null,
      },
      create: {
        organizationId,
        polarSubscriptionId: data.id,
        polarCustomerId: data.customer_id ?? data.customerId ?? null,
        planTier: plan?.tier ?? 'FREE',
        status: mapPolarStatus(data.status),
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
      },
    })
  }

  if (type === 'subscription.canceled') {
    const metadata = data.metadata as Record<string, string> | undefined
    const organizationId = metadata?.organizationId
    if (!organizationId) return

    await db.subscription.update({
      where: { organizationId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })
  }
}

function mapPolarStatus(status: string): 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'ARCHIVED' {
  switch (status) {
    case 'trialing': return 'TRIALING'
    case 'active': return 'ACTIVE'
    case 'past_due': return 'PAST_DUE'
    case 'canceled':
    case 'cancelled': return 'CANCELLED'
    case 'unpaid': return 'PAST_DUE'
    default: return 'PAST_DUE'
  }
}

interface WebhookEvent {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
}
