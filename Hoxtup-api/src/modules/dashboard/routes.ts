import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { getTenantDb } from '../../config/database.js'
import { logger } from '../../config/logger.js'

const router = Router()

router.get('/home', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const db = getTenantDb(authReq.organizationId)
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 86400000)

    const [todayTasks, checkInsToday, openIncidents, unassignedTasks] = await Promise.all([
      db.task.findMany({
        where: {
          organizationId: authReq.organizationId,
          scheduledAt: { gte: startOfDay, lt: endOfDay },
        },
        include: {
          property: { select: { id: true, name: true, colorIndex: true } },
          assignedUser: { select: { id: true, name: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      db.reservation.count({
        where: {
          organizationId: authReq.organizationId,
          checkIn: { gte: startOfDay, lt: endOfDay },
          status: 'CONFIRMED',
        },
      }),
      db.task.count({
        where: {
          organizationId: authReq.organizationId,
          status: 'INCIDENT',
        },
      }),
      db.task.count({
        where: {
          organizationId: authReq.organizationId,
          assignedUserId: null,
          status: { in: ['PENDING_VALIDATION', 'TODO'] },
        },
      }),
    ])

    res.json({
      kpis: {
        todayTasksCount: todayTasks.length,
        checkInsToday,
        openIncidents,
        unassignedTasks,
      },
      todayTasks,
    })
  } catch (err) {
    logger.error({ err }, 'Failed to fetch dashboard data')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to fetch dashboard data',
    })
  }
})

export { router as dashboardRouter }
