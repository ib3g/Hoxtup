import type { NotificationType } from '../../generated/prisma/client.js'

interface TriggerConfig {
  recipients: string
  channels: ('IN_APP' | 'EMAIL')[]
  priority?: 'critical' | 'normal'
  titleTemplate: string
  bodyTemplate: string
  deepLinkTemplate?: string
}

export const NOTIFICATION_TRIGGERS: Record<NotificationType, TriggerConfig> = {
  RESERVATION_CREATED: {
    recipients: 'org_owners+property_managers',
    channels: ['IN_APP'],
    titleTemplate: 'Nouvelle réservation',
    bodyTemplate: '{guest_name} — {property_name} du {check_in} au {check_out}',
    deepLinkTemplate: '/reservations',
  },
  TASK_ASSIGNED: {
    recipients: 'assigned_staff',
    channels: ['IN_APP', 'EMAIL'],
    titleTemplate: 'Tâche assignée',
    bodyTemplate: '{task_title} — {property_name} le {scheduled_at}',
    deepLinkTemplate: '/tasks',
  },
  TASK_OVERDUE: {
    recipients: 'assigned_staff+property_managers',
    channels: ['IN_APP'],
    titleTemplate: 'Tâche en retard',
    bodyTemplate: '{task_title} — {property_name} était prévue le {scheduled_at}',
    deepLinkTemplate: '/tasks',
  },
  TASK_COMPLETED: {
    recipients: 'property_managers',
    channels: ['IN_APP'],
    titleTemplate: 'Tâche terminée',
    bodyTemplate: '{task_title} — {property_name} terminée par {completed_by}',
    deepLinkTemplate: '/tasks',
  },
  INCIDENT_REPORTED: {
    recipients: 'all_owners+all_admins',
    channels: ['IN_APP', 'EMAIL'],
    priority: 'critical',
    titleTemplate: 'Incident signalé',
    bodyTemplate: '{reporter_name} a signalé un problème: {incident_type} sur {property_name}',
    deepLinkTemplate: '/incidents',
  },
  STOCK_ALERT: {
    recipients: 'org_owners+inventory_managers',
    channels: ['IN_APP', 'EMAIL'],
    titleTemplate: 'Alerte stock',
    bodyTemplate: '{item_name}: {quantity} restant(s) (seuil: {threshold}) — {property_name}',
    deepLinkTemplate: '/inventory',
  },
  ICAL_SYNC_FAILURE: {
    recipients: 'org_owners+all_admins',
    channels: ['IN_APP', 'EMAIL'],
    titleTemplate: 'Échec de synchronisation iCal',
    bodyTemplate: '{property_name} — source {source_name} en échec depuis {failing_since}',
    deepLinkTemplate: '/properties',
  },
}

export function resolveTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '')
}
