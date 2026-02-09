import { z } from 'zod/v4'

export const TASK_STATUSES = ['PENDING_VALIDATION', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'INCIDENT', 'FUSION_SUGGESTED', 'CANCELLED'] as const
export const TASK_TYPES = ['CLEANING', 'MAINTENANCE', 'INSPECTION', 'CHECK_IN', 'CHECK_OUT', 'TURNOVER', 'OTHER'] as const

export const createTaskSchema = z.object({
  propertyId: z.string().min(1),
  reservationId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(TASK_TYPES).default('OTHER'),
  scheduledAt: z.string().optional(),
  assignedUserId: z.string().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(TASK_TYPES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  scheduledAt: z.string().optional(),
  assignedUserId: z.string().nullable().optional(),
  note: z.string().max(1000).optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
