import PrismaPkg from '../generated/prisma/client.js'
import type { PrismaClient as PrismaClientType } from '../generated/prisma/client.js'
const { PrismaClient, Prisma } = PrismaPkg
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from './index.js'

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: config.DATABASE_URL })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType | undefined }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export function forTenant(tenantId: string) {
  return Prisma.defineExtension((client) =>
    client.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // Performance optimization: skip transaction if not needed
            // But for RLS, we must set the config in the same session/transaction
            return client.$transaction(async (tx) => {
              await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`
              return query(args)
            })
          },
        },
      },
    }),
  )
}

export function getTenantDb(tenantId: string) {
  return prisma.$extends(forTenant(tenantId))
}
