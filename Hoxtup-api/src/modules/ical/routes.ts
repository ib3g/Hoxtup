import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { prisma } from '../../config/database.js'
import { createICalSourceSchema } from './schema.js'
import { createICalSource, listICalSources, deleteICalSource } from './service.js'
import { logger } from '../../config/logger.js'

const router = Router({ mergeParams: true })

router.get('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const propertyId = req.params.propertyId as string

  try {
    const sources = await listICalSources(prisma, authReq.organizationId, propertyId)
    res.json(sources)
  } catch (err) {
    logger.error({ err, propertyId }, 'Failed to list iCal sources')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to list iCal sources',
    })
  }
})

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
    const source = await createICalSource(prisma, authReq.organizationId, propertyId, parsed.data)

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

router.delete('/:sourceId', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const propertyId = req.params.propertyId as string
  const sourceId = req.params.sourceId as string

  try {
    await deleteICalSource(prisma, authReq.organizationId, propertyId, sourceId)
    res.status(204).end()
  } catch (err) {
    logger.error({ err, propertyId, sourceId }, 'Failed to delete iCal source')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to delete iCal source',
    })
  }
})

export { router as icalRouter }
