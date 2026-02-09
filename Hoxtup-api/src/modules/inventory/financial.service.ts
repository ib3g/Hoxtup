import { prisma } from '../../config/database.js'
import type { RevenueSource } from '../../generated/prisma/client.js'
import { resolvePropertyScope, hasPropertyAccess } from '../../common/utils/scope.js'
import type { HoxtupRole } from '../../common/types/roles.js'

export async function addRevenue(
  organizationId: string,
  actorId: string,
  actorRole: HoxtupRole,
  input: {
    propertyId: string
    amountCentimes: number
    date: Date
    source?: RevenueSource
    notes?: string
  },
) {
  const allowed = await hasPropertyAccess(organizationId, actorId, actorRole, input.propertyId)
  if (!allowed) return null

  const property = await prisma.property.findFirst({
    where: { id: input.propertyId, organizationId, archivedAt: null },
  })
  if (!property) return null

  return prisma.revenue.create({
    data: {
      organizationId,
      propertyId: input.propertyId,
      amountCentimes: input.amountCentimes,
      date: input.date,
      source: input.source ?? 'OTHER',
      notes: input.notes,
    },
  })
}

export async function listRevenue(
  organizationId: string,
  propertyId: string,
  actorId: string,
  actorRole: HoxtupRole,
  start?: Date,
  end?: Date,
) {
  const allowed = await hasPropertyAccess(organizationId, actorId, actorRole, propertyId)
  if (!allowed) return []
  const where: Record<string, unknown> = { organizationId, propertyId }
  if (start && end) {
    where.date = { gte: start, lte: end }
  }

  return prisma.revenue.findMany({
    where,
    orderBy: { date: 'desc' },
  })
}

export async function getPropertyFinancials(
  organizationId: string,
  propertyId: string,
  actorId: string,
  actorRole: HoxtupRole,
  start: Date,
  end: Date,
) {
  const allowed = await hasPropertyAccess(organizationId, actorId, actorRole, propertyId)
  if (!allowed) return null
  const [revenues, consumableCosts, assetCosts] = await Promise.all([
    prisma.revenue.aggregate({
      where: { organizationId, propertyId, date: { gte: start, lte: end } },
      _sum: { amountCentimes: true },
      _count: true,
    }),
    prisma.stockMovement.aggregate({
      where: {
        item: { organizationId, propertyId },
        type: 'EXIT',
        recordedAt: { gte: start, lte: end },
        costCentimes: { not: null },
      },
      _sum: { costCentimes: true },
      _count: true,
    }),
    prisma.asset.aggregate({
      where: {
        organizationId,
        propertyId,
        purchaseDate: { gte: start, lte: end },
        deletedAt: null,
      },
      _sum: { costCentimes: true },
      _count: true,
    }),
  ])

  const totalRevenue = revenues._sum.amountCentimes ?? 0
  const totalConsumableCost = consumableCosts._sum.costCentimes ?? 0
  const totalAssetCost = assetCosts._sum.costCentimes ?? 0
  const totalExpenses = totalConsumableCost + totalAssetCost
  const profitLoss = totalRevenue - totalExpenses

  return {
    period: { start, end },
    revenue: { total: totalRevenue, count: revenues._count },
    expenses: {
      consumables: { total: totalConsumableCost, count: consumableCosts._count },
      assets: { total: totalAssetCost, count: assetCosts._count },
      total: totalExpenses,
    },
    profitLoss,
  }
}

export async function getOrgFinancialSummary(
  organizationId: string,
  actorId: string,
  actorRole: HoxtupRole,
  start: Date,
  end: Date,
) {
  const propertyScope = await resolvePropertyScope(organizationId, actorId, actorRole)

  const properties = await prisma.property.findMany({
    where: {
      organizationId,
      id: propertyScope ? { in: propertyScope } : undefined,
    },
    select: { id: true, name: true, archivedAt: true },
  })

  const summaries = await Promise.all(
    properties.map(async (p) => {
      const financials = await getPropertyFinancials(organizationId, p.id, actorId, actorRole, start, end)
      if (!financials) return null
      return {
        propertyId: p.id,
        propertyName: p.name,
        isArchived: p.archivedAt !== null,
        revenue: financials.revenue.total,
        consumableCosts: financials.expenses.consumables.total,
        assetCosts: financials.expenses.assets.total,
        profitLoss: financials.profitLoss,
      }
    }),
  )

  const activeSummaries = summaries.filter((s): s is Exclude<typeof s, null> => s !== null)

  const totals = activeSummaries.reduce(
    (acc, s) => ({
      revenue: acc.revenue + s.revenue,
      consumableCosts: acc.consumableCosts + s.consumableCosts,
      assetCosts: acc.assetCosts + s.assetCosts,
      profitLoss: acc.profitLoss + s.profitLoss,
    }),
    { revenue: 0, consumableCosts: 0, assetCosts: 0, profitLoss: 0 },
  )

  return { properties: activeSummaries, totals }
}
