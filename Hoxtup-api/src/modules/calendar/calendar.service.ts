import { prisma } from '../../config/database.js'
import type { HoxtupRole } from '../../common/types/roles.js'
import { resolvePropertyScope } from '../../common/utils/scope.js'

export interface CalendarEvent {
  id: string
  type: 'reservation' | 'task'
  title: string
  start: Date
  end: Date | null
  propertyId: string
  propertyName: string
  propertyColorIndex: number | null
  status: string
  taskType?: string
  assignedUserId?: string | null
  assignedUserName?: string | null
  guestName?: string
  hasConflict?: boolean
  durationMinutes?: number | null
}

interface CalendarFilters {
  start: Date
  end: Date
  propertyId?: string
  userId?: string
  types?: string[]
}

export async function getCalendarEvents(
  organizationId: string,
  actorId: string,
  actorRole: HoxtupRole,
  filters: CalendarFilters,
): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = []

  const propertyScope = await resolvePropertyScope(organizationId, actorId, actorRole, filters.propertyId)

  const reservations = await prisma.reservation.findMany({
    where: {
      organizationId,
      status: 'CONFIRMED',
      propertyId: propertyScope ? { in: propertyScope } : undefined,
      OR: [
        { checkIn: { gte: filters.start, lte: filters.end } },
        { checkOut: { gte: filters.start, lte: filters.end } },
        { checkIn: { lte: filters.start }, checkOut: { gte: filters.end } },
      ],
    },
    include: { property: { select: { id: true, name: true, colorIndex: true } } },
  })

  for (const r of reservations) {
    events.push({
      id: r.id,
      type: 'reservation',
      title: r.guestName,
      start: r.checkIn,
      end: r.checkOut,
      propertyId: r.propertyId,
      propertyName: r.property.name,
      propertyColorIndex: r.property.colorIndex,
      status: r.status,
      guestName: r.guestName,
    })
  }

  const taskWhere: Record<string, unknown> = {
    organizationId,
    status: { notIn: ['CANCELLED'] },
    scheduledAt: { gte: filters.start, lte: filters.end },
  }

  if (propertyScope) taskWhere.propertyId = { in: propertyScope }

  if (actorRole === 'staff_autonomous' || actorRole === 'staff_managed') {
    taskWhere.assignedUserId = actorId
  } else if (filters.userId) {
    taskWhere.assignedUserId = filters.userId
  }

  if (filters.types && filters.types.length > 0) {
    taskWhere.type = { in: filters.types }
  }

  const tasks = await prisma.task.findMany({
    where: taskWhere,
    include: {
      property: { select: { id: true, name: true, colorIndex: true } },
      assignedUser: { select: { id: true, name: true } },
    },
  })

  const conflictTaskIds = new Set<string>()
  const activeConflicts = await prisma.taskConflict.findMany({
    where: { organizationId, status: { in: ['detected', 'acknowledged'] } },
    select: { taskAId: true, taskBId: true },
  })
  for (const c of activeConflicts) {
    conflictTaskIds.add(c.taskAId)
    conflictTaskIds.add(c.taskBId)
  }

  for (const t of tasks) {
    const endTime = t.scheduledAt && t.durationMinutes
      ? new Date(t.scheduledAt.getTime() + t.durationMinutes * 60 * 1000)
      : null

    events.push({
      id: t.id,
      type: 'task',
      title: t.title,
      start: t.scheduledAt!,
      end: endTime,
      propertyId: t.propertyId,
      propertyName: t.property.name,
      propertyColorIndex: t.property.colorIndex,
      status: t.status,
      taskType: t.type,
      assignedUserId: t.assignedUserId,
      assignedUserName: t.assignedUser?.name ?? null,
      durationMinutes: t.durationMinutes,
      hasConflict: conflictTaskIds.has(t.id),
    })
  }

  events.sort((a, b) => a.start.getTime() - b.start.getTime())

  return events
}

