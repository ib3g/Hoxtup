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

export { router as teamRouter }
