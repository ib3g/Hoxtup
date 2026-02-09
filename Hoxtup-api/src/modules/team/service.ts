import type { PrismaClient } from '../../generated/prisma/client.js'

export async function listMembers(db: PrismaClient, organizationId: string) {
  return db.member.findMany({
    where: { organizationId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })
}
