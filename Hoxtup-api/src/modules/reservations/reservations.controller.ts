import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import { createReservationSchema, updateReservationSchema } from './reservations.validation.js'
import * as reservationsService from './reservations.service.js'

type ReservationRequest = AuthenticatedRequest & TenantRequest

export async function listReservations(req: ReservationRequest, res: Response, next: NextFunction) {
  try {
    const filters = {
      propertyId: req.query.propertyId as string | undefined,
      sourceType: req.query.sourceType as string | undefined,
      status: req.query.status as string | undefined,
    }
    const reservations = await reservationsService.listReservations(req.tenantId, filters)
    res.json({ reservations, total: reservations.length })
  } catch (error) {
    next(error)
  }
}

export async function getReservation(req: ReservationRequest, res: Response, next: NextFunction) {
  try {
    const reservation = await reservationsService.getReservationById(req.params.id as string, req.tenantId)
    if (!reservation) {
      res.status(404).json({ type: 'not-found', title: 'Réservation introuvable', status: 404 })
      return
    }
    res.json(reservation)
  } catch (error) {
    next(error)
  }
}

export async function createReservation(req: ReservationRequest, res: Response, next: NextFunction) {
  try {
    const input = createReservationSchema.parse(req.body)

    const overlaps = await reservationsService.checkOverlap(input.propertyId, req.tenantId, input.checkIn, input.checkOut)
    const reservation = await reservationsService.createReservation(req.tenantId, input)
    if (!reservation) {
      res.status(404).json({ type: 'not-found', title: 'Propriété introuvable', status: 404 })
      return
    }

    res.status(201).json({
      ...reservation,
      _overlaps: overlaps.length > 0 ? overlaps.map((o) => ({ id: o.id, guestName: o.guestName, checkIn: o.checkIn, checkOut: o.checkOut })) : undefined,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateReservation(req: ReservationRequest, res: Response, next: NextFunction) {
  try {
    const input = updateReservationSchema.parse(req.body)
    const reservation = await reservationsService.updateReservation(req.params.id as string, req.tenantId, input)
    if (!reservation) {
      res.status(404).json({ type: 'not-found', title: 'Réservation introuvable ou non modifiable', status: 404 })
      return
    }
    res.json(reservation)
  } catch (error) {
    next(error)
  }
}

export async function cancelReservation(req: ReservationRequest, res: Response, next: NextFunction) {
  try {
    const reservation = await reservationsService.cancelReservation(req.params.id as string, req.tenantId)
    if (!reservation) {
      res.status(404).json({ type: 'not-found', title: 'Réservation introuvable ou non annulable', status: 404 })
      return
    }
    res.json({ id: reservation.id, cancelled: true })
  } catch (error) {
    next(error)
  }
}
