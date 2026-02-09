import { z } from 'zod/v4'

export const createICalSourceSchema = z.object({
  name: z.string().min(2).max(100),
  url: z.url('URL invalide'),
  syncIntervalMinutes: z.number().int().min(15).max(30).default(15),
})

export const updateICalSourceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  url: z.url('URL invalide').optional(),
  syncIntervalMinutes: z.number().int().min(15).max(30).optional(),
})

export type CreateICalSourceInput = z.infer<typeof createICalSourceSchema>
export type UpdateICalSourceInput = z.infer<typeof updateICalSourceSchema>
