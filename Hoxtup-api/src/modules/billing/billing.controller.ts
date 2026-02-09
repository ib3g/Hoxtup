import type { Response, NextFunction } from 'express'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import * as billingService from './billing.service.js'

type BillingRequest = AuthenticatedRequest & TenantRequest & { rawBody?: string }

export async function getSubscription(req: BillingRequest, res: Response, next: NextFunction) {
  try {
    const sub = await billingService.getSubscription(req.tenantId)
    if (!sub) {
      res.status(404).json({ type: 'not-found', title: 'Aucun abonnement trouvé', status: 404 })
      return
    }
    res.json(sub)
  } catch (error) {
    next(error)
  }
}

export async function getPlans(_req: BillingRequest, res: Response, next: NextFunction) {
  try {
    const plans = billingService.getAllPlans()
    res.json({ plans })
  } catch (error) {
    next(error)
  }
}

export async function cancelSubscription(req: BillingRequest, res: Response, next: NextFunction) {
  try {
    const result = await billingService.cancelSubscription(req.tenantId)
    if (!result) {
      res.status(404).json({ type: 'not-found', title: 'Abonnement introuvable ou déjà annulé', status: 404 })
      return
    }
    res.json({ id: result.id, status: result.status, cancelledAt: result.cancelledAt })
  } catch (error) {
    next(error)
  }
}

export async function handleWebhook(req: BillingRequest, res: Response, next: NextFunction) {
  try {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
    let event: any

    if (webhookSecret && req.rawBody) {
      try {
        event = validateEvent(req.rawBody, req.headers as Record<string, string>, webhookSecret)
      } catch (error) {
        if (error instanceof WebhookVerificationError) {
          res.status(403).json({ error: 'Invalid signature' })
          return
        }
        throw error
      }
    } else {
      // Fallback for development/testing if secret is not set
      if (process.env.NODE_ENV === 'production') {
        res.status(400).json({ error: 'Webhook secret missing' })
        return
      }
      event = req.body
    }

    const eventType = event?.type as string

    switch (eventType) {
      case 'subscription.created': {
        const data = event.data
        await billingService.activateSubscription(
          data.metadata?.organizationId,
          data.customerId,
          data.id,
          data.planTier ?? 'STARTER',
          new Date(data.currentPeriodEnd),
        )
        break
      }
      case 'subscription.updated': {
        const data = event.data
        const status = data.status === 'past_due' ? 'PAST_DUE' : data.status === 'active' ? 'ACTIVE' : undefined
        if (status) {
          await billingService.updateSubscriptionStatus(data.id, status as 'PAST_DUE' | 'ACTIVE')
        }
        break
      }
      case 'subscription.canceled': {
        const data = event.data
        await billingService.updateSubscriptionStatus(data.id, 'CANCELLED')
        break
      }
    }

    res.json({ received: true })
  } catch (error) {
    next(error)
  }
}
