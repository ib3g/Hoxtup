import type { PrismaClient } from '../../generated/prisma/client.js'
import type { CreatePropertyInput } from './schema.js'
import { logger } from '../../config/logger.js'

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

  const property = await db.property.create({
    data: {
      organizationId,
      name: input.name,
      address: input.address,
      type: input.type as 'APARTMENT' | 'HOUSE' | 'VILLA' | 'STUDIO' | 'ROOM' | 'OTHER',
      colorIndex: input.colorIndex,
      capacity: input.capacity,
      notes: input.notes ?? null,
    },
  })

  return property
}
