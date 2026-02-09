import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'

function sortPairIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a]
}

export async function detectPropertyConflicts(
  taskId: string,
  organizationId: string,
  propertyId: string,
  scheduledAt: Date,
  durationMinutes: number,
): Promise<string[]> {
  const taskEnd = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000)

  const overlapping = await prisma.task.findMany({
    where: {
      organizationId,
      propertyId,
      id: { not: taskId },
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
      scheduledAt: { not: null },
    },
    select: { id: true, scheduledAt: true, durationMinutes: true },
  })

  const conflictIds: string[] = []

  for (const other of overlapping) {
    if (!other.scheduledAt) continue
    const otherEnd = new Date(other.scheduledAt.getTime() + (other.durationMinutes ?? 60) * 60 * 1000)

    if (scheduledAt < otherEnd && taskEnd > other.scheduledAt) {
      const [idA, idB] = sortPairIds(taskId, other.id)

      const existing = await prisma.taskConflict.findFirst({
        where: { 
          organizationId,
          taskAId: idA, 
          taskBId: idB 
        },
      })
      if (existing) continue

      await prisma.taskConflict.create({
        data: { organizationId, taskAId: idA, taskBId: idB, conflictType: 'PROPERTY', status: 'detected' },
      })

      eventBus.emit(EVENT.TASK_CONFLICT_DETECTED, {
        taskId,
        reservationId: '',
        organizationId,
        conflictingTaskIds: [other.id],
      })

      conflictIds.push(other.id)
    }
  }

  return conflictIds
}

export async function detectStaffConflicts(
  taskId: string,
  organizationId: string,
  assignedUserId: string,
  scheduledAt: Date,
  durationMinutes: number,
): Promise<string[]> {
  const taskEnd = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000)

  const overlapping = await prisma.task.findMany({
    where: {
      organizationId,
      assignedUserId,
      id: { not: taskId },
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
      scheduledAt: { not: null },
    },
    select: { id: true, scheduledAt: true, durationMinutes: true },
  })

  const conflictIds: string[] = []

  for (const other of overlapping) {
    if (!other.scheduledAt) continue
    const otherEnd = new Date(other.scheduledAt.getTime() + (other.durationMinutes ?? 60) * 60 * 1000)

    if (scheduledAt < otherEnd && taskEnd > other.scheduledAt) {
      const [idA, idB] = sortPairIds(taskId, other.id)

      const existing = await prisma.taskConflict.findFirst({
        where: { 
          organizationId,
          taskAId: idA, 
          taskBId: idB 
        },
      })
      if (existing) continue

      await prisma.taskConflict.create({
        data: { organizationId, taskAId: idA, taskBId: idB, conflictType: 'STAFF', status: 'detected' },
      })

      conflictIds.push(other.id)
    }
  }

  return conflictIds
}

export async function acknowledgeConflict(conflictId: string, organizationId: string) {
  const conflict = await prisma.taskConflict.findFirst({
    where: { id: conflictId, organizationId, status: 'detected' },
  })
  if (!conflict) return null

  return prisma.taskConflict.update({
    where: { id: conflictId },
    data: { status: 'acknowledged', acknowledgedAt: new Date() },
  })
}

export async function resolveConflict(conflictId: string, organizationId: string, resolution: string) {
  const conflict = await prisma.taskConflict.findFirst({
    where: { id: conflictId, organizationId, status: { in: ['detected', 'acknowledged'] } },
  })
  if (!conflict) return null

  return prisma.taskConflict.update({
    where: { id: conflictId },
    data: { status: 'resolved', resolution },
  })
}

export async function listConflicts(organizationId: string, status?: string) {
  const where: Record<string, unknown> = { organizationId }
  if (status) where.status = status

  return prisma.taskConflict.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getConflictsForTask(taskId: string) {
  return prisma.taskConflict.findMany({
    where: {
      OR: [{ taskAId: taskId }, { taskBId: taskId }],
      status: { in: ['detected', 'acknowledged'] },
    },
  })
}

export function registerConflictDetectionListeners(): void {
  eventBus.on(EVENT.TASK_CREATED, async (event: { taskId: string; organizationId: string; propertyId?: string }) => {
    if (!event.propertyId) return
    try {
      const task = await prisma.task.findUnique({
        where: { id: event.taskId },
        select: { scheduledAt: true, durationMinutes: true, assignedUserId: true },
      })
      if (!task?.scheduledAt) return
      await detectPropertyConflicts(event.taskId, event.organizationId, event.propertyId, task.scheduledAt, task.durationMinutes ?? 60)
      if (task.assignedUserId) {
        await detectStaffConflicts(event.taskId, event.organizationId, task.assignedUserId, task.scheduledAt, task.durationMinutes ?? 60)
      }
    } catch (error) {
      console.error('[task-conflict] Detection failed for task', event.taskId, error)
    }
  })

  eventBus.on(EVENT.TASK_ASSIGNED, async (event: { taskId: string; organizationId: string; assignedUserId: string }) => {
    try {
      const task = await prisma.task.findUnique({
        where: { id: event.taskId },
        select: { scheduledAt: true, durationMinutes: true },
      })
      if (!task?.scheduledAt) return
      await detectStaffConflicts(event.taskId, event.organizationId, event.assignedUserId, task.scheduledAt, task.durationMinutes ?? 60)
    } catch (error) {
      console.error('[task-conflict] Staff conflict detection failed for task', event.taskId, error)
    }
  })
}
