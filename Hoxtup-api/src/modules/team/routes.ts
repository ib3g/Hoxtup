import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { requireRole, getActorMemberRole } from '../../common/middleware/permissions.js'
import { prisma } from '../../config/database.js'
import { listMembers, logAudit, listAuditLogs } from './service.js'
import { logger } from '../../config/logger.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const members = await listMembers(prisma, authReq.organizationId)
    res.json(members)
  } catch (err) {
    logger.error({ err, organizationId: authReq.organizationId }, 'Failed to list members')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to list members',
    })
  }
})

router.patch('/:id/role', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string
  const { role } = req.body as { role: string }

  if (!role) {
    res.status(400).json({ type: 'about:blank', title: 'Bad Request', status: 400, detail: 'role is required' })
    return
  }

  try {
    const actorRole = authReq.memberRole!

    const target = await prisma.member.findUnique({ where: { id, organizationId: authReq.organizationId } })
    if (!target) {
      res.status(404).json({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'Member not found' })
      return
    }

    // Cannot change own role
    if (target.userId === authReq.user.id) {
      res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Cannot change your own role' })
      return
    }

    // Cannot change owner's role
    if (target.role === 'owner') {
      res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Cannot change the owner role' })
      return
    }

    // Only owner can promote someone to owner
    if (role === 'owner' && actorRole !== 'owner') {
      res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Only the owner can transfer ownership' })
      return
    }

    // Ownership transfer: atomically promote target and demote current owner
    if (role === 'owner') {
      const actorMember = await prisma.member.findFirst({
        where: { userId: authReq.user.id, organizationId: authReq.organizationId },
      })
      if (!actorMember) {
        res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Actor member not found' })
        return
      }

      const [updatedTarget] = await prisma.$transaction([
        prisma.member.update({
          where: { id, organizationId: authReq.organizationId },
          data: { role: 'owner' },
          include: { user: { select: { id: true, name: true, email: true } } },
        }),
        prisma.member.update({
          where: { id: actorMember.id, organizationId: authReq.organizationId },
          data: { role: 'admin' },
        }),
      ])
      await logAudit(prisma, authReq.organizationId, authReq.user.id, 'ownership_transfer', target.userId, `Transferred ownership to ${target.userId}`)
      res.json(updatedTarget)
      return
    }

    const member = await prisma.member.update({
      where: { id, organizationId: authReq.organizationId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    await logAudit(prisma, authReq.organizationId, authReq.user.id, 'role_change', target.userId, `Changed role from ${target.role} to ${role}`)
    res.json(member)
  } catch (err) {
    logger.error({ err, id }, 'Failed to update member role')
    res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Failed to update member role' })
  }
})

router.delete('/:id', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const actorRole = authReq.memberRole!

    const target = await prisma.member.findUnique({ where: { id, organizationId: authReq.organizationId } })
    if (!target) {
      res.status(404).json({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'Member not found' })
      return
    }

    // Cannot remove yourself
    if (target.userId === authReq.user.id) {
      res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Cannot remove yourself' })
      return
    }

    // Cannot remove the owner
    if (target.role === 'owner') {
      res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Cannot remove the owner' })
      return
    }

    // Admin cannot remove another admin (only owner can)
    if (target.role === 'admin' && actorRole !== 'owner') {
      res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Only the owner can remove admins' })
      return
    }

    await prisma.member.delete({
      where: { id, organizationId: authReq.organizationId },
    })
    await logAudit(prisma, authReq.organizationId, authReq.user.id, 'member_removed', target.userId, `Removed member (role: ${target.role})`)
    res.status(204).end()
  } catch (err) {
    logger.error({ err, id }, 'Failed to remove member')
    res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Failed to remove member' })
  }
})

router.patch('/organization', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  const authReq = req as AuthenticatedRequest

  const { name, currencyCode } = req.body as { name?: string; currencyCode?: string }

  if (currencyCode && !['EUR', 'MAD'].includes(currencyCode)) {
    res.status(400).json({ type: 'about:blank', title: 'Bad Request', status: 400, detail: 'currencyCode must be EUR or MAD' })
    return
  }

  const data: Record<string, string> = {}
  if (name?.trim()) data.name = name.trim()
  if (currencyCode) data.currencyCode = currencyCode

  if (Object.keys(data).length === 0) {
    res.status(400).json({ type: 'about:blank', title: 'Bad Request', status: 400, detail: 'At least one field (name, currencyCode) is required' })
    return
  }

  try {
    const org = await prisma.organization.update({
      where: { id: authReq.organizationId },
      data,
      select: { id: true, name: true, currencyCode: true, timezone: true, createdAt: true },
    })
    await logAudit(prisma, authReq.organizationId, authReq.user.id, 'org_updated', undefined, `Updated: ${Object.keys(data).join(', ')}`)
    res.json(org)
  } catch (err) {
    logger.error({ err }, 'Failed to update organization')
    res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Failed to update organization' })
  }
})

router.get('/audit-log', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const limit = Math.min(Number(req.query.limit) || 50, 100)
  const offset = Number(req.query.offset) || 0

  try {
    const logs = await listAuditLogs(prisma, authReq.organizationId, limit, offset)
    res.json(logs)
  } catch (err) {
    logger.error({ err }, 'Failed to list audit logs')
    res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Failed to list audit logs' })
  }
})

export { router as teamRouter }
