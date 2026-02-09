import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import type { ReservationEvent } from '../../common/events/event-types.js'
import { generateTasksForReservation } from './task-auto-generator.service.js'

const TEST_PREFIX = `auto-gen-${Date.now()}`

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

describe('Task Auto-Generation Rules (Story 3.2)', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string
  let propertyId: string

  beforeAll(async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'AutoGen Tester' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Auto', lastName: 'Gen' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })

    const propRes = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({ name: 'Villa AutoGen', address: '1 Rue Auto' })
    expect(propRes.status).toBe(201)
    propertyId = propRes.body.id
  })

  afterAll(async () => {
    try {
      await prisma.taskHistory.deleteMany({ where: { task: { organizationId: orgId } } })
      await prisma.task.deleteMany({ where: { organizationId: orgId } })
      await prisma.taskAutoRule.deleteMany({ where: { organizationId: orgId } })
      await prisma.reservation.deleteMany({ where: { organizationId: orgId } })
      await prisma.property.deleteMany({ where: { organizationId: orgId } })
      const members = await prisma.member.findMany({ where: { userId } })
      for (const m of members) await prisma.member.delete({ where: { id: m.id } })
      await prisma.user.updateMany({ where: { id: userId }, data: { organizationId: null } })
      await prisma.invitation.deleteMany({ where: { organizationId: orgId } })
      await prisma.organization.delete({ where: { id: orgId } })
      await prisma.account.deleteMany({ where: { userId } })
      await prisma.session.deleteMany({ where: { userId } })
      await prisma.user.deleteMany({ where: { id: userId } })
    } catch {
      // cleanup best-effort
    }
  })

  beforeEach(async () => {
    await prisma.taskHistory.deleteMany({ where: { task: { organizationId: orgId } } })
    await prisma.task.deleteMany({ where: { organizationId: orgId } })
  })

  describe('Default rules creation (AC-1)', () => {
    it('should create 3 disabled default rules when property is created', async () => {
      const rules = await prisma.taskAutoRule.findMany({
        where: { propertyId, organizationId: orgId },
        orderBy: { triggerType: 'asc' },
      })
      expect(rules).toHaveLength(3)
      expect(rules.every((r) => r.enabled === false)).toBe(true)
      const types = rules.map((r) => r.triggerType).sort()
      expect(types).toEqual(['AFTER_DEPARTURE', 'BEFORE_ARRIVAL', 'TURNOVER'])
    })
  })

  describe('Auto-rules API (AC-1)', () => {
    it('should list auto-rules for a property', async () => {
      const res = await request(app)
        .get(`/api/v1/properties/${propertyId}/auto-rules`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.rules).toHaveLength(3)
    })

    it('should update an auto-rule (enable + change title)', async () => {
      const listRes = await request(app)
        .get(`/api/v1/properties/${propertyId}/auto-rules`)
        .set('Cookie', sessionCookie)
      const rule = listRes.body.rules.find((r: { triggerType: string }) => r.triggerType === 'BEFORE_ARRIVAL')

      const res = await request(app)
        .patch(`/api/v1/properties/${propertyId}/auto-rules/${rule.id}`)
        .set('Cookie', sessionCookie)
        .send({ enabled: true, titleTemplate: 'Ménage avant arrivée — {property_name}' })
      expect(res.status).toBe(200)
      expect(res.body.enabled).toBe(true)
      expect(res.body.titleTemplate).toBe('Ménage avant arrivée — {property_name}')

      // Reset
      await request(app)
        .patch(`/api/v1/properties/${propertyId}/auto-rules/${rule.id}`)
        .set('Cookie', sessionCookie)
        .send({ enabled: false })
    })

    it('should return 404 for non-existent property', async () => {
      const res = await request(app)
        .get('/api/v1/properties/non-existent/auto-rules')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(404)
    })
  })

  describe('Task auto-generation (AC-2, AC-3)', () => {
    it('should NOT generate tasks when all rules are disabled (AC-5)', async () => {
      const event: ReservationEvent = {
        reservationId: 'fake-res-id',
        propertyId,
        organizationId: orgId,
        guestName: 'Jean Dupont',
        checkIn: new Date('2026-04-01T14:00:00Z'),
        checkOut: new Date('2026-04-05T10:00:00Z'),
      }

      const taskIds = await generateTasksForReservation(event)
      expect(taskIds).toHaveLength(0)

      const tasks = await prisma.task.findMany({ where: { organizationId: orgId } })
      expect(tasks).toHaveLength(0)
    })

    it('should generate tasks for enabled rules (AC-2)', async () => {
      // Enable BEFORE_ARRIVAL rule
      const rules = await prisma.taskAutoRule.findMany({ where: { propertyId } })
      const beforeRule = rules.find((r) => r.triggerType === 'BEFORE_ARRIVAL')!
      await prisma.taskAutoRule.update({ where: { id: beforeRule.id }, data: { enabled: true } })

      const event: ReservationEvent = {
        reservationId: 'fake-res-gen',
        propertyId,
        organizationId: orgId,
        guestName: 'Marie Martin',
        checkIn: new Date('2026-04-10T14:00:00Z'),
        checkOut: new Date('2026-04-15T10:00:00Z'),
      }

      const taskIds = await generateTasksForReservation(event)
      expect(taskIds).toHaveLength(1)

      const task = await prisma.task.findUnique({ where: { id: taskIds[0] } })
      expect(task).not.toBeNull()
      expect(task!.status).toBe('PENDING_VALIDATION')
      expect(task!.autoRuleId).toBe(beforeRule.id)
      expect(task!.reservationId).toBeNull() // fake ID not in DB, FK check skips it
      expect(task!.type).toBe('CLEANING')

      // scheduledAt = checkIn + timeOffsetHours (-3h)
      const expectedScheduled = new Date('2026-04-10T11:00:00Z')
      expect(task!.scheduledAt!.getTime()).toBe(expectedScheduled.getTime())

      // Reset
      await prisma.taskAutoRule.update({ where: { id: beforeRule.id }, data: { enabled: false } })
    })

    it('should generate multiple tasks when multiple rules enabled (AC-4)', async () => {
      // Enable BEFORE_ARRIVAL and AFTER_DEPARTURE
      const rules = await prisma.taskAutoRule.findMany({ where: { propertyId } })
      const beforeRule = rules.find((r) => r.triggerType === 'BEFORE_ARRIVAL')!
      const afterRule = rules.find((r) => r.triggerType === 'AFTER_DEPARTURE')!
      await prisma.taskAutoRule.update({ where: { id: beforeRule.id }, data: { enabled: true } })
      await prisma.taskAutoRule.update({ where: { id: afterRule.id }, data: { enabled: true } })

      const event: ReservationEvent = {
        reservationId: 'fake-res-multi',
        propertyId,
        organizationId: orgId,
        guestName: 'Pierre Durand',
        checkIn: new Date('2026-05-01T14:00:00Z'),
        checkOut: new Date('2026-05-05T10:00:00Z'),
      }

      const taskIds = await generateTasksForReservation(event)
      expect(taskIds).toHaveLength(2)

      const tasks = await prisma.task.findMany({ where: { id: { in: taskIds } }, orderBy: { scheduledAt: 'asc' } })
      expect(tasks).toHaveLength(2)
      expect(tasks.every((t) => t.status === 'PENDING_VALIDATION')).toBe(true)

      // Reset
      await prisma.taskAutoRule.update({ where: { id: beforeRule.id }, data: { enabled: false } })
      await prisma.taskAutoRule.update({ where: { id: afterRule.id }, data: { enabled: false } })
    })
  })

  describe('Template variable resolution (AC-2)', () => {
    it('should resolve {property_name} in title', async () => {
      const rules = await prisma.taskAutoRule.findMany({ where: { propertyId } })
      const beforeRule = rules.find((r) => r.triggerType === 'BEFORE_ARRIVAL')!
      await prisma.taskAutoRule.update({
        where: { id: beforeRule.id },
        data: { enabled: true, titleTemplate: 'Ménage {property_name} pour {guest_name}' },
      })

      const event: ReservationEvent = {
        reservationId: 'fake-res-tpl',
        propertyId,
        organizationId: orgId,
        guestName: 'Sophie Bernard',
        checkIn: new Date('2026-06-01T14:00:00Z'),
        checkOut: new Date('2026-06-05T10:00:00Z'),
      }

      const taskIds = await generateTasksForReservation(event)
      expect(taskIds).toHaveLength(1)

      const task = await prisma.task.findUnique({ where: { id: taskIds[0] } })
      expect(task!.title).toBe('Ménage Villa AutoGen pour Sophie Bernard')

      // Reset
      await prisma.taskAutoRule.update({ where: { id: beforeRule.id }, data: { enabled: false } })
    })
  })

  describe('Event emission', () => {
    it('should emit task_created event for each generated task', async () => {
      const events: unknown[] = []
      const handler = (e: unknown) => events.push(e)
      eventBus.on(EVENT.TASK_CREATED, handler)

      const rules = await prisma.taskAutoRule.findMany({ where: { propertyId } })
      const beforeRule = rules.find((r) => r.triggerType === 'BEFORE_ARRIVAL')!
      await prisma.taskAutoRule.update({ where: { id: beforeRule.id }, data: { enabled: true } })

      const event: ReservationEvent = {
        reservationId: 'fake-res-evt',
        propertyId,
        organizationId: orgId,
        guestName: 'Luc Moreau',
        checkIn: new Date('2026-07-01T14:00:00Z'),
        checkOut: new Date('2026-07-05T10:00:00Z'),
      }

      await generateTasksForReservation(event)

      expect(events).toHaveLength(1)
      expect((events[0] as { taskId: string }).taskId).toBeTruthy()

      eventBus.off(EVENT.TASK_CREATED, handler)
      await prisma.taskAutoRule.update({ where: { id: beforeRule.id }, data: { enabled: false } })
    })
  })
})
