import { z } from 'zod/v4'

export const updateAutoRuleSchema = z.object({
  taskType: z.enum(['CLEANING', 'MAINTENANCE', 'INSPECTION', 'CHECK_IN', 'CHECK_OUT', 'TURNOVER', 'OTHER']).optional(),
  titleTemplate: z.string().min(2).max(200).optional(),
  timeOffsetHours: z.number().int().min(-48).max(48).optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  enabled: z.boolean().optional(),
})

export type UpdateAutoRuleInput = z.infer<typeof updateAutoRuleSchema>
