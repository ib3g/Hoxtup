import { z } from 'zod'

export const createStaffManagedSchema = z.object({
  name: z.string().min(2).max(100),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
})

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'staff_autonomous', 'staff_managed']),
})

export type CreateStaffManagedInput = z.infer<typeof createStaffManagedSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
