import type { PrismaClient } from '../../generated/prisma/client.js'
import type { CreateReservationInput, UpdateReservationInput } from './schema.js'
import { logger } from '../../config/logger.js'

export async function listReservations(
  db: PrismaClient,
  organizationId: string,
  filters?: { propertyId?: string; status?: string },
) {
  return db.reservation.findMany({
    where: {
      organizationId,
      ...(filters?.propertyId && { propertyId: filters.propertyId }),
      ...(filters?.status && { status: filters.status as 'CONFIRMED' | 'CANCELLED' }),
    },
    include: { property: { select: { id: true, name: true, colorIndex: true } } },
    orderBy: { checkIn: 'desc' },
  })
}

export async function getReservation(db: PrismaClient, organizationId: string, id: string) {
  return db.reservation.findFirst({
    where: { id, organizationId },
    include: { property: { select: { id: true, name: true, colorIndex: true } } },
  })
}

export async function createReservation(
  db: PrismaClient,
  organizationId: string,
  input: CreateReservationInput,
) {
  logger.info({ organizationId, guestName: input.guestName }, 'Creating reservation')

  return db.reservation.create({
    data: {
      organizationId,
      propertyId: input.propertyId,
      guestName: input.guestName,
      checkIn: new Date(input.checkIn),
      checkOut: new Date(input.checkOut),
      sourceType: input.sourceType as 'ICAL' | 'MANUAL',
      status: 'CONFIRMED',
    },
    include: { property: { select: { id: true, name: true, colorIndex: true } } },
  })
}

export async function updateReservation(
  db: PrismaClient,
  organizationId: string,
  id: string,
  input: UpdateReservationInput,
) {
  logger.info({ organizationId, id }, 'Updating reservation')

  return db.reservation.update({
    where: { id, organizationId },
    data: {
      ...(input.guestName !== undefined && { guestName: input.guestName }),
      ...(input.checkIn !== undefined && { checkIn: new Date(input.checkIn) }),
      ...(input.checkOut !== undefined && { checkOut: new Date(input.checkOut) }),
      ...(input.status !== undefined && { status: input.status as 'CONFIRMED' | 'CANCELLED' }),
    },
    include: { property: { select: { id: true, name: true, colorIndex: true } } },
  })
}

export async function cancelReservation(db: PrismaClient, organizationId: string, id: string) {
  logger.info({ organizationId, id }, 'Cancelling reservation')

  return db.reservation.update({
    where: { id, organizationId },
    data: { status: 'CANCELLED' },
  })
}
