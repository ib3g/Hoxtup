import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { prisma } from '../../config/database.js'
import { logger } from '../../config/logger.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const notifications = await prisma.notification.findMany({
      where: { organizationId: authReq.organizationId, userId: authReq.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(notifications)
  } catch (err) {
    logger.error({ err }, 'Failed to list notifications')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to list notifications',
    })
  }
})

router.get('/unread-count', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const count = await prisma.notification.count({
      where: { organizationId: authReq.organizationId, userId: authReq.user.id, readAt: null },
    })
    res.json({ count })
  } catch (err) {
    logger.error({ err }, 'Failed to count unread notifications')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to count unread notifications',
    })
  }
})

router.patch('/:id/read', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const notification = await prisma.notification.update({
      where: { id, organizationId: authReq.organizationId, userId: authReq.user.id },
      data: { readAt: new Date() },
    })
    res.json(notification)
  } catch (err) {
    logger.error({ err, id }, 'Failed to mark notification as read')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to mark notification as read',
    })
  }
})

router.patch('/read-all', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    await prisma.notification.updateMany({
      where: { organizationId: authReq.organizationId, userId: authReq.user.id, readAt: null },
      data: { readAt: new Date() },
    })
    res.json({ success: true })
  } catch (err) {
    logger.error({ err }, 'Failed to mark all notifications as read')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to mark all notifications as read',
    })
  }
})

export { router as notificationsRouter }
