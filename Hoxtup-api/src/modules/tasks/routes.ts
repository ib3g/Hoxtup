import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { requireRole, getActorMemberRole } from '../../common/middleware/permissions.js'
import { prisma } from '../../config/database.js'
import { createTaskSchema, updateTaskSchema } from './schema.js'
import { listTasks, getTask, createTask, updateTask } from './service.js'
import { logger } from '../../config/logger.js'

const CAN_FULL_EDIT = ['owner', 'admin', 'manager']
const STAFF_ROLES = ['member', 'staff_autonomous', 'staff_managed']

const router = Router()

router.get('/', requireAuth, requireRole('owner', 'admin', 'manager', 'member', 'staff_autonomous'), async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const propertyId = req.query.propertyId as string | undefined
  const status = req.query.status as string | undefined
  const assignedUserId = req.query.assignedUserId as string | undefined

  try {
    const tasks = await listTasks(prisma, authReq.organizationId, { propertyId, status, assignedUserId })
    res.json(tasks)
  } catch (err) {
    logger.error({ err, organizationId: authReq.organizationId }, 'Failed to list tasks')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to list tasks',
    })
  }
})

router.get('/my', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const tasks = await listTasks(prisma, authReq.organizationId, { assignedUserId: authReq.user.id })
    res.json(tasks)
  } catch (err) {
    logger.error({ err }, 'Failed to list my tasks')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to list tasks',
    })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const task = await getTask(prisma, authReq.organizationId, id)

    if (!task) {
      res.status(404).json({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'Task not found',
      })
      return
    }

    // staff_managed can only view tasks assigned to them
    const role = await getActorMemberRole(authReq.user.id, authReq.organizationId)
    if (role === 'staff_managed' && task.assignedUserId !== authReq.user.id) {
      res.status(403).json({
        type: 'about:blank',
        title: 'Forbidden',
        status: 403,
        detail: 'You can only view tasks assigned to you',
      })
      return
    }

    res.json(task)
  } catch (err) {
    logger.error({ err, id }, 'Failed to get task')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to get task',
    })
  }
})

router.post('/', requireAuth, requireRole('owner', 'admin', 'manager'), async (req, res) => {
  const authReq = req as AuthenticatedRequest

  const parsed = createTaskSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      type: 'about:blank',
      title: 'Validation Error',
      status: 400,
      detail: 'Invalid request body',
      errors: parsed.error.issues,
    })
    return
  }

  try {
    const task = await createTask(prisma, authReq.organizationId, parsed.data, authReq.user.id)
    res.status(201).json(task)
  } catch (err) {
    logger.error({ err, organizationId: authReq.organizationId }, 'Failed to create task')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to create task',
    })
  }
})

router.patch('/:id', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  const parsed = updateTaskSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      type: 'about:blank',
      title: 'Validation Error',
      status: 400,
      detail: 'Invalid request body',
      errors: parsed.error.issues,
    })
    return
  }

  try {
    const role = await getActorMemberRole(authReq.user.id, authReq.organizationId)
    if (!role) {
      res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Not a member of this organization' })
      return
    }

    // Staff roles can only update status/note on their own assigned tasks
    if (STAFF_ROLES.includes(role)) {
      const current = await getTask(prisma, authReq.organizationId, id)
      if (!current || current.assignedUserId !== authReq.user.id) {
        res.status(403).json({
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          detail: 'You can only update tasks assigned to you',
        })
        return
      }

      const allowedFields = ['status', 'note']
      const hasDisallowedFields = Object.keys(parsed.data).some((k) => !allowedFields.includes(k))
      if (hasDisallowedFields) {
        res.status(403).json({
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          detail: 'You can only update the status and note of your assigned tasks',
        })
        return
      }
    } else if (!CAN_FULL_EDIT.includes(role)) {
      res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'You do not have permission to perform this action' })
      return
    }

    const task = await updateTask(prisma, authReq.organizationId, id, parsed.data, authReq.user.id)
    res.json(task)
  } catch (err) {
    logger.error({ err, id }, 'Failed to update task')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to update task',
    })
  }
})

router.delete('/:id', requireAuth, requireRole('owner', 'admin', 'manager'), async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    await prisma.task.delete({
      where: { id, organizationId: authReq.organizationId },
    })
    res.status(204).end()
  } catch (err) {
    logger.error({ err, id }, 'Failed to delete task')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to delete task',
    })
  }
})

export { router as tasksRouter }
