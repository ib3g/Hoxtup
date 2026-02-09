import { prisma } from '../../config/database.js'
import type { NotificationType } from '../../generated/prisma/client.js'

export async function createNotification(
  organizationId: string,
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, unknown>,
  deepLink?: string,
) {
  return prisma.notification.create({
    data: {
      organizationId,
      userId,
      type,
      title,
      body,
      data: data ? JSON.stringify(data) : null,
      deepLink,
    },
  })
}

export async function listNotifications(
  userId: string,
  organizationId: string,
  cursor?: string,
  limit = 20,
) {
  const where: Record<string, unknown> = { userId, organizationId }
  if (cursor) {
    where.createdAt = { lt: new Date(cursor) }
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  })

  const hasMore = notifications.length > limit
  const items = hasMore ? notifications.slice(0, limit) : notifications
  const nextCursor = hasMore ? items[items.length - 1]?.createdAt.toISOString() : null

  return { notifications: items, hasMore, nextCursor }
}

export async function getUnreadCount(userId: string, organizationId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, organizationId, readAt: null },
  })
}

export async function markAsRead(notificationId: string, userId: string, organizationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId, organizationId },
    data: { readAt: new Date() },
  })
}

export async function markAllAsRead(userId: string, organizationId: string) {
  return prisma.notification.updateMany({
    where: { userId, organizationId, readAt: null },
    data: { readAt: new Date() },
  })
}
