import { z } from 'zod/v4'

export const createReservationSchema = z.object({
  propertyId: z.string().min(1),
  guestName: z.string().min(1).max(200),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  sourceType: z.enum(['ICAL', 'MANUAL']).default('MANUAL'),
  notes: z.string().max(1000).optional(),
})

export type CreateReservationInput = z.infer<typeof createReservationSchema>

export const updateReservationSchema = z.object({
  guestName: z.string().min(1).max(200).optional(),
  checkIn: z.string().min(1).optional(),
  checkOut: z.string().min(1).optional(),
  status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
  notes: z.string().max(1000).optional(),
})

export type UpdateReservationInput = z.infer<typeof updateReservationSchema>
