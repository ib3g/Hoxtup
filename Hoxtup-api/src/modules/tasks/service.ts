import type { PrismaClient } from '../../generated/prisma/client.js'
import type { CreateTaskInput, UpdateTaskInput } from './schema.js'
import { logger } from '../../config/logger.js'

const TASK_INCLUDE = {
  property: { select: { id: true, name: true, colorIndex: true } },
  assignedUser: { select: { id: true, name: true } },
  reservation: { select: { id: true, guestName: true, checkIn: true, checkOut: true } },
  history: {
    orderBy: { createdAt: 'asc' as const },
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      actorId: true,
      note: true,
      createdAt: true,
    },
  },
} as const

export async function listTasks(
  db: PrismaClient,
  organizationId: string,
  filters?: { propertyId?: string; status?: string; assignedUserId?: string },
) {
  return db.task.findMany({
    where: {
      organizationId,
      ...(filters?.propertyId && { propertyId: filters.propertyId }),
      ...(filters?.status && { status: filters.status as never }),
      ...(filters?.assignedUserId && { assignedUserId: filters.assignedUserId }),
    },
    include: {
      property: { select: { id: true, name: true, colorIndex: true } },
      assignedUser: { select: { id: true, name: true } },
      reservation: { select: { id: true, guestName: true, checkIn: true, checkOut: true } },
    },
    orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'desc' }],
  })
}

export async function getTask(db: PrismaClient, organizationId: string, id: string) {
  return db.task.findFirst({
    where: { id, organizationId },
    include: TASK_INCLUDE,
  })
}

export async function createTask(
  db: PrismaClient,
  organizationId: string,
  input: CreateTaskInput,
  actorId: string,
) {
  logger.info({ organizationId, title: input.title }, 'Creating task')

  return db.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        organizationId,
        propertyId: input.propertyId,
        reservationId: input.reservationId ?? null,
        title: input.title,
        description: input.description ?? null,
        type: input.type as never,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        assignedUserId: input.assignedUserId ?? null,
      },
      include: TASK_INCLUDE,
    })

    // Initial history entry: task created with PENDING_VALIDATION
    await tx.taskHistory.create({
      data: {
        organizationId,
        taskId: task.id,
        fromStatus: 'PENDING_VALIDATION' as never,
        toStatus: 'PENDING_VALIDATION' as never,
        actorId,
        note: input.assignedUserId
          ? `Tâche créée et assignée`
          : 'Tâche créée',
      },
    })

    // Refetch to include the history entry
    return tx.task.findFirstOrThrow({
      where: { id: task.id },
      include: TASK_INCLUDE,
    })
  })
}

export async function updateTask(
  db: PrismaClient,
  organizationId: string,
  id: string,
  input: UpdateTaskInput,
  actorId: string,
) {
  logger.info({ organizationId, id }, 'Updating task')

  return db.$transaction(async (tx) => {
    // Get current state before update
    const current = await tx.task.findFirstOrThrow({
      where: { id, organizationId },
      select: { status: true, assignedUserId: true, assignedUser: { select: { name: true } } },
    })

    const data: Record<string, unknown> = {}
    if (input.title !== undefined) data.title = input.title
    if (input.description !== undefined) data.description = input.description
    if (input.type !== undefined) data.type = input.type as never
    if (input.status !== undefined) data.status = input.status as never
    if (input.scheduledAt !== undefined) data.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null
    if (input.assignedUserId !== undefined) data.assignedUserId = input.assignedUserId
    if (input.note !== undefined) data.note = input.note
    if (input.status === 'IN_PROGRESS') data.startedAt = new Date()
    if (input.status === 'COMPLETED') data.completedAt = new Date()

    const task = await tx.task.update({
      where: { id, organizationId },
      data,
      include: TASK_INCLUDE,
    })

    // Log status change
    if (input.status && input.status !== current.status) {
      await tx.taskHistory.create({
        data: {
          organizationId,
          taskId: id,
          fromStatus: current.status,
          toStatus: input.status as never,
          actorId,
          note: null,
        },
      })
    }

    // Log assignment change
    if (input.assignedUserId !== undefined && input.assignedUserId !== current.assignedUserId) {
      const newAssigneeName = input.assignedUserId
        ? (await tx.user.findUnique({ where: { id: input.assignedUserId }, select: { name: true } }))?.name ?? '?'
        : null
      const previousName = current.assignedUser?.name ?? null

      let note: string
      if (!previousName && newAssigneeName) {
        note = `Assignée à ${newAssigneeName}`
      } else if (previousName && !newAssigneeName) {
        note = `Désassignée (était ${previousName})`
      } else {
        note = `Réassignée de ${previousName} à ${newAssigneeName}`
      }

      await tx.taskHistory.create({
        data: {
          organizationId,
          taskId: id,
          fromStatus: current.status,
          toStatus: (input.status ?? current.status) as never,
          actorId,
          note,
        },
      })
    }

    // Refetch to include new history entries
    return tx.task.findFirstOrThrow({
      where: { id },
      include: TASK_INCLUDE,
    })
  })
}
