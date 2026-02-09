import type { PrismaClient } from '../../generated/prisma/client.js'
import type { CreateICalSourceInput } from './schema.js'
import { logger } from '../../config/logger.js'

export async function listICalSources(db: PrismaClient, organizationId: string, propertyId: string) {
  return db.iCalSource.findMany({
    where: { organizationId, propertyId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createICalSource(
  db: PrismaClient,
  organizationId: string,
  propertyId: string,
  input: CreateICalSourceInput,
) {
  logger.info({ organizationId, propertyId, name: input.name }, 'Creating iCal source')

  const source = await db.iCalSource.create({
    data: {
      organizationId,
      propertyId,
      name: input.name,
      url: input.url,
      syncIntervalMinutes: input.syncIntervalMinutes,
    },
  })

  return source
}

export async function deleteICalSource(db: PrismaClient, organizationId: string, propertyId: string, sourceId: string) {
  logger.info({ organizationId, propertyId, sourceId }, 'Deleting iCal source')

  return db.iCalSource.delete({
    where: { id: sourceId, organizationId, propertyId },
  })
}
