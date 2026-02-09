import { z } from 'zod/v4'

export const createTaskSchema = z.object({
  propertyId: z.string().min(1),
  reservationId: z.string().min(1).optional(),
  assignedUserId: z.string().min(1).optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  type: z.enum(['CLEANING', 'MAINTENANCE', 'INSPECTION', 'CHECK_IN', 'CHECK_OUT', 'TURNOVER', 'OTHER']).default('OTHER'),
  scheduledAt: z.coerce.date().optional(),
  durationMinutes: z.number().int().min(1).max(1440).optional(),
})

export const transitionTaskSchema = z.object({
  action: z.enum([
    'validate',
    'start',
    'complete',
    'report_incident',
    'resolve_resume',
    'resolve_complete',
    'accept_fusion',
    'reject_fusion',
    'cancel',
  ]),
  note: z.string().max(1000).optional(),
})

export const assignTaskSchema = z.object({
  assignedUserId: z.string().min(1),
})

export const bulkAssignSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1).max(50),
  assignedUserId: z.string().min(1),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type TransitionTaskInput = z.infer<typeof transitionTaskSchema>
export type AssignTaskInput = z.infer<typeof assignTaskSchema>
export type BulkAssignInput = z.infer<typeof bulkAssignSchema>
