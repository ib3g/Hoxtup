import type { PrismaClient } from '../../generated/prisma/client.js'
import type { CreateTaskInput, UpdateTaskInput } from './schema.js'
import { logger } from '../../config/logger.js'

const TASK_INCLUDE = {
  property: { select: { id: true, name: true, colorIndex: true } },
  assignedUser: { select: { id: true, name: true } },
  reservation: { select: { id: true, guestName: true, checkIn: true, checkOut: true } },
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
    include: TASK_INCLUDE,
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
) {
  logger.info({ organizationId, title: input.title }, 'Creating task')

  return db.task.create({
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
}

export async function updateTask(
  db: PrismaClient,
  organizationId: string,
  id: string,
  input: UpdateTaskInput,
) {
  logger.info({ organizationId, id }, 'Updating task')

  return db.task.update({
    where: { id, organizationId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.type !== undefined && { type: input.type as never }),
      ...(input.status !== undefined && { status: input.status as never }),
      ...(input.scheduledAt !== undefined && { scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null }),
      ...(input.assignedUserId !== undefined && { assignedUserId: input.assignedUserId }),
      ...(input.note !== undefined && { note: input.note }),
      ...(input.status === 'IN_PROGRESS' && { startedAt: new Date() }),
      ...(input.status === 'COMPLETED' && { completedAt: new Date() }),
    },
    include: TASK_INCLUDE,
  })
}
