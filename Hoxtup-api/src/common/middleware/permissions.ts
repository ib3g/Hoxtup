import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from './auth.js'
import { prisma } from '../../config/database.js'
import { logger } from '../../config/logger.js'

export async function getActorMemberRole(
  userId: string,
  organizationId: string,
): Promise<string | null> {
  const member = await prisma.member.findFirst({
    where: { userId, organizationId },
    select: { role: true },
  })
  return member?.role ?? null
}

export function requireRole(...allowedRoles: string[]) {
  return async (req: unknown, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest

    try {
      const role = await getActorMemberRole(authReq.user.id, authReq.organizationId)

      if (!role || !allowedRoles.includes(role)) {
        res.status(403).json({
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          detail: 'You do not have permission to perform this action',
        })
        return
      }

      authReq.memberRole = role
      next()
    } catch (err) {
      logger.error({ err }, 'Permission check failed')
      res.status(500).json({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Permission check failed',
      })
    }
  }
}
