import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import { NOTIFICATION_TRIGGERS, resolveTemplate } from './notification-triggers.config.js'
import { notificationsQueue } from '../../config/bullmq.js'
import type { NotificationType } from '../../generated/prisma/client.js'

async function resolveRecipients(
  recipientSpec: string,
  organizationId: string,
  context: Record<string, string>,
): Promise<string[]> {
  const specs = recipientSpec.split('+')
  const userIds = new Set<string>()

  for (const spec of specs) {
    switch (spec) {
      case 'org_owners': {
        const members = await prisma.member.findMany({
          where: { organizationId, role: 'owner' },
          select: { userId: true },
        })
        members.forEach((m) => userIds.add(m.userId))
        break
      }
      case 'all_admins': {
        const members = await prisma.member.findMany({
          where: { organizationId, role: 'admin' },
          select: { userId: true },
        })
        members.forEach((m) => userIds.add(m.userId))
        break
      }
      case 'all_owners+all_admins':
      case 'property_managers': {
        const members = await prisma.member.findMany({
          where: { organizationId, role: { in: ['owner', 'admin', 'manager'] } },
          select: { userId: true },
        })
        members.forEach((m) => userIds.add(m.userId))
        break
      }
      case 'assigned_staff': {
        if (context.assignedUserId) userIds.add(context.assignedUserId)
        break
      }
      case 'inventory_managers': {
        const members = await prisma.member.findMany({
          where: { organizationId, role: { in: ['owner', 'admin'] } },
          select: { userId: true },
        })
        members.forEach((m) => userIds.add(m.userId))
        break
      }
      default:
        break
    }
  }

  return [...userIds]
}

async function isChannelEnabled(
  userId: string,
  type: NotificationType,
  channel: 'IN_APP' | 'EMAIL',
): Promise<boolean> {
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId_notificationType_channel: { userId, notificationType: type, channel } },
  })

  if (pref) return pref.enabled

  // AC-2: Defaults — All in-app enabled, email only for critical/specific types
  if (channel === 'IN_APP') return true

  const defaultEmailTypes: NotificationType[] = [
    'INCIDENT_REPORTED',
    'ICAL_SYNC_FAILURE',
    'STOCK_ALERT',
  ]
  return defaultEmailTypes.includes(type)
}

async function dispatchNotification(
  type: NotificationType,
  organizationId: string,
  vars: Record<string, string>,
  context: Record<string, string>,
) {
  const trigger = NOTIFICATION_TRIGGERS[type]
  if (!trigger) return

  const recipients = await resolveRecipients(trigger.recipients, organizationId, context)
  const title = resolveTemplate(trigger.titleTemplate, vars)
  const body = resolveTemplate(trigger.bodyTemplate, vars)

  for (const userId of recipients) {
    const inAppEnabled = await isChannelEnabled(userId, type, 'IN_APP')
    const emailEnabled = await isChannelEnabled(userId, type, 'EMAIL')
    const triggerChannels = trigger.channels

    if (trigger.priority === 'critical' || inAppEnabled) {
      await notificationsQueue.add('dispatch-notification', {
        organizationId,
        userId,
        type,
        title,
        body,
        data: vars,
        deepLink: trigger.deepLinkTemplate,
      })
    }

    if (triggerChannels.includes('EMAIL') && (trigger.priority === 'critical' || emailEnabled)) {
      // Email is handled by notification worker which enqueues to emailsQueue
      // to keep logic central and preferences respected.
    }
  }
}

export function registerNotificationListeners(): void {
  eventBus.on(EVENT.TASK_ASSIGNED, async (event: { taskId: string; organizationId: string; assignedUserId: string }) => {
    try {
      const task = await prisma.task.findUnique({
        where: { id: event.taskId },
        include: { property: { select: { name: true } } },
      })
      if (!task) return
      await dispatchNotification('TASK_ASSIGNED', event.organizationId, {
        task_title: task.title,
        property_name: task.property?.name ?? '',
        scheduled_at: task.scheduledAt?.toLocaleDateString('fr-FR') ?? '',
      }, { assignedUserId: event.assignedUserId })
    } catch (error) {
      console.error('[notification-dispatcher] TASK_ASSIGNED failed:', error)
    }
  })

  eventBus.on(EVENT.TASK_STATE_CHANGED, async (event: { taskId: string; organizationId: string; newStatus: string; actorId: string }) => {
    if (event.newStatus !== 'COMPLETED') return
    try {
      const task = await prisma.task.findUnique({
        where: { id: event.taskId },
        include: { property: { select: { name: true } } },
      })
      if (!task) return
      const actor = await prisma.user.findUnique({ where: { id: event.actorId }, select: { name: true } })
      await dispatchNotification('TASK_COMPLETED', event.organizationId, {
        task_title: task.title,
        property_name: task.property?.name ?? '',
        completed_by: actor?.name ?? '',
      }, {})
    } catch (error) {
      console.error('[notification-dispatcher] TASK_COMPLETED failed:', error)
    }
  })

  eventBus.on(EVENT.TASK_INCIDENT_REPORTED, async (event: { taskId: string; organizationId: string; actorId: string; propertyId: string }) => {
    try {
      const task = await prisma.task.findUnique({ where: { id: event.taskId } })
      const property = await prisma.property.findUnique({ where: { id: event.propertyId }, select: { name: true } })
      const reporter = await prisma.user.findUnique({ where: { id: event.actorId }, select: { name: true } })
      const incident = await prisma.incident.findFirst({
        where: { taskId: event.taskId },
        orderBy: { createdAt: 'desc' },
      })
      await dispatchNotification('INCIDENT_REPORTED', event.organizationId, {
        reporter_name: reporter?.name ?? '',
        incident_type: incident?.type ?? '',
        property_name: property?.name ?? '',
        task_title: task?.title ?? '',
      }, {})
    } catch (error) {
      console.error('[notification-dispatcher] INCIDENT_REPORTED failed:', error)
    }
  })

  eventBus.on(EVENT.RESERVATION_CREATED, async (event: { reservationId: string; organizationId: string; propertyId: string; guestName: string; checkIn: Date; checkOut: Date }) => {
    try {
      const property = await prisma.property.findUnique({ where: { id: event.propertyId }, select: { name: true } })
      await dispatchNotification('RESERVATION_CREATED', event.organizationId, {
        guest_name: event.guestName,
        property_name: property?.name ?? '',
        check_in: event.checkIn.toLocaleDateString('fr-FR'),
        check_out: event.checkOut.toLocaleDateString('fr-FR'),
      }, {})
    } catch (error) {
      console.error('[notification-dispatcher] RESERVATION_CREATED failed:', error)
    }
  })

  eventBus.on(EVENT.SYNC_FAILURE_ALERT, async (event: { sourceId: string; organizationId: string; propertyId: string; failingSince: Date }) => {
    try {
      const property = await prisma.property.findUnique({ where: { id: event.propertyId }, select: { name: true } })
      await dispatchNotification('ICAL_SYNC_FAILURE', event.organizationId, {
        property_name: property?.name ?? '',
        source_name: event.sourceId,
        failing_since: event.failingSince.toLocaleDateString('fr-FR'),
      }, {})
    } catch (error) {
      console.error('[notification-dispatcher] ICAL_SYNC_FAILURE failed:', error)
    }
  })

  eventBus.on(EVENT.STOCK_ALERT, async (event: { itemId: string; organizationId: string; propertyId: string; itemName: string; currentQuantity: number; threshold: number }) => {
    try {
      const property = await prisma.property.findUnique({ where: { id: event.propertyId }, select: { name: true } })
      await dispatchNotification('STOCK_ALERT', event.organizationId, {
        item_name: event.itemName,
        quantity: event.currentQuantity.toString(),
        threshold: event.threshold.toString(),
        property_name: property?.name ?? '',
      }, {})
    } catch (error) {
      console.error('[notification-dispatcher] STOCK_ALERT failed:', error)
    }
  })
}

