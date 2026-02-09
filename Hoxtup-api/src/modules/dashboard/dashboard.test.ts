import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'

const TEST_PREFIX = `dash-${Date.now()}`

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

describe('Epic 7: Dashboard & Operational Intelligence', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string
  let propertyId: string

  beforeAll(async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Dash Tester' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Dash', lastName: 'Test' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })

    const propRes = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({
        name: 'Villa Dashboard',
        address: '1 Rue Dash',
        capacity: 2,
        type: 'APARTMENT',
      })
    expect(propRes.status).toBe(201)
    propertyId = propRes.body.id
  })

  afterAll(async () => {
    try {
      await prisma.stockMovement.deleteMany({ where: { item: { organizationId: orgId } } })
      await prisma.consumableItem.deleteMany({ where: { organizationId: orgId } })
      await prisma.asset.deleteMany({ where: { organizationId: orgId } })
      await prisma.revenue.deleteMany({ where: { organizationId: orgId } })
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
    await prisma.incident.deleteMany({ where: { organizationId: orgId } })
    await prisma.taskHistory.deleteMany({ where: { task: { organizationId: orgId } } })
    await prisma.task.deleteMany({ where: { organizationId: orgId } })
    await prisma.reservation.deleteMany({ where: { organizationId: orgId } })
    await prisma.revenue.deleteMany({ where: { organizationId: orgId } })
    await prisma.stockMovement.deleteMany({ where: { item: { organizationId: orgId } } })
    await prisma.consumableItem.deleteMany({ where: { organizationId: orgId } })
  })

  // ─── Story 7.1: Executive Dashboard ───

  describe('Story 7.1 — Executive Dashboard', () => {
    it('should return greeting and KPIs (AC-1, AC-2)', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/home')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.greeting).toMatch(/^Bonjour/)
      expect(res.body.kpis).toHaveLength(4)
      expect(res.body.kpis[0]).toHaveProperty('label')
      expect(res.body.kpis[0]).toHaveProperty('value')
      expect(res.body.kpis[0]).toHaveProperty('color')
    })

    it('should include context message and time context (AC-6)', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/home')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.contextMessage).toBeDefined()
      expect(['morning', 'midday', 'evening']).toContain(res.body.timeContext)
    })

    it('should count today tasks and pending validations (AC-3, AC-5)', async () => {
      const now = new Date()
      await prisma.task.createMany({
        data: [
          { organizationId: orgId, propertyId, title: 'Task A', status: 'TODO', scheduledAt: now },
          { organizationId: orgId, propertyId, title: 'Task B', status: 'PENDING_VALIDATION', scheduledAt: now },
          { organizationId: orgId, propertyId, title: 'Task C', status: 'IN_PROGRESS', scheduledAt: now },
        ],
      })

      const res = await request(app)
        .get('/api/v1/dashboard/home')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.kpis[0].value).toBe(3)
      expect(res.body.pendingValidations).toBe(1)
      expect(res.body.tasks).toHaveLength(3)
    })

    it('should include incidents (AC-4)', async () => {
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Incident task', status: 'INCIDENT' },
      })
      await prisma.incident.create({
        data: { organizationId: orgId, taskId: task.id, reporterId: userId, type: 'EQUIPMENT', status: 'open' },
      })

      const res = await request(app)
        .get('/api/v1/dashboard/home')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.incidents).toHaveLength(1)
      expect(res.body.kpis[3].value).toBe(1)
      expect(res.body.kpis[3].color).toBe('red')
    })
  })

  // ─── Story 7.2: Field Staff Dashboard ───

  describe('Story 7.2 — Field Staff Dashboard', () => {
    it('should return zen_complete when no tasks (AC-5)', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/field')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.zenState).toBe('zen_complete')
      expect(res.body.taskCount).toBe(0)
    })

    it('should identify next task and remaining (AC-2, AC-3)', async () => {
      const today = new Date()
      today.setHours(10, 0, 0, 0)
      const later = new Date(today); later.setHours(14, 0, 0, 0)
      const earliest = new Date(today); earliest.setHours(8, 0, 0, 0)
      await prisma.task.createMany({
        data: [
          { organizationId: orgId, propertyId, title: 'First', status: 'TODO', scheduledAt: today, assignedUserId: userId },
          { organizationId: orgId, propertyId, title: 'Second', status: 'TODO', scheduledAt: later, assignedUserId: userId },
          { organizationId: orgId, propertyId, title: 'Done', status: 'COMPLETED', scheduledAt: earliest, assignedUserId: userId, completedAt: new Date() },
        ],
      })

      const res = await request(app)
        .get('/api/v1/dashboard/field')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.taskCount).toBe(3)
      expect(res.body.completedCount).toBe(1)
      expect(res.body.nextTask.title).toBe('First')
      expect(res.body.remainingTasks).toHaveLength(1)
      expect(res.body.zenState).toBe('attention')
    })

    it('should return zen_partial when >50% done', async () => {
      const now = new Date()
      await prisma.task.createMany({
        data: [
          { organizationId: orgId, propertyId, title: 'A', status: 'COMPLETED', scheduledAt: now, assignedUserId: userId, completedAt: now },
          { organizationId: orgId, propertyId, title: 'B', status: 'COMPLETED', scheduledAt: now, assignedUserId: userId, completedAt: now },
          { organizationId: orgId, propertyId, title: 'C', status: 'TODO', scheduledAt: now, assignedUserId: userId },
        ],
      })

      const res = await request(app)
        .get('/api/v1/dashboard/field')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.zenState).toBe('zen_partial')
    })
  })

  // ─── Story 7.3: Activity Summary ───

  describe('Story 7.3 — Activity Summary', () => {
    it('should return today activity summary (AC-1)', async () => {
      const now = new Date()
      await prisma.task.createMany({
        data: [
          { organizationId: orgId, propertyId, title: 'Done', status: 'COMPLETED', scheduledAt: now, completedAt: now, assignedUserId: userId },
          { organizationId: orgId, propertyId, title: 'Pending', status: 'TODO', scheduledAt: now },
        ],
      })

      const res = await request(app)
        .get('/api/v1/dashboard/activity')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.tasksCompletedCount).toBe(1)
      expect(res.body.tasksIncomplete).toBe(1)
      expect(res.body.costs).toHaveProperty('consumables')
      expect(res.body.costs).toHaveProperty('revenue')
      expect(res.body.costs).toHaveProperty('net')
    })

    it('should include weekly comparison (AC-5)', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/activity')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.comparison).toHaveProperty('delta')
      expect(res.body.comparison).toHaveProperty('message')
    })

    it('should accept date parameter (AC-4)', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/activity?date=2026-06-15')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.date).toBe('2026-06-15')
    })

    it('should return 400 for invalid date', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/activity?date=bad')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(400)
    })

    it('should include costs from stock movements and revenue (AC-3)', async () => {
      const now = new Date()
      const item = await prisma.consumableItem.create({
        data: { organizationId: orgId, propertyId, name: 'Soap', currentQuantity: 50, threshold: 5 },
      })
      await prisma.stockMovement.create({
        data: { organizationId: orgId, itemId: item.id, type: 'EXIT', quantity: 5, costCentimes: 2500, recordedById: userId, recordedAt: now },
      })
      await prisma.revenue.create({
        data: { organizationId: orgId, propertyId, amountCentimes: 10000, date: now },
      })

      const res = await request(app)
        .get('/api/v1/dashboard/activity')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.costs.consumables).toBe(2500)
      expect(res.body.costs.revenue).toBe(10000)
      expect(res.body.costs.net).toBe(7500)
    })
  })
})
