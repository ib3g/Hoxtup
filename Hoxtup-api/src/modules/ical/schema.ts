import { z } from 'zod/v4'

export const createICalSourceSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.url(),
  syncIntervalMinutes: z.number().int().min(5).max(1440).default(15),
})

export type CreateICalSourceInput = z.infer<typeof createICalSourceSchema>
