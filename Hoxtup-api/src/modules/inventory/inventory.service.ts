import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import type { ConsumableCategory, MovementType } from '../../generated/prisma/client.js'
import { resolvePropertyScope, hasPropertyAccess } from '../../common/utils/scope.js'
import type { HoxtupRole } from '../../common/types/roles.js'

export async function listItems(
  organizationId: string,
  propertyId: string,
  actorId: string,
  actorRole: HoxtupRole,
) {
  const allowed = await hasPropertyAccess(organizationId, actorId, actorRole, propertyId)
  if (!allowed) return []

  return prisma.consumableItem.findMany({
    where: { organizationId, propertyId },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { movements: true } } },
  })
}

export async function createItem(
  organizationId: string,
  actorId: string,
  actorRole: HoxtupRole,
  input: {
    propertyId: string
    name: string
    category?: ConsumableCategory
    unit?: string
    currentQuantity?: number
    threshold?: number
    costPerUnit?: number
    estimatedPerReservation?: number
  },
) {
  const allowed = await hasPropertyAccess(organizationId, actorId, actorRole, input.propertyId)
  if (!allowed) return null

  const property = await prisma.property.findFirst({
    where: { id: input.propertyId, organizationId, archivedAt: null },
  })
  if (!property) return null

  return prisma.consumableItem.create({
    data: {
      organizationId,
      propertyId: input.propertyId,
      name: input.name,
      category: input.category ?? 'OTHER',
      unit: input.unit ?? 'unité',
      currentQuantity: input.currentQuantity ?? 0,
      threshold: input.threshold ?? 5,
      costPerUnit: input.costPerUnit,
      estimatedPerReservation: input.estimatedPerReservation,
    },
  })
}

export async function updateItem(
  itemId: string,
  organizationId: string,
  input: { name?: string; threshold?: number; costPerUnit?: number; estimatedPerReservation?: number },
) {
  const item = await prisma.consumableItem.findFirst({ where: { id: itemId, organizationId } })
  if (!item) return null

  return prisma.consumableItem.update({
    where: { id: itemId },
    data: input,
  })
}

export async function recordMovement(
  itemId: string,
  organizationId: string,
  recordedById: string,
  input: {
    type: MovementType
    quantity: number
    costCentimes?: number
    reason?: string
    note?: string
    taskId?: string
  },
) {
  const item = await prisma.consumableItem.findFirst({ where: { id: itemId, organizationId } })
  if (!item) return null

  if (input.type === 'EXIT' && item.currentQuantity < input.quantity) {
    return { error: 'insufficient_stock' as const }
  }

  const result = await prisma.$transaction(async (tx) => {
    const movement = await tx.stockMovement.create({
      data: {
        organizationId,
        itemId,
        type: input.type,
        quantity: input.quantity,
        costCentimes: input.costCentimes,
        reason: input.reason,
        note: input.note,
        taskId: input.taskId,
        recordedById,
      },
    })

    const updated = await tx.consumableItem.update({
      where: { id: itemId },
      data: {
        currentQuantity: input.type === 'ENTRY'
          ? { increment: input.quantity }
          : { decrement: input.quantity },
      },
    })

    return { movement, updatedItem: updated }
  })

  if (input.type === 'EXIT' && result.updatedItem.currentQuantity <= result.updatedItem.threshold) {
    eventBus.emit(EVENT.STOCK_ALERT, {
      itemId,
      organizationId,
      propertyId: item.propertyId,
      itemName: item.name,
      currentQuantity: result.updatedItem.currentQuantity,
      threshold: result.updatedItem.threshold,
    })
  }

  return result
}

export async function getMovements(itemId: string, organizationId: string) {
  const item = await prisma.consumableItem.findFirst({ where: { id: itemId, organizationId } })
  if (!item) return null

  return prisma.stockMovement.findMany({
    where: { itemId },
    orderBy: { recordedAt: 'desc' },
  })
}

export async function getInventorySummary(organizationId: string, propertyId: string) {
  const items = await prisma.consumableItem.findMany({
    where: { organizationId, propertyId },
  })

  const totalItems = items.length
  const belowThreshold = items.filter((i) => i.currentQuantity <= i.threshold).length
  const zeroStock = items.filter((i) => i.currentQuantity === 0).length

  const assets = await prisma.asset.findMany({
    where: { organizationId, propertyId, deletedAt: null },
  })

  const totalAssets = assets.length
  const totalInvestment = assets.reduce((sum, a) => sum + a.costCentimes, 0)

  return {
    consumables: { totalItems, belowThreshold, zeroStock },
    assets: { totalAssets, totalInvestment },
  }
}
