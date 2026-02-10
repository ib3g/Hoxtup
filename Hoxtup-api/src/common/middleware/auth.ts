import type { Request, Response, NextFunction } from 'express'
import { auth } from '../../config/auth.js'
import { logger } from '../../config/logger.js'
import { fromNodeHeaders } from 'better-auth/node'

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  organizationId: string
  sessionId: string
  memberRole?: string
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session?.session || !session?.user) {
      res.status(401).json({
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
      })
      return
    }

    let orgId = session.session.activeOrganizationId

    if (!orgId) {
      const orgs = await auth.api.listOrganizations({
        headers: fromNodeHeaders(req.headers),
      })

      if (orgs && orgs.length > 0) {
        orgId = orgs[0].id
        logger.info({ userId: session.user.id, orgId }, 'Auto-activating first organization')
      } else {
        res.status(403).json({
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          detail: 'No active organization',
        })
        return
      }
    }

    const authReq = req as AuthenticatedRequest
    authReq.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user as Record<string, unknown>).role as string ?? 'STAFF_MANAGED',
    }
    authReq.organizationId = orgId
    authReq.sessionId = session.session.id

    next()
  } catch (err) {
    logger.error({ err }, 'Auth middleware error')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Authentication check failed',
    })
  }
}
