import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { getTenantDb } from '../../config/database.js'
import { createPropertySchema } from './schema.js'
import { createProperty, listProperties } from './service.js'
import { logger } from '../../config/logger.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const db = getTenantDb(authReq.organizationId)
    const properties = await listProperties(db as never, authReq.organizationId)
    res.json(properties)
  } catch (err) {
    logger.error({ err, organizationId: authReq.organizationId }, 'Failed to list properties')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to list properties',
    })
  }
})

router.post('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  const parsed = createPropertySchema.safeParse(req.body)
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
    const property = await createProperty(db as never, authReq.organizationId, parsed.data)

    res.status(201).json(property)
  } catch (err) {
    logger.error({ err, organizationId: authReq.organizationId }, 'Failed to create property')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to create property',
    })
  }
})

export { router as propertiesRouter }
