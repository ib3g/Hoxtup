import { prisma } from '../../config/database.js'
import type { NotificationType, NotificationChannel } from '../../generated/prisma/client.js'
import type { HoxtupRole } from '../../common/types/roles.js'

const CRITICAL_TYPES: NotificationType[] = ['INCIDENT_REPORTED']

const DEFAULT_EMAIL_TYPES: NotificationType[] = [
  'INCIDENT_REPORTED',
  'ICAL_SYNC_FAILURE',
  'STOCK_ALERT',
]

const STAFF_VISIBLE_TYPES: NotificationType[] = [
  'TASK_ASSIGNED',
  'TASK_OVERDUE',
  'TASK_COMPLETED',
  'INCIDENT_REPORTED',
]

const ALL_TYPES: NotificationType[] = [
  'RESERVATION_CREATED',
  'TASK_ASSIGNED',
  'TASK_OVERDUE',
  'TASK_COMPLETED',
  'INCIDENT_REPORTED',
  'STOCK_ALERT',
  'ICAL_SYNC_FAILURE',
]

export async function seedDefaultPreferences(organizationId: string, userId: string, role: HoxtupRole): Promise<void> {
  const types = (role === 'staff_autonomous' || role === 'staff_managed')
    ? STAFF_VISIBLE_TYPES
    : ALL_TYPES

  const prefs: { organizationId: string; userId: string; notificationType: NotificationType; channel: NotificationChannel; enabled: boolean }[] = []

  for (const type of types) {
    prefs.push({ organizationId, userId, notificationType: type, channel: 'IN_APP', enabled: true })
    prefs.push({
      organizationId,
      userId,
      notificationType: type,
      channel: 'EMAIL',
      enabled: DEFAULT_EMAIL_TYPES.includes(type),
    })
  }

  await prisma.notificationPreference.createMany({
    data: prefs,
    skipDuplicates: true,
  })
}

export async function getPreferences(userId: string, organizationId: string, role: HoxtupRole) {
  const visibleTypes = (role === 'staff_autonomous' || role === 'staff_managed')
    ? STAFF_VISIBLE_TYPES
    : ALL_TYPES

  const prefs = await prisma.notificationPreference.findMany({
    where: { userId, organizationId, notificationType: { in: visibleTypes } },
    orderBy: [{ notificationType: 'asc' }, { channel: 'asc' }],
  })

  return prefs.map((p) => ({
    ...p,
    isCritical: CRITICAL_TYPES.includes(p.notificationType),
  }))
}

export async function updatePreferences(
  userId: string,
  organizationId: string,
  updates: { notificationType: NotificationType; channel: NotificationChannel; enabled: boolean }[],
) {
  const results = []

  for (const update of updates) {
    if (CRITICAL_TYPES.includes(update.notificationType) && update.channel === 'IN_APP' && !update.enabled) {
      continue // cannot disable critical in-app
    }

    const result = await prisma.notificationPreference.upsert({
      where: {
        organizationId_userId_notificationType_channel: {
          organizationId,
          userId,
          notificationType: update.notificationType,
          channel: update.channel,
        },
      },
      update: { enabled: update.enabled },
      create: {
        organizationId,
        userId,
        notificationType: update.notificationType,
        channel: update.channel,
        enabled: update.enabled,
      },
    })
    results.push(result)
  }

  return results
}
