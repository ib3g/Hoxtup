import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { prisma } from '../../config/database.js'
import { logger } from '../../config/logger.js'

const router = Router()

router.get('/home', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 86400000)

    const day = now.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday)
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000)

    const [weekTasks, todayTasksCount, checkInsToday, openIncidents, unassignedTasks] = await Promise.all([
      prisma.task.findMany({
        where: {
          organizationId: authReq.organizationId,
          scheduledAt: { gte: weekStart, lt: weekEnd },
        },
        include: {
          property: { select: { id: true, name: true, colorIndex: true } },
          assignedUser: { select: { id: true, name: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      prisma.task.count({
        where: {
          organizationId: authReq.organizationId,
          scheduledAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      prisma.reservation.count({
        where: {
          organizationId: authReq.organizationId,
          checkIn: { gte: startOfDay, lt: endOfDay },
          status: 'CONFIRMED',
        },
      }),
      prisma.task.count({
        where: {
          organizationId: authReq.organizationId,
          status: 'INCIDENT',
        },
      }),
      prisma.task.count({
        where: {
          organizationId: authReq.organizationId,
          assignedUserId: null,
          status: { in: ['PENDING_VALIDATION', 'TODO'] },
        },
      }),
    ])

    res.json({
      kpis: {
        todayTasksCount,
        checkInsToday,
        openIncidents,
        unassignedTasks,
      },
      weekTasks,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
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
