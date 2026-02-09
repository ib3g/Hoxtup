import type { Request, Response, NextFunction } from 'express'
import { ForbiddenError } from '../errors/forbidden.error.js'
import type { TenantRequest } from './tenant.middleware.js'

/**
 * Middleware that blocks write operations (POST, PATCH, DELETE, PUT)
 * if the organization's subscription is in a read-only state (PAST_DUE, ARCHIVED).
 * AC-4: Trial expired → 15-day grace period: read-only
 */
export async function subscriptionGuard(req: Request, _res: Response, next: NextFunction) {
    const tenantReq = req as unknown as TenantRequest
    const status = tenantReq.subscriptionStatus

    // If subscription status is missing, we assume it's FREE (or not yet trialing)
    // depending on your business logic, but Story 8.2 implies we always have a sub.

    if (status === 'PAST_DUE' || status === 'ARCHIVED') {
        if (req.method !== 'GET') {
            next(new ForbiddenError('Subscription inactive — mode lecture seule. Veuillez régulariser votre situation pour effectuer des modifications.'))
            return
        }
    }

    next()
}
