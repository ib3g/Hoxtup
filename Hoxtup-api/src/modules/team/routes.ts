import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { prisma } from '../../config/database.js'
import { listMembers } from './service.js'
import { logger } from '../../config/logger.js'

const router = Router()

const CAN_MANAGE_ROLES = ['owner', 'admin']

async function getActorMemberRole(userId: string, organizationId: string): Promise<string | null> {
  const member = await prisma.member.findFirst({
    where: { userId, organizationId },
    select: { role: true },
  })
  return member?.role ?? null
}

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

router.patch('/:id/role', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string
  const { role } = req.body as { role: string }

  if (!role) {
    res.status(400).json({ type: 'about:blank', title: 'Bad Request', status: 400, detail: 'role is required' })
    return
  }

  try {
    // Check actor permission
    const actorRole = await getActorMemberRole(authReq.user.id, authReq.organizationId)
    if (!actorRole || !CAN_MANAGE_ROLES.includes(actorRole)) {
      res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Only owners and admins can change roles' })
      return
    }

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

    const member = await prisma.member.update({
      where: { id, organizationId: authReq.organizationId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    res.json(member)
  } catch (err) {
    logger.error({ err, id }, 'Failed to update member role')
    res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Failed to update member role' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    // Check actor permission
    const actorRole = await getActorMemberRole(authReq.user.id, authReq.organizationId)
    if (!actorRole || !CAN_MANAGE_ROLES.includes(actorRole)) {
      res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Only owners and admins can remove members' })
      return
    }

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
    res.status(204).end()
  } catch (err) {
    logger.error({ err, id }, 'Failed to remove member')
    res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Failed to remove member' })
  }
})

router.patch('/organization', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  // Check actor permission via member role (not user role)
  const actorRole = await getActorMemberRole(authReq.user.id, authReq.organizationId)
  if (!actorRole || !CAN_MANAGE_ROLES.includes(actorRole)) {
    res.status(403).json({ type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Only owners and admins can update organization settings' })
    return
  }

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
    res.json(org)
  } catch (err) {
    logger.error({ err }, 'Failed to update organization')
    res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Failed to update organization' })
  }
})

export { router as teamRouter }
