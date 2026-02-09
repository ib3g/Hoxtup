import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth.js'
import { getTenantDb } from '../../config/database.js'
import { createReservationSchema, updateReservationSchema } from './schema.js'
import { listReservations, getReservation, createReservation, updateReservation, cancelReservation } from './service.js'
import { logger } from '../../config/logger.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const propertyId = req.query.propertyId as string | undefined
  const status = req.query.status as string | undefined

  try {
    const db = getTenantDb(authReq.organizationId)
    const reservations = await listReservations(db as never, authReq.organizationId, { propertyId, status })
    res.json(reservations)
  } catch (err) {
    logger.error({ err, organizationId: authReq.organizationId }, 'Failed to list reservations')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to list reservations',
    })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const db = getTenantDb(authReq.organizationId)
    const reservation = await getReservation(db as never, authReq.organizationId, id)

    if (!reservation) {
      res.status(404).json({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'Reservation not found',
      })
      return
    }

    res.json(reservation)
  } catch (err) {
    logger.error({ err, id }, 'Failed to get reservation')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to get reservation',
    })
  }
})

router.post('/', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  const parsed = createReservationSchema.safeParse(req.body)
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
    const reservation = await createReservation(db as never, authReq.organizationId, parsed.data)
    res.status(201).json(reservation)
  } catch (err) {
    logger.error({ err, organizationId: authReq.organizationId }, 'Failed to create reservation')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to create reservation',
    })
  }
})

router.patch('/:id', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  const parsed = updateReservationSchema.safeParse(req.body)
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
    const reservation = await updateReservation(db as never, authReq.organizationId, id, parsed.data)
    res.json(reservation)
  } catch (err) {
    logger.error({ err, id }, 'Failed to update reservation')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to update reservation',
    })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const id = req.params.id as string

  try {
    const db = getTenantDb(authReq.organizationId)
    await cancelReservation(db as never, authReq.organizationId, id)
    res.status(204).end()
  } catch (err) {
    logger.error({ err, id }, 'Failed to cancel reservation')
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to cancel reservation',
    })
  }
})

export { router as reservationsRouter }
