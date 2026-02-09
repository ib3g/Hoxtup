import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import { prisma } from '../../config/database.js'
import { updateAutoRuleSchema } from './auto-rules.validation.js'

type AutoRuleRequest = AuthenticatedRequest & TenantRequest

export async function listAutoRules(req: AutoRuleRequest, res: Response, next: NextFunction) {
  try {
    const propertyId = req.params.propertyId as string

    const property = await prisma.property.findFirst({
      where: { id: propertyId, organizationId: req.tenantId, archivedAt: null },
    })
    if (!property) {
      res.status(404).json({ type: 'not-found', title: 'Propriété introuvable', status: 404 })
      return
    }

    const rules = await prisma.taskAutoRule.findMany({
      where: { propertyId, organizationId: req.tenantId },
      orderBy: { triggerType: 'asc' },
    })

    res.json({ rules })
  } catch (error) {
    next(error)
  }
}

export async function updateAutoRule(req: AutoRuleRequest, res: Response, next: NextFunction) {
  try {
    const { propertyId, ruleId } = req.params as { propertyId: string; ruleId: string }

    const rule = await prisma.taskAutoRule.findFirst({
      where: { id: ruleId, propertyId, organizationId: req.tenantId },
    })
    if (!rule) {
      res.status(404).json({ type: 'not-found', title: 'Règle introuvable', status: 404 })
      return
    }

    const input = updateAutoRuleSchema.parse(req.body)

    const updated = await prisma.taskAutoRule.update({
      where: { id: ruleId },
      data: input,
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
}
