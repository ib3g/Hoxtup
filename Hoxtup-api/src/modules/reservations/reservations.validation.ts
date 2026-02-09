import { z } from 'zod/v4'

export const createReservationSchema = z.object({
  propertyId: z.string().min(1),
  guestName: z.string().min(1).max(200).default('Réservation directe'),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  notes: z.string().max(1000).optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'La date de départ doit être après la date d\'arrivée',
  path: ['checkOut'],
})

export const updateReservationSchema = z.object({
  guestName: z.string().min(1).max(200).optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
})

export type CreateReservationInput = z.infer<typeof createReservationSchema>
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>
