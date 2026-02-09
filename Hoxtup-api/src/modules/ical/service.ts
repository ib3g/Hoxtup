import type { PrismaClient } from '../../generated/prisma/client.js'
import type { CreateICalSourceInput } from './schema.js'
import { logger } from '../../config/logger.js'

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
