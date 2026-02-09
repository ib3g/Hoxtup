import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { getTenantDb } from '../../config/database.js'
import { createPropertySchema, updatePropertySchema } from './schema.js'
import { createProperty, listProperties, getProperty, updateProperty, archiveProperty, reactivateProperty } from './service.js'
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

router.get('/:id', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const db = getTenantDb(authReq.organizationId)
    const property = await getProperty(db as never, authReq.organizationId, id)

    if (!property) {
      res.status(404).json({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'Property not found',
      })
      return
    }

    res.json(property)
  } catch (err) {
    logger.error({ err, id }, 'Failed to get property')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to get property',
    })
  }
})

router.patch('/:id', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  const parsed = updatePropertySchema.safeParse(req.body)
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
    const property = await updateProperty(db as never, authReq.organizationId, id, parsed.data)
    res.json(property)
  } catch (err) {
    logger.error({ err, id }, 'Failed to update property')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to update property',
    })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const db = getTenantDb(authReq.organizationId)
    await archiveProperty(db as never, authReq.organizationId, id)
    res.status(204).end()
  } catch (err) {
    logger.error({ err, id }, 'Failed to archive property')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to archive property',
    })
  }
})

router.patch('/:id/reactivate', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const db = getTenantDb(authReq.organizationId)
    const property = await reactivateProperty(db as never, authReq.organizationId, id)
    res.json(property)
  } catch (err) {
    logger.error({ err, id }, 'Failed to reactivate property')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to reactivate property',
    })
  }
})

export { router as propertiesRouter }
