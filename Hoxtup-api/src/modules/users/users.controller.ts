import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import type { ScopedRequest } from '../../common/middleware/scope.middleware.js'
import { createStaffManagedSchema, updateRoleSchema } from './users.validation.js'
import * as usersService from './users.service.js'

type TeamRequest = AuthenticatedRequest & TenantRequest & ScopedRequest

export async function listTeam(req: TeamRequest, res: Response, next: NextFunction) {
  try {
    const members = await usersService.listTeamMembers(req.tenantId, req.scope.propertyIds)
    res.json({ members, total: members.length })
  } catch (error) {
    next(error)
  }
}

export async function createStaffManaged(req: TeamRequest, res: Response, next: NextFunction) {
  try {
    const input = createStaffManagedSchema.parse(req.body)
    const user = await usersService.createStaffManaged(req.tenantId, input, req.user.id)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

export async function updateRole(req: TeamRequest, res: Response, next: NextFunction) {
  try {
    const input = updateRoleSchema.parse(req.body)
    const member = await usersService.updateMemberRole(req.params.id as string, req.tenantId, input, req.user.id, req.headers)
    if (!member) {
      res.status(404).json({ type: 'not-found', title: 'Member not found', status: 404 })
      return
    }
    res.json(member)
  } catch (error) {
    next(error)
  }
}

export async function removeMember(req: TeamRequest, res: Response, next: NextFunction) {
  try {
    const result = await usersService.deactivateMember(req.params.id as string, req.tenantId, req.user.id)
    if (!result) {
      res.status(404).json({ type: 'not-found', title: 'Member not found', status: 404 })
      return
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
}
