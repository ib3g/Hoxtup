import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import type { IncidentType } from '../../generated/prisma/client.js'

export async function reportIncident(
  taskId: string,
  organizationId: string,
  reporterId: string,
  type: IncidentType,
  description?: string,
  photoUrl?: string,
) {
  // 1. Initial check outside transaction
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId, status: 'IN_PROGRESS' },
  })
  if (!task) return null

  // 2. Atomic transaction for data integrity
  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.incident.create({
      data: {
        organizationId,
        taskId,
        reporterId,
        type,
        description,
        photoUrl,
      },
    })

    await tx.task.update({
      where: { id: taskId, organizationId },
      data: { status: 'INCIDENT' },
    })

    await tx.taskHistory.create({
      data: {
        organizationId,
        taskId,
        fromStatus: task.status,
        toStatus: 'INCIDENT',
        actorId: reporterId,
        note: `Incident: ${type}${description ? ' — ' + description : ''}`,
      },
    })

    return { created, propertyId: task.propertyId }
  })

  // 3. Emit event after successful commit
  eventBus.emit(EVENT.TASK_INCIDENT_REPORTED, {
    taskId,
    organizationId,
    propertyId: result.propertyId,
    actorId: reporterId,
    timestamp: new Date(),
  })

  return result.created
}

export async function resolveIncident(
  incidentId: string,
  organizationId: string,
  resolvedById: string,
  resolution: string,
  createRepairTask?: boolean,
) {
  return prisma.$transaction(async (tx) => {
    const incident = await tx.incident.findFirst({
      where: { id: incidentId, organizationId, status: 'open' },
    })
    if (!incident) return null

    const updated = await tx.incident.update({
      where: { id: incidentId },
      data: { status: 'resolved', resolution, resolvedById, resolvedAt: new Date() },
    })

    let repairTask = null
    if (createRepairTask) {
      const task = await tx.task.findFirst({ where: { id: incident.taskId, organizationId } })
      if (task) {
        repairTask = await tx.task.create({
          data: {
            organizationId,
            propertyId: task.propertyId,
            title: `Réparation — ${incident.type}: ${incident.description ?? 'Incident'}`,
            type: 'MAINTENANCE',
            status: 'TODO',
            description: `Créé depuis l'incident ${incidentId}`,
          },
        })
      }
    }

    return { incident: updated, repairTask }
  })
}

export async function listIncidents(organizationId: string, status?: string) {
  const where: Record<string, unknown> = { organizationId }
  if (status) where.status = status

  return prisma.incident.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getIncidentsByTask(taskId: string, organizationId: string) {
  return prisma.incident.findMany({
    where: { taskId, organizationId },
    orderBy: { createdAt: 'desc' },
  })
}
