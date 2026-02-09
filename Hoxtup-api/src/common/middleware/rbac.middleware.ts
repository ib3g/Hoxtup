import type { Request, Response, NextFunction } from 'express'
import type { Permission } from '../types/permissions.js'
import type { HoxtupRole } from '../types/roles.js'
import { hasPermission } from '../types/roles.js'
import { ForbiddenError } from '../errors/forbidden.error.js'

export interface RbacRequest extends Request {
  user: {
    id: string
    email: string
    name: string
    role: HoxtupRole
  }
}

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const rbacReq = req as unknown as RbacRequest
    const role = rbacReq.user?.role

    if (!role) {
      next(new ForbiddenError('No role assigned'))
      return
    }

    const allowed = permissions.every((perm) => hasPermission(role, perm))

    if (!allowed) {
      next(new ForbiddenError(`Insufficient permissions. Required: ${permissions.join(', ')}`))
      return
    }

    next()
  }
}
