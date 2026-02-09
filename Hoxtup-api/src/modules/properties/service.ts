import type { PrismaClient } from '../../generated/prisma/client.js'
import type { CreatePropertyInput, UpdatePropertyInput } from './schema.js'
import { logger } from '../../config/logger.js'

async function getNextColorIndex(db: PrismaClient, organizationId: string): Promise<number> {
  const count = await db.property.count({ where: { organizationId } })
  return count % 5
}

export async function listProperties(db: PrismaClient, organizationId: string) {
  return db.property.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createProperty(
  db: PrismaClient,
  organizationId: string,
  input: CreatePropertyInput,
) {
  logger.info({ organizationId, name: input.name }, 'Creating property')

  const colorIndex = input.colorIndex ?? await getNextColorIndex(db, organizationId)

  const property = await db.property.create({
    data: {
      organizationId,
      name: input.name,
      address: input.address,
      type: input.type as 'APARTMENT' | 'HOUSE' | 'VILLA' | 'STUDIO' | 'ROOM' | 'OTHER',
      colorIndex,
      capacity: input.capacity,
      notes: input.notes ?? null,
    },
  })

  return property
}

export async function getProperty(db: PrismaClient, organizationId: string, id: string) {
  return db.property.findFirst({
    where: { id, organizationId },
  })
}

export async function updateProperty(
  db: PrismaClient,
  organizationId: string,
  id: string,
  input: UpdatePropertyInput,
) {
  logger.info({ organizationId, id }, 'Updating property')

  return db.property.update({
    where: { id, organizationId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.type !== undefined && { type: input.type as 'APARTMENT' | 'HOUSE' | 'VILLA' | 'STUDIO' | 'ROOM' | 'OTHER' }),
      ...(input.colorIndex !== undefined && { colorIndex: input.colorIndex }),
      ...(input.capacity !== undefined && { capacity: input.capacity }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
  })
}

export async function archiveProperty(db: PrismaClient, organizationId: string, id: string) {
  logger.info({ organizationId, id }, 'Archiving property')

  return db.property.update({
    where: { id, organizationId },
    data: { archivedAt: new Date() },
  })
}

export async function reactivateProperty(db: PrismaClient, organizationId: string, id: string) {
  logger.info({ organizationId, id }, 'Reactivating property')

  return db.property.update({
    where: { id, organizationId },
    data: { archivedAt: null },
  })
}
