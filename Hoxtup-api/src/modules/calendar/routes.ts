import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { requireRole } from '../../common/middleware/permissions.js'
import { prisma } from '../../config/database.js'
import { logger } from '../../config/logger.js'

const router = Router()

router.get('/', requireAuth, requireRole('owner', 'admin', 'manager', 'member', 'staff_autonomous'), async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const start = req.query.start as string | undefined
  const end = req.query.end as string | undefined
  const propertyId = req.query.propertyId as string | undefined

  if (!start || !end) {
    res.status(400).json({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: 'start and end query params are required',
    })
    return
  }

  try {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const [reservations, tasks] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          organizationId: authReq.organizationId,
          ...(propertyId && { propertyId }),
          checkIn: { lte: endDate },
          checkOut: { gte: startDate },
        },
        include: { property: { select: { id: true, name: true, colorIndex: true } } },
      }),
      prisma.task.findMany({
        where: {
          organizationId: authReq.organizationId,
          ...(propertyId && { propertyId }),
          scheduledAt: { gte: startDate, lte: endDate },
        },
        include: {
          property: { select: { id: true, name: true, colorIndex: true } },
          assignedUser: { select: { id: true, name: true } },
        },
      }),
    ])

    res.json({ reservations, tasks })
  } catch (err) {
    logger.error({ err }, 'Failed to fetch calendar data')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to fetch calendar data',
    })
  }
})

export { router as calendarRouter }
