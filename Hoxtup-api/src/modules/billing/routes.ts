import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { getTenantDb } from '../../config/database.js'
import { logger } from '../../config/logger.js'

const router = Router()

const PLANS = [
  { id: 'free', name: 'Free', price: 0, currency: 'EUR', interval: 'month', maxProperties: 1, features: ['1 propriété', 'Tâches illimitées', 'Calendrier'] },
  { id: 'starter', name: 'Starter', price: 69, currency: 'EUR', interval: 'month', maxProperties: 7, features: ['2-7 propriétés', 'iCal sync', 'Équipe (5 membres)', 'Notifications'] },
  { id: 'pro', name: 'Pro', price: 199, currency: 'EUR', interval: 'month', maxProperties: 15, features: ['8-15 propriétés', 'Équipe illimitée', 'Rapports', 'Support prioritaire'] },
  { id: 'scale', name: 'Scale', price: 399, currency: 'EUR', interval: 'month', maxProperties: 25, features: ['16-25 propriétés', 'API access', 'Webhooks', 'SLA garanti'] },
  { id: 'agency', name: 'Agency', price: -1, currency: 'EUR', interval: 'month', maxProperties: -1, features: ['26+ propriétés', 'Custom onboarding', 'Account manager', 'Sur mesure'] },
]

router.get('/plans', requireAuth, async (_req, res) => {
  res.json(PLANS)
})

router.get('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const db = getTenantDb(authReq.organizationId)
    const org = await db.organization.findUnique({
      where: { id: authReq.organizationId },
      select: { id: true, name: true, createdAt: true },
    })

    const propertyCount = await db.property.count({
      where: { organizationId: authReq.organizationId, archivedAt: null },
    })

    res.json({
      currentPlan: 'free',
      propertyCount,
      organization: org,
      renewalDate: null,
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

export { router as billingRouter }
