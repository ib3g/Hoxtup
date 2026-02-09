import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import { handleReservationUpdate, handleReservationCancel } from './reservation-cascade.service.js'
import type { ReservationUpdateEvent, ReservationCancelEvent } from '../../common/events/event-types.js'

const TEST_PREFIX = `cascade-${Date.now()}`

describe('Reservation Cascade (Story 2.6)', () => {
  let orgId: string
  let propertyId: string
  let reservationId: string

  beforeAll(async () => {
    const org = await prisma.organization.create({
      data: { name: `${TEST_PREFIX} Org`, slug: TEST_PREFIX },
    })
    orgId = org.id

    const property = await prisma.property.create({
      data: {
        organizationId: orgId,
        name: 'Cascade Test Property',
        address: '1 Rue Test',
      },
    })
    propertyId = property.id
  })

  beforeEach(async () => {
    await prisma.reservationTaskAudit.deleteMany({})
    await prisma.task.deleteMany({ where: { organizationId: orgId } })
    await prisma.reservation.deleteMany({ where: { organizationId: orgId } })

    const reservation = await prisma.reservation.create({
      data: {
        organizationId: orgId,
        propertyId,
        guestName: 'Test Guest',
        checkIn: new Date('2026-03-01T14:00:00Z'),
        checkOut: new Date('2026-03-05T10:00:00Z'),
        status: 'CONFIRMED',
        sourceType: 'MANUAL',
      },
    })
    reservationId = reservation.id
  })

  afterAll(async () => {
    try {
      await prisma.reservationTaskAudit.deleteMany({})
      await prisma.task.deleteMany({ where: { organizationId: orgId } })
      await prisma.reservation.deleteMany({ where: { organizationId: orgId } })
      await prisma.property.deleteMany({ where: { organizationId: orgId } })
      await prisma.organization.delete({ where: { id: orgId } })
    } catch {
      // cleanup best-effort
    }
  })

  describe('Date change cascade (AC-1)', () => {
    it('should reschedule PENDING_VALIDATION and TODO tasks when dates change', async () => {
      await prisma.task.createMany({
        data: [
          {
            organizationId: orgId,
            propertyId,
            reservationId,
            title: 'Pending task',
            status: 'PENDING_VALIDATION',
            scheduledAt: new Date('2026-03-01T15:00:00Z'),
          },
          {
            organizationId: orgId,
            propertyId,
            reservationId,
            title: 'Todo task',
            status: 'TODO',
            scheduledAt: new Date('2026-03-02T09:00:00Z'),
          },
        ],
      })

      const event: ReservationUpdateEvent = {
        reservationId,
        propertyId,
        organizationId: orgId,
        guestName: 'Test Guest',
        checkIn: new Date('2026-03-03T14:00:00Z'),
        checkOut: new Date('2026-03-07T10:00:00Z'),
        oldCheckIn: new Date('2026-03-01T14:00:00Z'),
        oldCheckOut: new Date('2026-03-05T10:00:00Z'),
        source: 'manual',
      }

      await handleReservationUpdate(event)

      const tasks = await prisma.task.findMany({
        where: { reservationId },
        orderBy: { title: 'asc' },
      })

      expect(tasks).toHaveLength(2)

      const pendingTask = tasks.find((t) => t.title === 'Pending task')!
      expect(pendingTask.scheduledAt!.toISOString()).toBe('2026-03-03T15:00:00.000Z')
      expect(pendingTask.note).toBe('Rescheduled: reservation dates changed')

      const todoTask = tasks.find((t) => t.title === 'Todo task')!
      expect(todoTask.scheduledAt!.toISOString()).toBe('2026-03-04T09:00:00.000Z')
    })

    it('should NOT modify IN_PROGRESS or COMPLETED tasks (AC-1)', async () => {
      const originalSchedule = new Date('2026-03-02T09:00:00Z')

      await prisma.task.createMany({
        data: [
          {
            organizationId: orgId,
            propertyId,
            reservationId,
            title: 'In progress task',
            status: 'IN_PROGRESS',
            scheduledAt: originalSchedule,
          },
          {
            organizationId: orgId,
            propertyId,
            reservationId,
            title: 'Completed task',
            status: 'COMPLETED',
            scheduledAt: originalSchedule,
          },
        ],
      })

      const event: ReservationUpdateEvent = {
        reservationId,
        propertyId,
        organizationId: orgId,
        guestName: 'Test Guest',
        checkIn: new Date('2026-03-03T14:00:00Z'),
        checkOut: new Date('2026-03-07T10:00:00Z'),
        oldCheckIn: new Date('2026-03-01T14:00:00Z'),
        oldCheckOut: new Date('2026-03-05T10:00:00Z'),
        source: 'manual',
      }

      await handleReservationUpdate(event)

      const tasks = await prisma.task.findMany({
        where: { reservationId },
        orderBy: { title: 'asc' },
      })

      expect(tasks).toHaveLength(2)
      for (const task of tasks) {
        expect(task.scheduledAt!.toISOString()).toBe(originalSchedule.toISOString())
        expect(task.note).toBeNull()
      }
    })
  })

  describe('Cancellation cascade (AC-2)', () => {
    it('should auto-cancel PENDING and TODO tasks', async () => {
      await prisma.task.createMany({
        data: [
          {
            organizationId: orgId,
            propertyId,
            reservationId,
            title: 'Pending cancel',
            status: 'PENDING_VALIDATION',
            scheduledAt: new Date('2026-03-02T09:00:00Z'),
          },
          {
            organizationId: orgId,
            propertyId,
            reservationId,
            title: 'Todo cancel',
            status: 'TODO',
            scheduledAt: new Date('2026-03-03T09:00:00Z'),
          },
        ],
      })

      const event: ReservationCancelEvent = {
        reservationId,
        propertyId,
        organizationId: orgId,
        guestName: 'Test Guest',
        checkIn: new Date('2026-03-01T14:00:00Z'),
        checkOut: new Date('2026-03-05T10:00:00Z'),
        source: 'manual',
      }

      await handleReservationCancel(event)

      const tasks = await prisma.task.findMany({
        where: { reservationId },
        orderBy: { title: 'asc' },
      })

      expect(tasks).toHaveLength(2)
      for (const task of tasks) {
        expect(task.status).toBe('CANCELLED')
        expect(task.note).toBe('Auto-cancelled: reservation cancelled')
      }
    })

    it('should NOT auto-cancel IN_PROGRESS tasks but create alert audit', async () => {
      await prisma.task.create({
        data: {
          organizationId: orgId,
          propertyId,
          reservationId,
          title: 'In progress no cancel',
          status: 'IN_PROGRESS',
          scheduledAt: new Date('2026-03-02T09:00:00Z'),
        },
      })

      const event: ReservationCancelEvent = {
        reservationId,
        propertyId,
        organizationId: orgId,
        guestName: 'Test Guest',
        checkIn: new Date('2026-03-01T14:00:00Z'),
        checkOut: new Date('2026-03-05T10:00:00Z'),
        source: 'manual',
      }

      await handleReservationCancel(event)

      const task = await prisma.task.findFirst({ where: { reservationId } })
      expect(task!.status).toBe('IN_PROGRESS')

      const audits = await prisma.reservationTaskAudit.findMany({
        where: { reservationId },
      })
      expect(audits).toHaveLength(1)
      expect(audits[0].action).toBe('ALERT_IN_PROGRESS')
    })
  })

  describe('Audit trail (AC-4)', () => {
    it('should create audit entries for rescheduled tasks', async () => {
      await prisma.task.create({
        data: {
          organizationId: orgId,
          propertyId,
          reservationId,
          title: 'Audit test task',
          status: 'TODO',
          scheduledAt: new Date('2026-03-02T09:00:00Z'),
        },
      })

      const event: ReservationUpdateEvent = {
        reservationId,
        propertyId,
        organizationId: orgId,
        guestName: 'Test Guest',
        checkIn: new Date('2026-03-03T14:00:00Z'),
        checkOut: new Date('2026-03-07T10:00:00Z'),
        oldCheckIn: new Date('2026-03-01T14:00:00Z'),
        oldCheckOut: new Date('2026-03-05T10:00:00Z'),
        source: 'ical_sync',
      }

      await handleReservationUpdate(event)

      const audits = await prisma.reservationTaskAudit.findMany({
        where: { reservationId },
      })

      expect(audits).toHaveLength(1)
      expect(audits[0].action).toBe('RESCHEDULED')
      expect(audits[0].source).toBe('ical_sync')
      expect(audits[0].oldCheckIn!.toISOString()).toBe('2026-03-01T14:00:00.000Z')
      expect(audits[0].newCheckIn!.toISOString()).toBe('2026-03-03T14:00:00.000Z')
    })
  })

  describe('Transaction safety (AC-5)', () => {
    it('should rollback all changes on failure', async () => {
      await prisma.task.create({
        data: {
          organizationId: orgId,
          propertyId,
          reservationId,
          title: 'Rollback test',
          status: 'TODO',
          scheduledAt: new Date('2026-03-02T09:00:00Z'),
        },
      })

      const originalTask = await prisma.task.findFirst({
        where: { reservationId },
      })

      const badEvent: ReservationUpdateEvent = {
        reservationId: 'non-existent-reservation-id',
        propertyId,
        organizationId: orgId,
        guestName: 'Test Guest',
        checkIn: new Date('2026-03-03T14:00:00Z'),
        checkOut: new Date('2026-03-07T10:00:00Z'),
        oldCheckIn: new Date('2026-03-01T14:00:00Z'),
        oldCheckOut: new Date('2026-03-05T10:00:00Z'),
        source: 'manual',
      }

      await handleReservationUpdate(badEvent)

      const taskAfter = await prisma.task.findFirst({
        where: { id: originalTask!.id },
      })
      expect(taskAfter!.scheduledAt!.toISOString()).toBe('2026-03-02T09:00:00.000Z')
      expect(taskAfter!.note).toBeNull()

      const audits = await prisma.reservationTaskAudit.findMany({
        where: { reservationId },
      })
      expect(audits).toHaveLength(0)
    })
  })

  describe('Conflict flagging (AC-3)', () => {
    it('should emit task_conflict_detected when rescheduled tasks overlap', async () => {
      const conflictPromise = new Promise<{ taskId: string; conflictingTaskIds: string[] }>((resolve) => {
        eventBus.once(EVENT.TASK_CONFLICT_DETECTED, resolve)
      })

      await prisma.task.createMany({
        data: [
          {
            organizationId: orgId,
            propertyId,
            reservationId,
            title: 'Rescheduled task',
            status: 'TODO',
            scheduledAt: new Date('2026-03-01T15:00:00Z'),
          },
          {
            organizationId: orgId,
            propertyId,
            reservationId,
            title: 'Existing in-progress task',
            status: 'IN_PROGRESS',
            scheduledAt: new Date('2026-03-03T15:00:00Z'),
          },
        ],
      })

      const event: ReservationUpdateEvent = {
        reservationId,
        propertyId,
        organizationId: orgId,
        guestName: 'Test Guest',
        checkIn: new Date('2026-03-03T14:00:00Z'),
        checkOut: new Date('2026-03-07T10:00:00Z'),
        oldCheckIn: new Date('2026-03-01T14:00:00Z'),
        oldCheckOut: new Date('2026-03-05T10:00:00Z'),
        source: 'manual',
      }

      await handleReservationUpdate(event)

      const conflict = await Promise.race([
        conflictPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ])

      expect(conflict).not.toBeNull()
      expect(conflict!.conflictingTaskIds).toHaveLength(1)
    })
  })
})
