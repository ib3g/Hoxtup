import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'

const DEFAULT_FUSION_WINDOW_HOURS = 4

function sortPairIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a]
}

export async function detectFusionCandidates(
  taskId: string,
  organizationId: string,
  propertyId: string,
  scheduledAt: Date,
): Promise<string | null> {
  const windowMs = DEFAULT_FUSION_WINDOW_HOURS * 60 * 60 * 1000
  const windowStart = new Date(scheduledAt.getTime() - windowMs)
  const windowEnd = new Date(scheduledAt.getTime() + windowMs)

  const candidates = await prisma.task.findMany({
    where: {
      organizationId,
      propertyId,
      id: { not: taskId },
      status: { in: ['PENDING_VALIDATION', 'TODO'] },
      scheduledAt: { gte: windowStart, lte: windowEnd },
    },
    select: { id: true, scheduledAt: true },
  })

  for (const candidate of candidates) {
    const [idA, idB] = sortPairIds(taskId, candidate.id)

    const rejected = await prisma.fusionRejection.findFirst({
      where: { 
        organizationId, 
        taskAId: idA, 
        taskBId: idB 
      },
    })
    if (rejected) continue

    const existing = await prisma.fusionPair.findFirst({
      where: { 
        organizationId, 
        taskAId: idA, 
        taskBId: idB 
      },
    })
    if (existing) continue

    return prisma.$transaction(async (tx) => {
      const pair = await tx.fusionPair.create({
        data: {
          organizationId,
          propertyId,
          taskAId: idA,
          taskBId: idB,
          status: 'pending',
        },
      })

      await tx.task.updateMany({
        where: { id: { in: [idA, idB] }, organizationId },
        data: { status: 'FUSION_SUGGESTED', fusionPairId: pair.id },
      })

      return pair.id
    })
  }

  return null
}

export async function listFusionSuggestions(organizationId: string) {
  const pairs = await prisma.fusionPair.findMany({
    where: { organizationId, status: 'pending' },
    orderBy: { createdAt: 'desc' },
  })

  if (pairs.length === 0) return []

  const taskIds = pairs.flatMap(p => [p.taskAId, p.taskBId])
  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, organizationId },
    include: { property: { select: { id: true, name: true, colorIndex: true } } },
  })

  const taskMap = new Map(tasks.map(t => [t.id, t]))

  return pairs.map(pair => ({
    ...pair,
    taskA: taskMap.get(pair.taskAId),
    taskB: taskMap.get(pair.taskBId),
  }))
}

export async function acceptFusion(pairId: string, organizationId: string, _actorId: string) {
  return prisma.$transaction(async (tx) => {
    const pair = await tx.fusionPair.findFirst({
      where: { id: pairId, organizationId, status: 'pending' },
    })
    if (!pair) return null

    const taskA = await tx.task.findFirst({ where: { id: pair.taskAId, organizationId, status: 'FUSION_SUGGESTED' } })
    const taskB = await tx.task.findFirst({ where: { id: pair.taskBId, organizationId, status: 'FUSION_SUGGESTED' } })
    
    if (!taskA || !taskB) {
      throw new Error('Une ou plusieurs tâches ne sont plus éligibles à la fusion')
    }

    const earliestScheduled = taskA.scheduledAt && taskB.scheduledAt
      ? (taskA.scheduledAt < taskB.scheduledAt ? taskA.scheduledAt : taskB.scheduledAt)
      : taskA.scheduledAt ?? taskB.scheduledAt

    const totalDuration = (taskA.durationMinutes ?? 60) + (taskB.durationMinutes ?? 60)
    const mergedDuration = Math.round(totalDuration * 0.7)

    const mergedTask = await tx.task.create({
      data: {
        organizationId,
        propertyId: pair.propertyId,
        title: `Turnover — ${taskA.title} + ${taskB.title}`,
        type: 'TURNOVER',
        status: 'PENDING_VALIDATION',
        scheduledAt: earliestScheduled,
        durationMinutes: mergedDuration,
        description: `Fusion de: ${taskA.title} et ${taskB.title}`,
      },
    })

    await tx.task.updateMany({
      where: { id: { in: [pair.taskAId, pair.taskBId] }, organizationId },
      data: { status: 'CANCELLED', fusionPairId: pair.id },
    })

    await tx.fusionPair.update({
      where: { id: pairId },
      data: { status: 'accepted', mergedTaskId: mergedTask.id, resolvedAt: new Date() },
    })

    // Emit event after transaction
    eventBus.emit(EVENT.TASK_CREATED, {
      taskId: mergedTask.id,
      organizationId,
      propertyId: pair.propertyId,
      fusionPairId: pairId,
      timestamp: new Date(),
    })

    return { mergedTask, cancelledTaskIds: [pair.taskAId, pair.taskBId] }
  })
}

export async function rejectFusion(pairId: string, organizationId: string) {
  return prisma.$transaction(async (tx) => {
    const pair = await tx.fusionPair.findFirst({
      where: { id: pairId, organizationId, status: 'pending' },
    })
    if (!pair) return null

    const [idA, idB] = sortPairIds(pair.taskAId, pair.taskBId)

    await tx.fusionRejection.create({
      data: { organizationId, taskAId: idA, taskBId: idB },
    })

    await tx.task.updateMany({
      where: { id: { in: [pair.taskAId, pair.taskBId] }, organizationId, status: 'FUSION_SUGGESTED' },
      data: { status: 'PENDING_VALIDATION', fusionPairId: null },
    })

    await tx.fusionPair.update({
      where: { id: pairId },
      data: { status: 'rejected', resolvedAt: new Date() },
    })

    return { restoredTaskIds: [pair.taskAId, pair.taskBId] }
  })
}

export async function withdrawStaleFusions(organizationId: string): Promise<number> {
  const pending = await prisma.fusionPair.findMany({
    where: { organizationId, status: 'pending' },
  })

  let withdrawn = 0
  for (const pair of pending) {
    const [taskA, taskB] = await Promise.all([
      prisma.task.findUnique({ where: { id: pair.taskAId }, select: { scheduledAt: true, status: true } }),
      prisma.task.findUnique({ where: { id: pair.taskBId }, select: { scheduledAt: true, status: true } }),
    ])

    if (!taskA || !taskB || !taskA.scheduledAt || !taskB.scheduledAt) continue

    const windowMs = DEFAULT_FUSION_WINDOW_HOURS * 60 * 60 * 1000
    const diff = Math.abs(taskA.scheduledAt.getTime() - taskB.scheduledAt.getTime())

    if (diff >= windowMs) {
      await prisma.task.updateMany({
        where: { id: { in: [pair.taskAId, pair.taskBId] }, status: 'FUSION_SUGGESTED' },
        data: { status: 'PENDING_VALIDATION', fusionPairId: null },
      })
      await prisma.fusionPair.update({
        where: { id: pair.id },
        data: { status: 'withdrawn', resolvedAt: new Date() },
      })
      withdrawn++
    }
  }

  return withdrawn
}

export function registerFusionListeners(): void {
  eventBus.on(EVENT.TASK_CREATED, async (event: { taskId: string; organizationId: string; propertyId?: string }) => {
    if (!event.propertyId) return
    try {
      const task = await prisma.task.findUnique({ where: { id: event.taskId }, select: { scheduledAt: true } })
      if (!task?.scheduledAt) return
      await detectFusionCandidates(event.taskId, event.organizationId, event.propertyId, task.scheduledAt)
    } catch (error) {
      console.error('[task-fusion] Detection failed for task', event.taskId, error)
    }
  })
}
