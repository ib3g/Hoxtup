import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import type { ReservationUpdateEvent, ReservationCancelEvent } from '../../common/events/event-types.js'
import type { TaskStatus } from '../../generated/prisma/client.js'

const CASCADABLE_STATUSES: TaskStatus[] = ['PENDING_VALIDATION', 'TODO']

export async function handleReservationUpdate(event: ReservationUpdateEvent): Promise<void> {
  const datesChanged =
    event.oldCheckIn.getTime() !== event.checkIn.getTime() ||
    event.oldCheckOut.getTime() !== event.checkOut.getTime()

  if (!datesChanged) return

  await prisma.$transaction(async (tx) => {
    const linkedTasks = await tx.task.findMany({
      where: {
        reservationId: event.reservationId,
        status: { in: CASCADABLE_STATUSES },
      },
    })

    if (linkedTasks.length === 0) return

    const rescheduledMap = new Map<string, Date | null>()

    for (const task of linkedTasks) {
      const newScheduledAt = calculateNewSchedule(
        task.scheduledAt,
        event.oldCheckIn,
        event.oldCheckOut,
        event.checkIn,
        event.checkOut,
      )

      rescheduledMap.set(task.id, newScheduledAt)

      await tx.task.update({
        where: { id: task.id },
        data: {
          scheduledAt: newScheduledAt,
          note: 'Rescheduled: reservation dates changed',
        },
      })

      await tx.reservationTaskAudit.create({
        data: {
          organizationId: event.organizationId,
          reservationId: event.reservationId,
          taskId: task.id,
          action: 'RESCHEDULED',
          oldCheckIn: event.oldCheckIn,
          oldCheckOut: event.oldCheckOut,
          newCheckIn: event.checkIn,
          newCheckOut: event.checkOut,
          source: event.source,
        },
      })
    }

    // 2. Conflict detection against ALL tasks at the property
    for (const task of linkedTasks) {
      const newScheduledAt = rescheduledMap.get(task.id)
      if (!newScheduledAt) continue

      const conflictingTasks = await tx.task.findMany({
        where: {
          organizationId: event.organizationId,
          propertyId: event.propertyId,
          id: { not: task.id },
          scheduledAt: newScheduledAt,
          status: { not: 'CANCELLED' },
        },
        select: { id: true },
      })

      if (conflictingTasks.length > 0) {
        eventBus.emit(EVENT.TASK_CONFLICT_DETECTED, {
          taskId: task.id,
          reservationId: event.reservationId,
          organizationId: event.organizationId,
          conflictingTaskIds: conflictingTasks.map((c) => c.id),
        })
      }
    }
  })
}

export async function handleReservationCancel(event: ReservationCancelEvent): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const linkedTasks = await tx.task.findMany({
      where: {
        reservationId: event.reservationId,
      },
    })

    if (linkedTasks.length === 0) return

    for (const task of linkedTasks) {
      if (CASCADABLE_STATUSES.includes(task.status)) {
        await tx.task.update({
          where: { id: task.id },
          data: {
            status: 'CANCELLED',
            note: 'Auto-cancelled: reservation cancelled',
          },
        })

        await tx.reservationTaskAudit.create({
          data: {
            organizationId: event.organizationId,
            reservationId: event.reservationId,
            taskId: task.id,
            action: 'CANCELLED',
            oldCheckIn: event.checkIn,
            oldCheckOut: event.checkOut,
            newCheckIn: null,
            newCheckOut: null,
            source: event.source,
          },
        })
      } else if (task.status === 'IN_PROGRESS') {
        await tx.reservationTaskAudit.create({
          data: {
            organizationId: event.organizationId,
            reservationId: event.reservationId,
            taskId: task.id,
            action: 'ALERT_IN_PROGRESS',
            oldCheckIn: event.checkIn,
            oldCheckOut: event.checkOut,
            newCheckIn: null,
            newCheckOut: null,
            source: event.source,
          },
        })
      }
    }
  })
}

function calculateNewSchedule(
  taskScheduledAt: Date | null,
  oldCheckIn: Date,
  _oldCheckOut: Date,
  newCheckIn: Date,
  _newCheckOut: Date,
): Date | null {
  if (!taskScheduledAt) return null

  const offsetMs = taskScheduledAt.getTime() - oldCheckIn.getTime()
  return new Date(newCheckIn.getTime() + offsetMs)
}

export function registerCascadeListeners(): void {
  eventBus.on(EVENT.RESERVATION_UPDATED, (event: ReservationUpdateEvent) => {
    handleReservationUpdate(event).catch((err) => {
      console.error('[cascade] Failed to handle reservation update:', err)
    })
  })

  eventBus.on(EVENT.RESERVATION_CANCELLED, (event: ReservationCancelEvent) => {
    handleReservationCancel(event).catch((err) => {
      console.error('[cascade] Failed to handle reservation cancel:', err)
    })
  })
}
