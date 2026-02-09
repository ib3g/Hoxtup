import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { createOrganizationForUser } from './auth.service.js'
import { BadRequestError } from '../../common/errors/bad-request.error.js'

const createOrgSchema = z.object({
  organizationName: z.string().min(2).max(100),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
})

export async function createOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as unknown as { user?: { id: string; email: string } }).user
    if (!user) {
      next(new BadRequestError('Authentication required'))
      return
    }

    const body = createOrgSchema.safeParse(req.body)
    if (!body.success) {
      next(new BadRequestError(body.error.issues[0]?.message ?? 'Invalid input'))
      return
    }

    const org = await createOrganizationForUser({
      name: body.data.organizationName,
      userId: user.id,
      userEmail: user.email,
      firstName: body.data.firstName,
      lastName: body.data.lastName,
    })

    res.status(201).json({
      id: org.id,
      name: org.name,
      slug: org.slug,
    })
  } catch (error) {
    console.error('CREATE ORG ERROR:', error)
    next(error)
  }
}
