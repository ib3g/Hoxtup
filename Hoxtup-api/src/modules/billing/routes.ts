import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { prisma } from '../../config/database.js'
import { logger } from '../../config/logger.js'
import { PLANS } from '../../config/plans.js'
import { isPolarConfigured } from '../../config/polar.js'
import { config } from '../../config/index.js'
import {
  getOrCreateSubscription,
  createCheckoutUrl,
  cancelSubscription,
  handleWebhookEvent,
} from './service.js'
import type { PlanTier } from '../../generated/prisma/client.js'

const router = Router()

router.get('/plans', requireAuth, async (_req, res) => {
  const plansList = Object.values(PLANS).map((p) => ({
    id: p.tier.toLowerCase(),
    name: p.tier.charAt(0) + p.tier.slice(1).toLowerCase(),
    price: p.price !== null ? p.price / 100 : -1,
    currency: 'EUR',
    interval: 'month',
    maxProperties: p.maxProperties === Infinity ? -1 : p.maxProperties,
    features: p.features,
  }))
  res.json(plansList)
})

router.get('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const sub = await getOrCreateSubscription(prisma, authReq.organizationId)

    const org = await prisma.organization.findUnique({
      where: { id: authReq.organizationId },
      select: { id: true, name: true, currencyCode: true, timezone: true, createdAt: true },
    })

    const propertyCount = await prisma.property.count({
      where: { organizationId: authReq.organizationId, archivedAt: null },
    })

    const plan = PLANS[sub.planTier]

    res.json({
      currentPlan: sub.planTier.toLowerCase(),
      planTier: sub.planTier,
      status: sub.status,
      propertyCount,
      maxProperties: plan?.maxProperties === Infinity ? -1 : (plan?.maxProperties ?? 1),
      renewalDate: sub.currentPeriodEnd?.toISOString() ?? null,
      cancelledAt: sub.cancelledAt?.toISOString() ?? null,
      organization: org,
    })
  } catch (err) {
    logger.error({ err }, 'Failed to fetch billing info')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to fetch billing info',
    })
  }
})

router.post('/checkout', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const { planTier } = req.body as { planTier?: string }

  if (!planTier) {
    res.status(400).json({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: 'planTier is required',
    })
    return
  }

  const tier = planTier.toUpperCase() as PlanTier
  if (!PLANS[tier]) {
    res.status(400).json({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: `Invalid plan tier: ${planTier}`,
    })
    return
  }

  if (!isPolarConfigured()) {
    res.status(503).json({
      type: 'about:blank',
      title: 'Service Unavailable',
      status: 503,
      detail: 'Billing is not configured. Set POLAR_ACCESS_TOKEN to enable.',
    })
    return
  }

  try {
    const checkoutUrl = await createCheckoutUrl(prisma, authReq.organizationId, tier)
    res.json({ checkoutUrl })
  } catch (err) {
    logger.error({ err, planTier }, 'Failed to create checkout session')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: err instanceof Error ? err.message : 'Failed to create checkout session',
    })
  }
})

router.post('/cancel', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    await cancelSubscription(prisma, authReq.organizationId)
    res.json({ ok: true })
  } catch (err) {
    logger.error({ err }, 'Failed to cancel subscription')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: err instanceof Error ? err.message : 'Failed to cancel subscription',
    })
  }
})

router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-polar-signature'] as string | undefined

  if (config.POLAR_WEBHOOK_SECRET && signature) {
    // TODO: Verify webhook signature with Polar SDK when available
    // For now, accept all webhooks in development
    if (config.NODE_ENV === 'production' && !signature) {
      res.status(401).json({ error: 'Missing signature' })
      return
    }
  }

  try {
    const event = req.body as { type: string; data: Record<string, unknown> }
    if (!event?.type || !event?.data) {
      res.status(400).json({ error: 'Invalid webhook payload' })
      return
    }

    await handleWebhookEvent(prisma, event)
    res.json({ received: true })
  } catch (err) {
    logger.error({ err }, 'Webhook processing error')
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export { router as billingRouter }
