import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import type { CreateReservationInput, UpdateReservationInput } from './reservations.validation.js'

export async function listReservations(organizationId: string, filters?: { propertyId?: string; sourceType?: string; status?: string }) {
  const where: Record<string, unknown> = { organizationId }

  if (filters?.propertyId) where.propertyId = filters.propertyId
  if (filters?.sourceType) where.sourceType = filters.sourceType
  if (filters?.status) where.status = filters.status

  return prisma.reservation.findMany({
    where,
    orderBy: { checkIn: 'asc' },
    include: { property: { select: { id: true, name: true, colorIndex: true } } },
  })
}

export async function getReservationById(id: string, organizationId: string) {
  return prisma.reservation.findFirst({
    where: { id, organizationId },
    include: { property: { select: { id: true, name: true, colorIndex: true } } },
  })
}

export async function checkOverlap(propertyId: string, organizationId: string, checkIn: Date, checkOut: Date, excludeId?: string) {
  const where: Record<string, unknown> = {
    organizationId,
    propertyId,
    status: 'CONFIRMED',
    checkIn: { lt: checkOut },
    checkOut: { gt: checkIn },
  }
  if (excludeId) {
    where.id = { not: excludeId }
  }

  return prisma.reservation.findMany({ where })
}

export async function createReservation(organizationId: string, input: CreateReservationInput) {
  const property = await prisma.property.findFirst({
    where: { id: input.propertyId, organizationId, archivedAt: null },
  })
  if (!property) return null

  const reservation = await prisma.reservation.create({
    data: {
      organizationId,
      propertyId: input.propertyId,
      guestName: input.guestName,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      status: 'CONFIRMED',
      sourceType: 'MANUAL',
    },
  })

  eventBus.emit(EVENT.RESERVATION_CREATED, {
    reservationId: reservation.id,
    propertyId: reservation.propertyId,
    organizationId,
    guestName: reservation.guestName,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
  })

  return reservation
}

export async function updateReservation(id: string, organizationId: string, input: UpdateReservationInput) {
  const reservation = await prisma.reservation.findFirst({
    where: { id, organizationId, sourceType: 'MANUAL', status: 'CONFIRMED' },
  })
  if (!reservation) return null

  const updated = await prisma.reservation.update({
    where: { id },
    data: input,
  })

  eventBus.emit(EVENT.RESERVATION_UPDATED, {
    reservationId: updated.id,
    propertyId: updated.propertyId,
    organizationId,
    guestName: updated.guestName,
    checkIn: updated.checkIn,
    checkOut: updated.checkOut,
    oldCheckIn: reservation.checkIn,
    oldCheckOut: reservation.checkOut,
    source: 'manual' as const,
  })

  return updated
}

export async function cancelReservation(id: string, organizationId: string) {
  const reservation = await prisma.reservation.findFirst({
    where: { id, organizationId, sourceType: 'MANUAL', status: 'CONFIRMED' },
  })
  if (!reservation) return null

  const cancelled = await prisma.reservation.update({
    where: { id },
    data: { status: 'CANCELLED' },
  })

  eventBus.emit(EVENT.RESERVATION_CANCELLED, {
    reservationId: cancelled.id,
    propertyId: cancelled.propertyId,
    organizationId,
    guestName: cancelled.guestName,
    checkIn: cancelled.checkIn,
    checkOut: cancelled.checkOut,
    source: 'manual' as const,
  })

  return cancelled
}
