import type { Request, Response, NextFunction } from 'express'
import { auth } from '../../modules/auth/auth.config.js'
import { fromNodeHeaders } from 'better-auth/node'
import { ForbiddenError } from '../errors/forbidden.error.js'

export async function requireReauth(req: Request, _res: Response, next: NextFunction) {
  const { password } = req.body as { password?: string }

  if (!password) {
    next(new ForbiddenError('Password required for this operation'))
    return
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) {
      next(new ForbiddenError('Session required for re-authentication'))
      return
    }

    const result = await auth.api.signInEmail({
      body: { email: session.user.email, password },
      asResponse: true,
    })

    if (!result.ok) {
      next(new ForbiddenError('Re-authentication failed — invalid password'))
      return
    }

    next()
  } catch {
    next(new ForbiddenError('Re-authentication failed'))
  }
}
