import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { prisma } from '../../config/database.js'
import { createTaskSchema, updateTaskSchema } from './schema.js'
import { listTasks, getTask, createTask, updateTask } from './service.js'
import { logger } from '../../config/logger.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
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

router.post('/', requireAuth, async (req, res) => {
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
    const task = await createTask(prisma, authReq.organizationId, parsed.data)
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
    const task = await updateTask(prisma, authReq.organizationId, id, parsed.data)
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

router.delete('/:id', requireAuth, async (req, res) => {
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
