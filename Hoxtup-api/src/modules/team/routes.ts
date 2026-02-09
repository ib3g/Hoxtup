import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { getTenantDb } from '../../config/database.js'
import { listMembers } from './service.js'
import { logger } from '../../config/logger.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const db = getTenantDb(authReq.organizationId)
    const members = await listMembers(db as never, authReq.organizationId)
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
    res.status(400).json({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: 'role is required',
    })
    return
  }

  try {
    const db = getTenantDb(authReq.organizationId)
    const member = await db.member.update({
      where: { id, organizationId: authReq.organizationId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    res.json(member)
  } catch (err) {
    logger.error({ err, id }, 'Failed to update member role')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to update member role',
    })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const db = getTenantDb(authReq.organizationId)
    await db.member.delete({
      where: { id, organizationId: authReq.organizationId },
    })
    res.status(204).end()
  } catch (err) {
    logger.error({ err, id }, 'Failed to remove member')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to remove member',
    })
  }
})

export { router as teamRouter }
