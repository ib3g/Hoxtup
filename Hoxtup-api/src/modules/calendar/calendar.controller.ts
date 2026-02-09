import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import type { RbacRequest } from '../../common/middleware/rbac.middleware.js'
import * as calendarService from './calendar.service.js'

type CalendarRequest = AuthenticatedRequest & TenantRequest & RbacRequest

export async function getCalendarEvents(req: CalendarRequest, res: Response, next: NextFunction) {
  try {
    const start = req.query.start ? new Date(req.query.start as string) : startOfDay(new Date())
    const end = req.query.end ? new Date(req.query.end as string) : endOfDay(new Date())

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ type: 'validation-error', title: 'Dates invalides', status: 400 })
      return
    }

    const filters = {
      start,
      end,
      propertyId: req.query.propertyId as string | undefined,
      userId: req.query.userId as string | undefined,
      types: req.query.types ? (req.query.types as string).split(',') : undefined,
    }

    const events = await calendarService.getCalendarEvents(
      req.tenantId,
      req.user.id,
      req.user.role,
      filters,
    )

    res.json({ events, total: events.length })
  } catch (error) {
    next(error)
  }
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}
