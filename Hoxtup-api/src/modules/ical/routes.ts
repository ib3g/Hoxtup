import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { getTenantDb } from '../../config/database.js'
import { createICalSourceSchema } from './schema.js'
import { createICalSource } from './service.js'
import { logger } from '../../config/logger.js'

const router = Router({ mergeParams: true })

router.post('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const propertyId = req.params.propertyId as string

  if (!propertyId) {
    res.status(400).json({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: 'Property ID is required',
    })
    return
  }

  const parsed = createICalSourceSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      type: 'about:blank',
      title: 'Validation Error',
      status: 400,
      detail: 'Invalid request body',
      errors: parsed.error.issues,
    })
    return
  }

  try {
    const db = getTenantDb(authReq.organizationId)
    const source = await createICalSource(db as never, authReq.organizationId, propertyId, parsed.data)

    res.status(201).json(source)
  } catch (err) {
    logger.error({ err, organizationId: authReq.organizationId, propertyId }, 'Failed to create iCal source')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to create iCal source',
    })
  }
})

export { router as icalRouter }
