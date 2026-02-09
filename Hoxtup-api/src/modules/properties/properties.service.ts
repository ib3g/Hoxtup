import { prisma } from '../../config/database.js'
import type { CreatePropertyInput, UpdatePropertyInput } from './properties.validation.js'
import { createDefaultRulesForProperty } from '../tasks/task-auto-generator.service.js'

const PROPERTY_COLORS = [
  '#4A90D9', '#E67E22', '#27AE60', '#8E44AD',
  '#E74C3C', '#F39C12', '#1ABC9C', '#34495E',
] as const

export async function listProperties(organizationId: string, scopePropertyIds: string[] | null, includeArchived = false) {
  const where: Record<string, unknown> = { organizationId }

  if (!includeArchived) {
    where.archivedAt = null
  }

  if (scopePropertyIds !== null) {
    where.id = { in: scopePropertyIds }
  }

  return prisma.property.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { assignments: true } },
    },
  })
}

export async function getPropertyById(id: string, organizationId: string) {
  return prisma.property.findFirst({
    where: { id, organizationId, archivedAt: null },
    include: {
      assignments: { select: { userId: true } },
    },
  })
}

export async function createProperty(organizationId: string, input: CreatePropertyInput) {
  return prisma.$transaction(async (tx) => {
    const count = await tx.property.count({ where: { organizationId } })
    const colorIndex = count % PROPERTY_COLORS.length

    const property = await tx.property.create({
      data: {
        organizationId,
        name: input.name,
        address: input.address,
        capacity: input.capacity,
        type: input.type,
        colorIndex,
        notes: input.notes,
      },
      include: {
        assignments: { select: { userId: true } },
      },
    })

    await createDefaultRulesForProperty(property.id, organizationId, property.name, tx)

    return property
  })
}

export async function updateProperty(id: string, organizationId: string, input: UpdatePropertyInput) {
  const property = await prisma.property.findFirst({
    where: { id, organizationId, archivedAt: null },
    include: {
      assignments: { select: { userId: true } },
    },
  })
  if (!property) return null

  return prisma.property.update({
    where: { id },
    data: input,
    include: {
      assignments: { select: { userId: true } },
    },
  })
}

export async function archiveProperty(id: string, organizationId: string, actorId: string) {
  const property = await prisma.property.findFirst({
    where: { id, organizationId, archivedAt: null },
  })
  if (!property) return null

  return prisma.$transaction(async (tx) => {
    await tx.propertyAssignment.deleteMany({ where: { propertyId: id } })

    const updated = await tx.property.update({
      where: { id },
      data: { archivedAt: new Date() },
    })

    await tx.teamAuditLog.create({
      data: {
        organizationId,
        actorId,
        targetId: id,
        action: 'PROPERTY_ARCHIVED',
        details: `Archived property: ${property.name}`,
      },
    })

    return updated
  })
}

export async function reactivateProperty(id: string, organizationId: string, actorId: string) {
  const property = await prisma.property.findFirst({
    where: { id, organizationId, archivedAt: { not: null } },
  })
  if (!property) return null

  return prisma.$transaction(async (tx) => {
    const updated = await tx.property.update({
      where: { id },
      data: { archivedAt: null },
    })

    await tx.teamAuditLog.create({
      data: {
        organizationId,
        actorId,
        targetId: id,
        action: 'PROPERTY_REACTIVATED',
        details: `Reactivated property: ${property.name}`,
      },
    })

    return updated
  })
}

export { PROPERTY_COLORS }
