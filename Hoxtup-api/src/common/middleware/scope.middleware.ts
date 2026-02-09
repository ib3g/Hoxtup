import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../../config/database.js'
import { ForbiddenError } from '../errors/forbidden.error.js'
import type { AuthenticatedRequest } from './auth.middleware.js'
import type { TenantRequest } from './tenant.middleware.js'

export interface ScopedRequest extends Request {
  scope: {
    propertyIds: string[] | null
  }
}

export async function scopeMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authReq = req as unknown as AuthenticatedRequest & TenantRequest
  const role = authReq.user?.role?.toLowerCase()

  if (!role) {
    next(new ForbiddenError('No role assigned'))
    return
  }

  if (role === 'owner' || role === 'admin') {
    ; (req as unknown as ScopedRequest).scope = { propertyIds: null }
    next()
    return
  }

  if (role === 'manager' || role === 'staff_autonomous') {
    try {
      const assignments = await prisma.propertyAssignment.findMany({
        where: { userId: authReq.user.id },
        select: { propertyId: true },
      })
        ; (req as unknown as ScopedRequest).scope = {
          propertyIds: assignments.map((a: { propertyId: string }) => a.propertyId),
        }
      next()
    } catch {
      next(new ForbiddenError('Failed to resolve property scope'))
    }
    return
  }

  if (role === 'staff_managed') {
    next(new ForbiddenError('Staff Managed profiles have no application access'))
    return
  }

  next()
}

export function requirePropertyAccess(paramName: string = 'propertyId') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const scopedReq = req as unknown as ScopedRequest
    if (!scopedReq.scope) {
      next(new ForbiddenError('Scope not resolved'))
      return
    }

    const targetPropertyId = req.params[paramName] as string | undefined
    if (!targetPropertyId) {
      next()
      return
    }

    if (scopedReq.scope.propertyIds !== null && !scopedReq.scope.propertyIds.includes(targetPropertyId)) {
      next(new ForbiddenError('Access to this property is denied'))
      return
    }

    next()
  }
}
