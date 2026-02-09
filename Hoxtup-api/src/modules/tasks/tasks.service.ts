import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import { getNextStatus, getAllowedActions } from './task-state-machine.js'
import type { TaskAction } from './task-state-machine.js'
import type { CreateTaskInput } from './tasks.validation.js'
import type { TaskStatus } from '../../generated/prisma/client.js'
import type { HoxtupRole } from '../../common/types/roles.js'

export async function listTasks(organizationId: string, filters?: { propertyId?: string; status?: string; assignedUserId?: string }) {
  const where: Record<string, unknown> = { organizationId }

  if (filters?.propertyId) where.propertyId = filters.propertyId
  if (filters?.status) where.status = filters.status
  if (filters?.assignedUserId) where.assignedUserId = filters.assignedUserId

  return prisma.task.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
    include: {
      property: { select: { id: true, name: true, colorIndex: true } },
      assignedUser: { select: { id: true, name: true, firstName: true, lastName: true } },
    },
  })
}

export async function getTaskById(id: string, organizationId: string) {
  return prisma.task.findFirst({
    where: { id, organizationId },
    include: {
      property: { select: { id: true, name: true, colorIndex: true } },
      assignedUser: { select: { id: true, name: true, firstName: true, lastName: true } },
      history: { orderBy: { createdAt: 'desc' } },
    },
  })
}

export async function createTask(organizationId: string, input: CreateTaskInput) {
  const property = await prisma.property.findFirst({
    where: { id: input.propertyId, organizationId, archivedAt: null },
  })
  if (!property) return null

  return prisma.task.create({
    data: {
      organizationId,
      propertyId: input.propertyId,
      reservationId: input.reservationId,
      assignedUserId: input.assignedUserId,
      title: input.title,
      description: input.description,
      type: input.type,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      status: 'PENDING_VALIDATION',
    },
    include: {
      property: { select: { id: true, name: true, colorIndex: true } },
      assignedUser: { select: { id: true, name: true, firstName: true, lastName: true } },
    },
  })
}

export interface TransitionResult {
  success: true
  task: Awaited<ReturnType<typeof getTaskById>>
}

export interface TransitionError {
  success: false
  reason: 'not_found' | 'invalid_transition'
  allowedActions?: TaskAction[]
  currentStatus?: TaskStatus
}

export async function transitionTask(
  id: string,
  organizationId: string,
  actorId: string,
  action: TaskAction,
  note?: string,
): Promise<TransitionResult | TransitionError> {
  const now = new Date()
  
  const result = await prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: { id, organizationId },
    })

    if (!task) {
      return { success: false as const, reason: 'not_found' as const }
    }

    const nextStatus = getNextStatus(task.status, action)

    if (!nextStatus) {
      return {
        success: false as const,
        reason: 'invalid_transition' as const,
        allowedActions: getAllowedActions(task.status),
        currentStatus: task.status,
      }
    }

    const updateData: Record<string, unknown> = { status: nextStatus }

    if (nextStatus === 'IN_PROGRESS' && !task.startedAt) {
      updateData.startedAt = now
    }

    if (nextStatus === 'COMPLETED') {
      updateData.completedAt = now
      if (task.startedAt) {
        updateData.durationMinutes = Math.round((now.getTime() - task.startedAt.getTime()) / 60_000)
      }
    }

    if (note) {
      updateData.note = note
    }

    await tx.task.update({
      where: { id, organizationId },
      data: updateData,
    })

    await tx.taskHistory.create({
      data: {
        organizationId,
        taskId: id,
        fromStatus: task.status,
        toStatus: nextStatus,
        actorId,
        note,
        isProxy: false,
      },
    })

    const updated = await tx.task.findFirst({
      where: { id, organizationId },
      include: {
        property: { select: { id: true, name: true, colorIndex: true } },
        assignedUser: { select: { id: true, name: true, firstName: true, lastName: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
    })

    return { success: true as const, task: updated, oldStatus: task.status, nextStatus, propertyId: task.propertyId }
  })

  if (result.success) {
    eventBus.emit(EVENT.TASK_STATE_CHANGED, {
      taskId: id,
      organizationId,
      previousStatus: result.oldStatus,
      newStatus: result.nextStatus,
      action,
      actorId,
      timestamp: now,
    })

    if (action === 'report_incident') {
      eventBus.emit(EVENT.TASK_INCIDENT_REPORTED, {
        taskId: id,
        organizationId,
        propertyId: result.propertyId,
        actorId,
        timestamp: now,
      })
    }

    return { success: true, task: result.task as unknown as TransitionResult['task'] }
  }

  return result
}

export async function proxyTransitionTask(
  id: string,
  organizationId: string,
  actorId: string,
  actorRole: HoxtupRole,
  onBehalfOfId: string,
  action: TaskAction,
  note?: string,
): Promise<TransitionResult | TransitionError | { success: false; reason: 'scope_violation' }> {
  const now = new Date()

  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch task and validate organization
    const task = await tx.task.findFirst({ where: { id, organizationId } })
    if (!task) return { success: false as const, reason: 'not_found' as const }

    // 2. Validate onBehalfOfId belongs to the same organization
    const proxyUser = await tx.user.findFirst({
      where: { id: onBehalfOfId, organizationId },
    })
    if (!proxyUser) {
      return { success: false as const, reason: 'scope_violation' as const }
    }

    // 3. Manager scope check
    if (actorRole === 'manager') {
      const actorAssignments = await tx.propertyAssignment.findMany({
        where: { userId: actorId, organizationId },
        select: { propertyId: true },
      })
      if (!actorAssignments.some((a) => a.propertyId === task.propertyId)) {
        return { success: false as const, reason: 'scope_violation' as const }
      }
    }

    // 4. State machine validation
    const nextStatus = getNextStatus(task.status, action)
    if (!nextStatus) {
      return {
        success: false as const,
        reason: 'invalid_transition' as const,
        allowedActions: getAllowedActions(task.status),
        currentStatus: task.status,
      }
    }

    // 5. Prepare update
    const updateData: Record<string, unknown> = { status: nextStatus }
    if (nextStatus === 'IN_PROGRESS' && !task.startedAt) updateData.startedAt = now
    if (nextStatus === 'COMPLETED') {
      updateData.completedAt = now
      if (task.startedAt) updateData.durationMinutes = Math.round((now.getTime() - task.startedAt.getTime()) / 60_000)
    }
    if (note) updateData.note = note

    // 6. Execute updates
    await tx.task.update({ 
      where: { id, organizationId }, 
      data: updateData 
    })

    await tx.taskHistory.create({
      data: {
        organizationId,
        taskId: id,
        fromStatus: task.status,
        toStatus: nextStatus,
        actorId,
        note: note ?? `Proxy action by ${actorId} on behalf of ${onBehalfOfId}`,
        isProxy: true,
        onBehalfOfId,
      },
    })

    const updated = await tx.task.findFirst({
      where: { id, organizationId },
      include: {
        property: { select: { id: true, name: true, colorIndex: true } },
        assignedUser: { select: { id: true, name: true, firstName: true, lastName: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
    })

    return { 
      success: true as const, 
      task: updated, 
      oldStatus: task.status, 
      nextStatus, 
      propertyId: task.propertyId 
    }
  })

  if (result.success) {
    eventBus.emit(EVENT.TASK_STATE_CHANGED, {
      taskId: id,
      organizationId,
      previousStatus: result.oldStatus,
      newStatus: result.nextStatus,
      action,
      actorId,
      timestamp: now,
    })

    return { success: true, task: result.task as unknown as TransitionResult['task'] }
  }

  return result
}

export async function getMyTasks(organizationId: string, userId: string) {
  return prisma.task.findMany({
    where: { organizationId, assignedUserId: userId },
    orderBy: { scheduledAt: 'asc' },
    include: {
      property: { select: { id: true, name: true, colorIndex: true } },
    },
  })
}

export async function listTasksScoped(
  organizationId: string,
  userId: string,
  role: HoxtupRole,
  filters?: { propertyId?: string; status?: string; assignedUserId?: string },
) {
  const where: Record<string, unknown> = { organizationId }

  if (role === 'staff_autonomous' || role === 'staff_managed') {
    where.assignedUserId = userId
  } else if (role === 'manager') {
    const assignments = await prisma.propertyAssignment.findMany({
      where: { userId },
      select: { propertyId: true },
    })
    where.propertyId = { in: assignments.map((a) => a.propertyId) }
  }

  if (filters?.propertyId) where.propertyId = filters.propertyId
  if (filters?.status) where.status = filters.status
  if (filters?.assignedUserId) where.assignedUserId = filters.assignedUserId

  return prisma.task.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
    include: {
      property: { select: { id: true, name: true, colorIndex: true } },
      assignedUser: { select: { id: true, name: true, firstName: true, lastName: true } },
    },
  })
}

interface AssignResult {
  success: true
  task: Awaited<ReturnType<typeof getTaskById>>
}

interface AssignError {
  success: false
  reason: 'not_found' | 'invalid_assignee' | 'scope_violation'
}

export async function assignTask(
  taskId: string,
  organizationId: string,
  assignedUserId: string,
  actorId: string,
  actorRole: HoxtupRole,
): Promise<AssignResult | AssignError> {
  const task = await prisma.task.findFirst({ where: { id: taskId, organizationId } })
  if (!task) return { success: false, reason: 'not_found' }

  const member = await prisma.member.findFirst({
    where: { userId: assignedUserId, organizationId },
  })
  if (!member) return { success: false, reason: 'invalid_assignee' }

  if (actorRole === 'manager') {
    const actorAssignments = await prisma.propertyAssignment.findMany({
      where: { userId: actorId },
      select: { propertyId: true },
    })
    const scopePropertyIds = actorAssignments.map((a) => a.propertyId)
    if (!scopePropertyIds.includes(task.propertyId)) {
      return { success: false, reason: 'scope_violation' }
    }
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { assignedUserId },
  })

  eventBus.emit(EVENT.TASK_ASSIGNED, {
    taskId,
    organizationId,
    assignedUserId,
    actorId,
    timestamp: new Date(),
  })

  const updated = await getTaskById(taskId, organizationId)
  return { success: true, task: updated }
}

export async function bulkAssignTasks(
  taskIds: string[],
  organizationId: string,
  assignedUserId: string,
  actorId: string,
  actorRole: HoxtupRole,
): Promise<{ success: true; count: number } | AssignError> {
  const member = await prisma.member.findFirst({
    where: { userId: assignedUserId, organizationId },
  })
  if (!member) return { success: false, reason: 'invalid_assignee' }

  let scopePropertyIds: string[] | null = null
  if (actorRole === 'manager') {
    const actorAssignments = await prisma.propertyAssignment.findMany({
      where: { userId: actorId },
      select: { propertyId: true },
    })
    scopePropertyIds = actorAssignments.map((a) => a.propertyId)
  }

  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, organizationId },
    select: { id: true, propertyId: true },
  })

  if (tasks.length !== taskIds.length) {
    return { success: false, reason: 'not_found' }
  }

  if (scopePropertyIds) {
    const outOfScope = tasks.some((t) => !scopePropertyIds!.includes(t.propertyId))
    if (outOfScope) return { success: false, reason: 'scope_violation' }
  }

  await prisma.task.updateMany({
    where: { id: { in: taskIds }, organizationId },
    data: { assignedUserId },
  })

  for (const t of tasks) {
    eventBus.emit(EVENT.TASK_ASSIGNED, {
      taskId: t.id,
      organizationId,
      assignedUserId,
      actorId,
      timestamp: new Date(),
    })
  }

  return { success: true, count: tasks.length }
}
