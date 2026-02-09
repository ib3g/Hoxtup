import type { Request, Response, NextFunction } from 'express'
import { prisma, getTenantDb } from '../../config/database.js'
import { ForbiddenError } from '../errors/forbidden.error.js'
import { auth } from '../../modules/auth/auth.config.js'
import { fromNodeHeaders } from 'better-auth/node'

export interface TenantRequest extends Request {
  tenantId: string
  subscriptionStatus?: string
  db: ReturnType<typeof getTenantDb>
}

export async function tenantMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const activeMember = await auth.api.getFullOrganization({
      headers: fromNodeHeaders(req.headers),
    })

    const tenantId = activeMember?.id

    if (!tenantId) {
      next(new ForbiddenError('No active organization. Please select an organization.'))
      return
    }

    const sub = await prisma.subscription.findUnique({
      where: { organizationId: tenantId },
      select: { status: true },
    })

      ; (req as unknown as TenantRequest).tenantId = tenantId
      ; (req as unknown as TenantRequest).subscriptionStatus = sub?.status
      ; (req as unknown as TenantRequest).db = getTenantDb(tenantId)
    next()
  } catch {
    next(new ForbiddenError('Tenant context required'))
  }
}
