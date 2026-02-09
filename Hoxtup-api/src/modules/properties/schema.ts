import { z } from 'zod/v4'

export const createPropertySchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM', 'OTHER']).default('APARTMENT'),
  colorIndex: z.number().int().min(0).max(4).default(0),
  capacity: z.number().int().min(1).default(1),
  notes: z.string().max(1000).optional(),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>

export const updatePropertySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  address: z.string().min(1).max(500).optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM', 'OTHER']).optional(),
  colorIndex: z.number().int().min(0).max(4).optional(),
  capacity: z.number().int().min(1).optional(),
  notes: z.string().max(1000).optional(),
})

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
