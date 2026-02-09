import type { Request, Response, NextFunction } from 'express'
import { auth } from '../../modules/auth/auth.config.js'
import { fromNodeHeaders } from 'better-auth/node'
import { UnauthorizedError } from '../errors/unauthorized.error.js'
import type { HoxtupRole } from '../types/roles.js'

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
    name: string
    role: HoxtupRole
  }
  session: {
    id: string
    userId: string
    expiresAt: Date
    token: string
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) {
      next(new UnauthorizedError('Session invalid or expired'))
      return
    }

    let role: HoxtupRole = 'staff_managed'
    try {
      const activeMember = await auth.api.getActiveMember({
        headers: fromNodeHeaders(req.headers),
      })

      // If there is an active organization, verify the user is a member
      if (activeMember) {
        if (activeMember.userId === session.user.id) {
          role = activeMember.role as HoxtupRole
        } else {
          throw new UnauthorizedError('Unauthorized access to this organization')
        }
      }
      // If no active member, we continue with the default 'staff_managed' role or whatever is appropriate
    } catch (e) {
      if (e instanceof UnauthorizedError) throw e
      // No active org — default to staff_managed (lowest privilege)
    }

    ; (req as unknown as AuthenticatedRequest).user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role,
    }
      ; (req as unknown as AuthenticatedRequest).session = session.session as AuthenticatedRequest['session']
    next()
  } catch {
    next(new UnauthorizedError('Session invalid or expired'))
  }
}

export async function reauthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authReq = req as unknown as AuthenticatedRequest
  if (!authReq.session) {
    next(new UnauthorizedError('Authentication required'))
    return
  }

  // Check if session was created in the last 15 minutes
  // or if it was modified recently (e.g. by a re-auth step)
  const lastAuth = new Date(authReq.session.expiresAt).getTime() - (7 * 24 * 60 * 60 * 1000) // Rough estimation of creation
  const now = Date.now()

  // For MVP, we'll check if a 'x-hoxtup-reauth' header is present
  // In a real app, this would be a specific flow with Better Auth or a fresh password check
  if (!req.headers['x-hoxtup-reauth'] && (now - lastAuth > 15 * 60 * 1000)) {
    _res.status(403).json({
      type: 'forbidden',
      title: 'Ré-authentification requise',
      status: 403,
      detail: 'Cette opération nécessite une confirmation d\'identité récente.'
    })
    return
  }

  next()
}
