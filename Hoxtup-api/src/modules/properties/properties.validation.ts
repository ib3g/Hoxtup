import { z } from 'zod/v4'

export const createPropertySchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(255),
  capacity: z.number().int().min(1).max(100).default(1),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM', 'OTHER']).default('APARTMENT'),
  notes: z.string().max(1000).optional(),
})

export const updatePropertySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  address: z.string().min(5).max(255).optional(),
  capacity: z.number().int().min(1).max(100).optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM', 'OTHER']).optional(),
  notes: z.string().max(1000).optional(),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
