import { prisma } from '../../config/database.js'
import type { HoxtupRole } from '../../common/types/roles.js'
import { resolvePropertyScope } from '../../common/utils/scope.js'

interface KPI {
  label: string
  value: number
  color: 'green' | 'red' | 'teal'
}

function getContextMessage(hour: number): string {
  if (hour < 12) return 'Planifiez votre journée'
  if (hour < 17) return 'Vérifiez les alertes en cours'
  return 'Consultez le bilan de la journée'
}

function getTimeContext(hour: number): 'morning' | 'midday' | 'evening' {
  if (hour < 12) return 'morning'
  if (hour < 17) return 'midday'
  return 'evening'
}

export async function getHomeDashboard(
  organizationId: string,
  userId: string,
  userName: string,
  userRole: HoxtupRole,
) {
  const propertyScope = await resolvePropertyScope(organizationId, userId, userRole)
  const propFilter = propertyScope ? { in: propertyScope } : undefined

  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)
  const hour = now.getHours()

  const [tasksToday, checkIns, checkOuts, incidents, pendingValidations] = await Promise.all([
    prisma.task.count({
      where: {
        organizationId,
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: { notIn: ['CANCELLED'] },
        propertyId: propFilter,
      },
    }),
    prisma.reservation.count({
      where: {
        organizationId,
        checkIn: { gte: todayStart, lte: todayEnd },
        status: 'CONFIRMED',
        propertyId: propFilter,
      },
    }),
    prisma.reservation.count({
      where: {
        organizationId,
        checkOut: { gte: todayStart, lte: todayEnd },
        status: 'CONFIRMED',
        propertyId: propFilter,
      },
    }),
    prisma.incident.findMany({
      where: {
        organizationId,
        status: 'open',
        task: { propertyId: propFilter },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.task.count({
      where: {
        organizationId,
        status: 'PENDING_VALIDATION',
        propertyId: propFilter,
      },
    }),
  ])

  const activeAlerts = incidents.length

  const kpis: KPI[] = [
    { label: 'Tâches aujourd\'hui', value: tasksToday, color: 'teal' },
    { label: 'Check-ins', value: checkIns, color: 'teal' },
    { label: 'Check-outs', value: checkOuts, color: 'teal' },
    { label: 'Alertes actives', value: activeAlerts, color: activeAlerts > 0 ? 'red' : 'green' },
  ]

  const tasks = await prisma.task.findMany({
    where: {
      organizationId,
      scheduledAt: { gte: todayStart, lte: todayEnd },
      status: { notIn: ['CANCELLED'] },
      propertyId: propFilter,
    },
    orderBy: { scheduledAt: 'asc' },
    take: 10,
    include: {
      property: { select: { id: true, name: true, colorIndex: true } },
      assignedUser: { select: { id: true, name: true } },
    },
  })

  return {
    greeting: `Bonjour ${userName}`,
    date: now.toISOString(),
    contextMessage: getContextMessage(hour),
    timeContext: getTimeContext(hour),
    kpis,
    pendingValidations,
    incidents,
    tasks,
  }
}

type ZenLevel = 'zen_complete' | 'zen_partial' | 'attention'

function computeZenState(completed: number, total: number): ZenLevel {
  if (total === 0) return 'zen_complete'
  const ratio = completed / total
  if (ratio >= 1) return 'zen_complete'
  if (ratio > 0.5) return 'zen_partial'
  return 'attention'
}

export async function getFieldDashboard(organizationId: string, userId: string) {
  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)

  const myTasks = await prisma.task.findMany({
    where: {
      organizationId,
      assignedUserId: userId,
      scheduledAt: { gte: todayStart, lte: todayEnd },
      status: { notIn: ['CANCELLED'] },
    },
    orderBy: { scheduledAt: 'asc' },
    include: {
      property: { select: { id: true, name: true, colorIndex: true, photoUrl: true } },
    },
  })

  const completed = myTasks.filter((t) => t.status === 'COMPLETED').length
  const total = myTasks.length
  const zenState = computeZenState(completed, total)

  const nextTask = myTasks.find((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS') ?? null
  const remainingTasks = myTasks.filter((t) => t.id !== nextTask?.id && t.status !== 'COMPLETED')

  return {
    taskCount: total,
    completedCount: completed,
    zenState,
    nextTask,
    remainingTasks,
  }
}

export async function getActivitySummary(
  organizationId: string,
  userId: string,
  userRole: HoxtupRole,
  date: Date,
) {
  const propertyScope = await resolvePropertyScope(organizationId, userId, userRole)
  const propFilter = propertyScope ? { in: propertyScope } : undefined

  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999)

  const prevWeek = new Date(dayStart)
  prevWeek.setDate(prevWeek.getDate() - 7)
  const prevWeekEnd = new Date(prevWeek); prevWeekEnd.setHours(23, 59, 59, 999)

  const [tasksCompleted, tasksIncomplete, incidentsReported, incidentsResolved,
    consumableCost, revenueTotal, prevWeekCompleted] = await Promise.all([
      prisma.task.findMany({
        where: {
          organizationId,
          completedAt: { gte: dayStart, lte: dayEnd },
          propertyId: propFilter,
        },
        include: {
          property: { select: { id: true, name: true } },
          assignedUser: { select: { id: true, name: true } },
          history: { where: { isProxy: true }, select: { isProxy: true }, take: 1 },
        },
      }),
      prisma.task.count({
        where: {
          organizationId,
          scheduledAt: { gte: dayStart, lte: dayEnd },
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
          propertyId: propFilter,
        },
      }),
      prisma.incident.count({
        where: {
          organizationId,
          createdAt: { gte: dayStart, lte: dayEnd },
          task: { propertyId: propFilter },
        },
      }),
      prisma.incident.count({
        where: {
          organizationId,
          resolvedAt: { gte: dayStart, lte: dayEnd },
          task: { propertyId: propFilter },
        },
      }),
      prisma.stockMovement.aggregate({
        where: {
          item: {
            organizationId,
            propertyId: propFilter,
          },
          type: 'EXIT',
          recordedAt: { gte: dayStart, lte: dayEnd },
          costCentimes: { not: null },
        },
        _sum: { costCentimes: true },
      }),
      prisma.revenue.aggregate({
        where: {
          organizationId,
          date: { gte: dayStart, lte: dayEnd },
          propertyId: propFilter,
        },
        _sum: { amountCentimes: true },
      }),
      prisma.task.count({
        where: {
          organizationId,
          completedAt: { gte: prevWeek, lte: prevWeekEnd },
          propertyId: propFilter,
        },
      }),
    ])

  const completedCount = tasksCompleted.length
  const delta = completedCount - prevWeekCompleted

  const year = dayStart.getFullYear()
  const month = String(dayStart.getMonth() + 1).padStart(2, '0')
  const day = String(dayStart.getDate()).padStart(2, '0')

  return {
    date: `${year}-${month}-${day}`,
    tasksCompleted: tasksCompleted.map((t) => ({
      id: t.id,
      title: t.title,
      propertyName: t.property.name,
      completedBy: t.assignedUser?.name ?? null,
      completedAt: t.completedAt,
      isProxy: t.history.length > 0,
    })),
    tasksCompletedCount: completedCount,
    tasksIncomplete,
    incidents: { reported: incidentsReported, resolved: incidentsResolved },
    costs: {
      consumables: consumableCost._sum.costCentimes ?? 0,
      revenue: revenueTotal._sum.amountCentimes ?? 0,
      net: (revenueTotal._sum.amountCentimes ?? 0) - (consumableCost._sum.costCentimes ?? 0),
    },
    comparison: {
      previousWeekCompleted: prevWeekCompleted,
      delta,
      message: delta > 0
        ? `${delta} tâche(s) de plus que la semaine dernière`
        : delta < 0
          ? `${Math.abs(delta)} tâche(s) de moins que la semaine dernière`
          : 'Même rythme que la semaine dernière',
    },
  }
}
