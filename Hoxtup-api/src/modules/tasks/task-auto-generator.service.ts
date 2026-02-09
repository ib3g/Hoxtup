import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import type { ReservationEvent } from '../../common/events/event-types.js'
import type { TriggerType } from '../../generated/prisma/client.js'

const DEFAULT_RULES: { triggerType: TriggerType; titleTemplate: string; timeOffsetHours: number }[] = [
  { triggerType: 'BEFORE_ARRIVAL', titleTemplate: 'Nettoyage avant arrivée — {property_name}', timeOffsetHours: -3 },
  { triggerType: 'AFTER_DEPARTURE', titleTemplate: 'Nettoyage après départ — {property_name}', timeOffsetHours: 1 },
  { triggerType: 'TURNOVER', titleTemplate: 'Turnover — {property_name}', timeOffsetHours: 0 },
]

export async function createDefaultRulesForProperty(propertyId: string, organizationId: string, propertyName: string, tx?: any): Promise<void> {
  const client = tx || prisma
  const existing = await client.taskAutoRule.findMany({ where: { propertyId } })
  if (existing.length > 0) return

  await client.taskAutoRule.createMany({
    data: DEFAULT_RULES.map((rule) => ({
      organizationId,
      propertyId,
      triggerType: rule.triggerType,
      taskType: 'CLEANING' as const,
      titleTemplate: rule.titleTemplate.replace('{property_name}', propertyName),
      timeOffsetHours: rule.timeOffsetHours,
      durationMinutes: 60,
      enabled: false,
    })),
  })
}

function resolveTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value || '')
  }
  return result
}

function calculateScheduledAt(triggerType: TriggerType, checkIn: Date, checkOut: Date, offsetHours: number): Date {
  const base = triggerType === 'AFTER_DEPARTURE' ? checkOut : checkIn
  return new Date(base.getTime() + offsetHours * 60 * 60 * 1000)
}

export async function generateTasksForReservation(event: ReservationEvent): Promise<string[]> {
  const rules = await prisma.taskAutoRule.findMany({
    where: {
      propertyId: event.propertyId,
      organizationId: event.organizationId,
      enabled: true,
    },
  })

  if (rules.length === 0) return []

  const property = await prisma.property.findUnique({
    where: { id: event.propertyId },
    select: { name: true },
  })

  const reservation = event.reservationId
    ? await prisma.reservation.findUnique({ where: { id: event.reservationId }, select: { id: true } })
    : null

  const templateVars: Record<string, string> = {
    property_name: property?.name ?? '',
    guest_name: event.guestName,
    date: event.checkIn.toLocaleDateString('fr-FR'),
  }

  const createdTaskIds: string[] = []

  for (const rule of rules) {
    const title = resolveTemplate(rule.titleTemplate, templateVars)
    const scheduledAt = calculateScheduledAt(rule.triggerType, event.checkIn, event.checkOut, rule.timeOffsetHours)

    const task = await prisma.task.create({
      data: {
        organizationId: event.organizationId,
        propertyId: event.propertyId,
        reservationId: reservation?.id ?? null,
        autoRuleId: rule.id,
        title,
        type: rule.taskType,
        status: 'PENDING_VALIDATION',
        scheduledAt,
        durationMinutes: rule.durationMinutes,
      },
    })

    createdTaskIds.push(task.id)

    eventBus.emit(EVENT.TASK_CREATED, {
      taskId: task.id,
      organizationId: event.organizationId,
      propertyId: event.propertyId,
      reservationId: event.reservationId,
      autoRuleId: rule.id,
      triggerType: rule.triggerType,
      timestamp: new Date(),
    })
  }

  return createdTaskIds
}

export function registerAutoGenerationListeners(): void {
  eventBus.on(EVENT.RESERVATION_CREATED, async (event: ReservationEvent) => {
    try {
      await generateTasksForReservation(event)
    } catch (error) {
      console.error('[task-auto-generator] Failed to generate tasks for reservation', event.reservationId, error)
    }
  })
}
