import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import { createTaskSchema, transitionTaskSchema, assignTaskSchema, bulkAssignSchema } from './tasks.validation.js'
import * as tasksService from './tasks.service.js'
import type { RbacRequest } from '../../common/middleware/rbac.middleware.js'

type TaskRequest = AuthenticatedRequest & TenantRequest & RbacRequest

export async function listTasks(req: TaskRequest, res: Response, next: NextFunction) {
  try {
    const filters = {
      propertyId: req.query.propertyId as string | undefined,
      status: req.query.status as string | undefined,
      assignedUserId: req.query.assignedUserId as string | undefined,
    }
    const tasks = await tasksService.listTasks(req.tenantId, filters)
    res.json({ tasks, total: tasks.length })
  } catch (error) {
    next(error)
  }
}

export async function getTask(req: TaskRequest, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.getTaskById(req.params.id as string, req.tenantId)
    if (!task) {
      res.status(404).json({ type: 'not-found', title: 'Tâche introuvable', status: 404 })
      return
    }
    res.json(task)
  } catch (error) {
    next(error)
  }
}

export async function createTask(req: TaskRequest, res: Response, next: NextFunction) {
  try {
    const input = createTaskSchema.parse(req.body)
    const task = await tasksService.createTask(req.tenantId, input)
    if (!task) {
      res.status(404).json({ type: 'not-found', title: 'Propriété introuvable', status: 404 })
      return
    }
    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

export async function listTasksScoped(req: TaskRequest, res: Response, next: NextFunction) {
  try {
    const filters = {
      propertyId: req.query.propertyId as string | undefined,
      status: req.query.status as string | undefined,
      assignedUserId: req.query.assignedUserId as string | undefined,
    }
    const tasks = await tasksService.listTasksScoped(req.tenantId, req.user.id, req.user.role, filters)
    res.json({ tasks, total: tasks.length })
  } catch (error) {
    next(error)
  }
}

export async function getMyTasks(req: TaskRequest, res: Response, next: NextFunction) {
  try {
    const tasks = await tasksService.getMyTasks(req.tenantId, req.user.id)
    res.json({ tasks, total: tasks.length })
  } catch (error) {
    next(error)
  }
}

export async function assignTask(req: TaskRequest, res: Response, next: NextFunction) {
  try {
    const input = assignTaskSchema.parse(req.body)
    const result = await tasksService.assignTask(
      req.params.id as string,
      req.tenantId,
      input.assignedUserId,
      req.user.id,
      req.user.role,
    )

    if (!result.success) {
      const statusMap = { not_found: 404, invalid_assignee: 422, scope_violation: 403 } as const
      res.status(statusMap[result.reason]).json({
        type: result.reason.replace('_', '-'),
        title: result.reason === 'not_found' ? 'Tâche introuvable'
          : result.reason === 'invalid_assignee' ? 'Assigné invalide'
          : 'Hors périmètre',
        status: statusMap[result.reason],
      })
      return
    }

    res.json(result.task)
  } catch (error) {
    next(error)
  }
}

export async function bulkAssignTasks(req: TaskRequest, res: Response, next: NextFunction) {
  try {
    const input = bulkAssignSchema.parse(req.body)
    const result = await tasksService.bulkAssignTasks(
      input.taskIds,
      req.tenantId,
      input.assignedUserId,
      req.user.id,
      req.user.role,
    )

    if (!result.success) {
      const statusMap = { not_found: 404, invalid_assignee: 422, scope_violation: 403 } as const
      res.status(statusMap[result.reason]).json({
        type: result.reason.replace('_', '-'),
        title: result.reason === 'not_found' ? 'Tâche(s) introuvable(s)'
          : result.reason === 'invalid_assignee' ? 'Assigné invalide'
          : 'Hors périmètre',
        status: statusMap[result.reason],
      })
      return
    }

    res.json({ assigned: result.count })
  } catch (error) {
    next(error)
  }
}

export async function proxyTransitionTask(req: TaskRequest, res: Response, next: NextFunction) {
  try {
    const { action, note, onBehalfOfId } = req.body as { action: string; note?: string; onBehalfOfId: string }
    const parsedInput = transitionTaskSchema.parse({ action, note })
    const result = await tasksService.proxyTransitionTask(
      req.params.id as string,
      req.tenantId,
      req.user.id,
      req.user.role,
      onBehalfOfId,
      parsedInput.action,
      parsedInput.note,
    )

    if (!result.success) {
      if (result.reason === 'not_found') {
        res.status(404).json({ type: 'not-found', title: 'Tâche introuvable', status: 404 })
        return
      }
      if (result.reason === 'scope_violation') {
        res.status(403).json({ type: 'scope-violation', title: 'Hors périmètre', status: 403 })
        return
      }
      res.status(422).json({
        type: 'invalid-transition',
        title: 'Transition invalide',
        status: 422,
      })
      return
    }

    res.json(result.task)
  } catch (error) {
    next(error)
  }
}

export async function transitionTask(req: TaskRequest, res: Response, next: NextFunction) {
  try {
    const input = transitionTaskSchema.parse(req.body)
    const result = await tasksService.transitionTask(
      req.params.id as string,
      req.tenantId,
      req.user.id,
      input.action,
      input.note,
    )

    if (!result.success) {
      if (result.reason === 'not_found') {
        res.status(404).json({ type: 'not-found', title: 'Tâche introuvable', status: 404 })
        return
      }
      res.status(422).json({
        type: 'invalid-transition',
        title: 'Transition invalide',
        status: 422,
        detail: `Action '${input.action}' not allowed from status '${result.currentStatus}'`,
        allowedActions: result.allowedActions,
        currentStatus: result.currentStatus,
      })
      return
    }

    res.json(result.task)
  } catch (error) {
    next(error)
  }
}
