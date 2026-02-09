import { prisma } from '../../config/database.js'
import type { AssetCategory } from '../../generated/prisma/client.js'
import { hasPropertyAccess } from '../../common/utils/scope.js'
import type { HoxtupRole } from '../../common/types/roles.js'

export async function listAssets(
  organizationId: string,
  propertyId: string,
  actorId: string,
  actorRole: HoxtupRole,
  includeDeleted = false,
) {
  const allowed = await hasPropertyAccess(organizationId, actorId, actorRole, propertyId)
  if (!allowed) return []
  const where: Record<string, unknown> = { organizationId, propertyId }
  if (!includeDeleted) where.deletedAt = null

  return prisma.asset.findMany({
    where,
    orderBy: [{ category: 'asc' }, { purchaseDate: 'desc' }],
  })
}

export async function createAsset(
  organizationId: string,
  actorId: string,
  actorRole: HoxtupRole,
  input: {
    propertyId: string
    name: string
    category?: AssetCategory
    purchaseDate: Date
    costCentimes: number
    supplier?: string
    notes?: string
  },
) {
  const allowed = await hasPropertyAccess(organizationId, actorId, actorRole, input.propertyId)
  if (!allowed) return null

  const property = await prisma.property.findFirst({
    where: { id: input.propertyId, organizationId, archivedAt: null },
  })
  if (!property) return null

  return prisma.asset.create({
    data: {
      organizationId,
      propertyId: input.propertyId,
      name: input.name,
      category: input.category ?? 'OTHER',
      purchaseDate: input.purchaseDate,
      costCentimes: input.costCentimes,
      supplier: input.supplier,
      notes: input.notes,
    },
  })
}

export async function updateAsset(
  assetId: string,
  organizationId: string,
  input: { name?: string; category?: AssetCategory; costCentimes?: number; supplier?: string; notes?: string },
) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId, organizationId, deletedAt: null } })
  if (!asset) return null

  return prisma.asset.update({
    where: { id: assetId },
    data: input,
  })
}

export async function softDeleteAsset(assetId: string, organizationId: string) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId, organizationId, deletedAt: null } })
  if (!asset) return null

  return prisma.asset.update({
    where: { id: assetId },
    data: { deletedAt: new Date() },
  })
}
