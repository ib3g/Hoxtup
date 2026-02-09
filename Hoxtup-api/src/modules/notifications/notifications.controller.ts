import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import * as notificationService from './notification.service.js'
import * as preferencesService from './preferences.service.js'

type NotifRequest = AuthenticatedRequest & TenantRequest

export async function listNotifications(req: NotifRequest, res: Response, next: NextFunction) {
  try {
    const cursor = req.query.cursor as string | undefined
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    const result = await notificationService.listNotifications(req.user.id, req.tenantId, cursor, limit)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getUnreadCount(req: NotifRequest, res: Response, next: NextFunction) {
  try {
    const count = await notificationService.getUnreadCount(req.user.id, req.tenantId)
    res.json({ count })
  } catch (error) {
    next(error)
  }
}

export async function markAsRead(req: NotifRequest, res: Response, next: NextFunction) {
  try {
    await notificationService.markAsRead(req.params.id as string, req.user.id, req.tenantId)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function markAllAsRead(req: NotifRequest, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.markAllAsRead(req.user.id, req.tenantId)
    res.json({ updated: result.count })
  } catch (error) {
    next(error)
  }
}

export async function getPreferences(req: NotifRequest, res: Response, next: NextFunction) {
  try {
    const prefs = await preferencesService.getPreferences(req.user.id, req.tenantId, req.user.role)
    res.json({ preferences: prefs })
  } catch (error) {
    next(error)
  }
}

export async function updatePreferences(req: NotifRequest, res: Response, next: NextFunction) {
  try {
    const { updates } = req.body as { updates: { notificationType: string; channel: string; enabled: boolean }[] }
    const result = await preferencesService.updatePreferences(
      req.user.id,
      req.tenantId,
      updates as Parameters<typeof preferencesService.updatePreferences>[2],
    )
    res.json({ updated: result.length })
  } catch (error) {
    next(error)
  }
}
