import type { PrismaClient } from '../../generated/prisma/client.js'

export async function listMembers(db: PrismaClient, organizationId: string) {
  return db.member.findMany({
    where: { organizationId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

export async function logAudit(
  db: PrismaClient,
  organizationId: string,
  actorId: string,
  action: string,
  targetId?: string,
  details?: string,
) {
  return db.teamAuditLog.create({
    data: { organizationId, actorId, action, targetId, details },
  })
}

export async function listAuditLogs(db: PrismaClient, organizationId: string, limit = 50, offset = 0) {
  return db.teamAuditLog.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
}
