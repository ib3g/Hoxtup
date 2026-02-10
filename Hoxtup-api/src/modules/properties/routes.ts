import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { requireRole } from '../../common/middleware/permissions.js'
import { prisma } from '../../config/database.js'
import { createPropertySchema, updatePropertySchema } from './schema.js'
import { createProperty, listProperties, getProperty, updateProperty, archiveProperty, reactivateProperty } from './service.js'
import { logger } from '../../config/logger.js'

const router = Router()

router.get('/', requireAuth, requireRole('owner', 'admin', 'manager', 'member'), async (req, res) => {
  const authReq = req as AuthenticatedRequest

  try {
    const properties = await listProperties(prisma, authReq.organizationId)
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

router.post('/', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
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
    const property = await createProperty(prisma, authReq.organizationId, parsed.data)

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

router.get('/:id', requireAuth, requireRole('owner', 'admin', 'manager', 'member'), async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const property = await getProperty(prisma, authReq.organizationId, id)

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

router.patch('/:id', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
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
    const property = await updateProperty(prisma, authReq.organizationId, id, parsed.data)
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

router.delete('/:id', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    await archiveProperty(prisma, authReq.organizationId, id)
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

router.patch('/:id/reactivate', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const property = await reactivateProperty(prisma, authReq.organizationId, id)
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
