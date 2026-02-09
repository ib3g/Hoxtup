import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'

const TEST_PREFIX = `cal-${Date.now()}`

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

describe('Epic 5: Calendar & Scheduling', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string
  let propertyAId: string
  let propertyBId: string

  beforeAll(async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Cal Tester' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Cal', lastName: 'Test' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })

    const propARes = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({ name: 'Villa Azur', address: '1 Rue Azur', capacity: 4, type: 'VILLA' })
    expect(propARes.status).toBe(201)
    propertyAId = propARes.body.id

    const propBRes = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({ name: 'Mas Provence', address: '2 Rue Provence', capacity: 6, type: 'HOUSE' })
    expect(propBRes.status).toBe(201)
    propertyBId = propBRes.body.id
  })

  afterAll(async () => {
    try {
      await prisma.taskConflict.deleteMany({ where: { organizationId: orgId } })
      await prisma.incident.deleteMany({ where: { organizationId: orgId } })
      await prisma.taskHistory.deleteMany({ where: { task: { organizationId: orgId } } })
      await prisma.task.deleteMany({ where: { organizationId: orgId } })
      await prisma.reservation.deleteMany({ where: { organizationId: orgId } })
      await prisma.taskAutoRule.deleteMany({ where: { organizationId: orgId } })
      await prisma.notification.deleteMany({ where: { organizationId: orgId } })
      await prisma.notificationPreference.deleteMany({ where: { userId } })
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
    await prisma.taskConflict.deleteMany({ where: { organizationId: orgId } })
    await prisma.taskHistory.deleteMany({ where: { task: { organizationId: orgId } } })
    await prisma.task.deleteMany({ where: { organizationId: orgId } })
    await prisma.reservation.deleteMany({ where: { organizationId: orgId } })
  })

  // ─── Story 5.1: Global Calendar View ───

  describe('Story 5.1 — Global Calendar View', () => {
    it('should merge reservations and tasks in calendar (AC-1)', async () => {
      await prisma.reservation.create({
        data: { organizationId: orgId, propertyId: propertyAId, guestName: 'Jean Dupont', checkIn: new Date('2026-06-01'), checkOut: new Date('2026-06-05'), status: 'CONFIRMED', sourceType: 'MANUAL' },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Nettoyage', status: 'TODO', scheduledAt: new Date('2026-06-01T10:00:00Z'), durationMinutes: 60 },
      })

      const res = await request(app)
        .get('/api/v1/calendar?start=2026-06-01&end=2026-06-05')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.events).toHaveLength(2)

      const types = res.body.events.map((e: { type: string }) => e.type)
      expect(types).toContain('reservation')
      expect(types).toContain('task')
    })

    it('should return events sorted chronologically (AC-2)', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Afternoon', status: 'TODO', scheduledAt: new Date('2026-06-01T14:00:00Z'), durationMinutes: 60 },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Morning', status: 'TODO', scheduledAt: new Date('2026-06-01T08:00:00Z'), durationMinutes: 60 },
      })

      const res = await request(app)
        .get(`/api/v1/calendar?start=2026-06-01&end=${encodeURIComponent('2026-06-01T23:59:59Z')}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.events[0].title).toBe('Morning')
      expect(res.body.events[1].title).toBe('Afternoon')
    })

    it('should exclude cancelled tasks', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Active', status: 'TODO', scheduledAt: new Date('2026-06-01T10:00:00Z') },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Cancelled', status: 'CANCELLED', scheduledAt: new Date('2026-06-01T11:00:00Z') },
      })

      const res = await request(app)
        .get(`/api/v1/calendar?start=2026-06-01&end=${encodeURIComponent('2026-06-01T23:59:59Z')}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.events).toHaveLength(1)
      expect(res.body.events[0].title).toBe('Active')
    })

    it('should return 400 for invalid dates', async () => {
      const res = await request(app)
        .get('/api/v1/calendar?start=invalid&end=invalid')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(400)
    })
  })

  // ─── Story 5.2: Property & Employee Calendar ───

  describe('Story 5.2 — Property & Employee Calendar', () => {
    it('should filter by propertyId (AC-1)', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Task A', status: 'TODO', scheduledAt: new Date('2026-07-01T10:00:00Z') },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyBId, title: 'Task B', status: 'TODO', scheduledAt: new Date('2026-07-01T10:00:00Z') },
      })

      const res = await request(app)
        .get(`/api/v1/calendar?start=2026-07-01&end=${encodeURIComponent('2026-07-01T23:59:59Z')}&propertyId=${propertyAId}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.events).toHaveLength(1)
      expect(res.body.events[0].title).toBe('Task A')
    })

    it('should filter by userId (AC-4)', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Assigned', status: 'TODO', scheduledAt: new Date('2026-07-01T10:00:00Z'), assignedUserId: userId },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Unassigned', status: 'TODO', scheduledAt: new Date('2026-07-01T11:00:00Z') },
      })

      const res = await request(app)
        .get(`/api/v1/calendar?start=2026-07-01&end=${encodeURIComponent('2026-07-01T23:59:59Z')}&userId=${userId}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      const tasks = res.body.events.filter((e: { type: string }) => e.type === 'task')
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('Assigned')
    })

    it('should include reservations on filtered property (AC-1)', async () => {
      await prisma.reservation.create({
        data: { organizationId: orgId, propertyId: propertyAId, guestName: 'Guest A', checkIn: new Date('2026-07-01'), checkOut: new Date('2026-07-03'), status: 'CONFIRMED', sourceType: 'MANUAL' },
      })
      await prisma.reservation.create({
        data: { organizationId: orgId, propertyId: propertyBId, guestName: 'Guest B', checkIn: new Date('2026-07-01'), checkOut: new Date('2026-07-03'), status: 'CONFIRMED', sourceType: 'MANUAL' },
      })

      const res = await request(app)
        .get(`/api/v1/calendar?start=2026-07-01&end=2026-07-03&propertyId=${propertyAId}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.events).toHaveLength(1)
      expect(res.body.events[0].guestName).toBe('Guest A')
    })
  })

  // ─── Story 5.3: Type Filter & Visual Encoding ───

  describe('Story 5.3 — Type Filter & Visual Encoding', () => {
    it('should filter by task types (AC-1)', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Clean', type: 'CLEANING', status: 'TODO', scheduledAt: new Date('2026-08-01T10:00:00Z') },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Fix', type: 'MAINTENANCE', status: 'TODO', scheduledAt: new Date('2026-08-01T11:00:00Z') },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Check', type: 'INSPECTION', status: 'TODO', scheduledAt: new Date('2026-08-01T12:00:00Z') },
      })

      const res = await request(app)
        .get(`/api/v1/calendar?start=2026-08-01&end=${encodeURIComponent('2026-08-01T23:59:59Z')}&types=${encodeURIComponent('CLEANING,MAINTENANCE')}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      const tasks = res.body.events.filter((e: { type: string }) => e.type === 'task')
      expect(tasks).toHaveLength(2)
      const titles = tasks.map((t: { title: string }) => t.title)
      expect(titles).toContain('Clean')
      expect(titles).toContain('Fix')
    })

    it('should include hasConflict flag for conflicting tasks (AC-6)', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Overlap A', status: 'TODO', scheduledAt: new Date('2026-08-01T10:00:00Z'), durationMinutes: 120 },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Overlap B', status: 'TODO', scheduledAt: new Date('2026-08-01T11:00:00Z'), durationMinutes: 60 },
      })

      const [idA, idB] = t1.id < t2.id ? [t1.id, t2.id] : [t2.id, t1.id]
      await prisma.taskConflict.create({
        data: { organizationId: orgId, taskAId: idA, taskBId: idB, conflictType: 'PROPERTY', status: 'detected' },
      })

      const res = await request(app)
        .get(`/api/v1/calendar?start=2026-08-01&end=${encodeURIComponent('2026-08-01T23:59:59Z')}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)

      const tasks = res.body.events.filter((e: { type: string }) => e.type === 'task')
      expect(tasks.every((t: { hasConflict: boolean }) => t.hasConflict)).toBe(true)
    })

    it('should include taskType and property color in response (AC-2)', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'Typed', type: 'CLEANING', status: 'TODO', scheduledAt: new Date('2026-08-02T10:00:00Z') },
      })

      const res = await request(app)
        .get(`/api/v1/calendar?start=2026-08-02&end=${encodeURIComponent('2026-08-02T23:59:59Z')}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      const task = res.body.events[0]
      expect(task.taskType).toBe('CLEANING')
      expect(task.propertyName).toBe('Villa Azur')
      expect(task.propertyColorIndex).toBeDefined()
    })

    it('should combine property + type filters (AC-7)', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'A Clean', type: 'CLEANING', status: 'TODO', scheduledAt: new Date('2026-08-03T10:00:00Z') },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyAId, title: 'A Maint', type: 'MAINTENANCE', status: 'TODO', scheduledAt: new Date('2026-08-03T11:00:00Z') },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId: propertyBId, title: 'B Clean', type: 'CLEANING', status: 'TODO', scheduledAt: new Date('2026-08-03T10:00:00Z') },
      })

      const res = await request(app)
        .get(`/api/v1/calendar?start=2026-08-03&end=${encodeURIComponent('2026-08-03T23:59:59Z')}&propertyId=${propertyAId}&types=${encodeURIComponent('CLEANING')}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      const tasks = res.body.events.filter((e: { type: string }) => e.type === 'task')
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('A Clean')
    })
  })
})
