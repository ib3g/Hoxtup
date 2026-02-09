import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'

const TEST_PREFIX = `task-${Date.now()}`

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

describe('Task Model & Lifecycle (Story 3.1)', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string
  let propertyId: string
  let taskId: string

  beforeAll(async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Task Tester' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Task', lastName: 'Tester' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })

    const propRes = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({ name: 'Task Test Property', address: '1 Rue Test' })
    expect(propRes.status).toBe(201)
    propertyId = propRes.body.id
  })

  afterAll(async () => {
    try {
      await prisma.taskHistory.deleteMany({ where: { task: { organizationId: orgId } } })
      await prisma.task.deleteMany({ where: { organizationId: orgId } })
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

  describe('Task creation (AC-1)', () => {
    it('should create a task in PENDING_VALIDATION', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', sessionCookie)
        .send({
          propertyId,
          title: 'Nettoyage chambre 1',
          type: 'CLEANING',
          scheduledAt: '2026-03-10T09:00:00Z',
        })
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('PENDING_VALIDATION')
      expect(res.body.title).toBe('Nettoyage chambre 1')
      expect(res.body.type).toBe('CLEANING')
      expect(res.body.property.id).toBe(propertyId)
      taskId = res.body.id
    })

    it('should return 404 for non-existent property', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', sessionCookie)
        .send({ propertyId: 'non-existent-id', title: 'Test' })
      expect(res.status).toBe(404)
    })
  })

  describe('Valid state transitions (AC-2 to AC-7)', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', sessionCookie)
        .send({ propertyId, title: 'Lifecycle test task', type: 'CLEANING' })
      taskId = res.body.id
    })

    it('AC-2: validate → TODO', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'validate' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('TODO')
    })

    it('AC-3: start → IN_PROGRESS with startedAt', async () => {
      await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'validate' })

      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'start' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('IN_PROGRESS')
      expect(res.body.startedAt).toBeTruthy()
    })

    it('AC-4: complete → COMPLETED with completedAt', async () => {
      await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'validate' })
      await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'start' })

      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'complete' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('COMPLETED')
      expect(res.body.completedAt).toBeTruthy()
    })

    it('AC-5: report_incident → INCIDENT', async () => {
      await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'validate' })
      await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'start' })

      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'report_incident', note: 'Fuite eau' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('INCIDENT')
      expect(res.body.note).toBe('Fuite eau')
    })

    it('AC-6: resolve_resume → IN_PROGRESS from INCIDENT', async () => {
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'validate' })
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'start' })
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'report_incident' })

      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'resolve_resume' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('IN_PROGRESS')
    })

    it('AC-6: resolve_complete → COMPLETED from INCIDENT', async () => {
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'validate' })
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'start' })
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'report_incident' })

      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'resolve_complete' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('COMPLETED')
    })
  })

  describe('Invalid transitions (AC-10)', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', sessionCookie)
        .send({ propertyId, title: 'Invalid transition test' })
      taskId = res.body.id
    })

    it('should return 422 with allowed actions for invalid transition', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'complete' })
      expect(res.status).toBe(422)
      expect(res.body.type).toBe('invalid-transition')
      expect(res.body.currentStatus).toBe('PENDING_VALIDATION')
      expect(res.body.allowedActions).toContain('validate')
      expect(res.body.allowedActions).toContain('cancel')
      expect(res.body.allowedActions).not.toContain('complete')
    })

    it('should return 422 for transition from terminal state COMPLETED', async () => {
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'validate' })
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'start' })
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'complete' })

      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'start' })
      expect(res.status).toBe(422)
      expect(res.body.allowedActions).toEqual([])
    })
  })

  describe('Task history (AC-9)', () => {
    it('should record history for each transition', async () => {
      const createRes = await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', sessionCookie)
        .send({ propertyId, title: 'History test' })
      taskId = createRes.body.id

      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'validate' })
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'start' })

      const res = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.history).toHaveLength(2)
      expect(res.body.history[0].toStatus).toBe('IN_PROGRESS')
      expect(res.body.history[0].fromStatus).toBe('TODO')
      expect(res.body.history[1].toStatus).toBe('TODO')
      expect(res.body.history[1].fromStatus).toBe('PENDING_VALIDATION')
    })
  })

  describe('State events (AC-9)', () => {
    it('should emit task_state_changed event on transition', async () => {
      const eventPromise = new Promise<{ taskId: string; previousStatus: string; newStatus: string }>((resolve) => {
        eventBus.once(EVENT.TASK_STATE_CHANGED, resolve)
      })

      const createRes = await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', sessionCookie)
        .send({ propertyId, title: 'Event test' })
      taskId = createRes.body.id

      await request(app)
        .patch(`/api/v1/tasks/${taskId}/transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'validate' })

      const event = await Promise.race([
        eventPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ])

      expect(event).not.toBeNull()
      expect(event!.taskId).toBe(taskId)
      expect(event!.previousStatus).toBe('PENDING_VALIDATION')
      expect(event!.newStatus).toBe('TODO')
    })

    it('should emit task_incident_reported on report_incident', async () => {
      const eventPromise = new Promise<{ taskId: string }>((resolve) => {
        eventBus.once(EVENT.TASK_INCIDENT_REPORTED, resolve)
      })

      const createRes = await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', sessionCookie)
        .send({ propertyId, title: 'Incident event test' })
      taskId = createRes.body.id

      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'validate' })
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'start' })
      await request(app).patch(`/api/v1/tasks/${taskId}/transition`).set('Cookie', sessionCookie).send({ action: 'report_incident' })

      const event = await Promise.race([
        eventPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ])

      expect(event).not.toBeNull()
      expect(event!.taskId).toBe(taskId)
    })
  })

  describe('Task listing and filtering', () => {
    it('should list tasks for the organization', async () => {
      await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', sessionCookie)
        .send({ propertyId, title: 'List test 1' })
      await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', sessionCookie)
        .send({ propertyId, title: 'List test 2' })

      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.tasks.length).toBeGreaterThanOrEqual(2)
      expect(res.body.total).toBeGreaterThanOrEqual(2)
    })

    it('should return 401 for unauthenticated access', async () => {
      const res = await request(app).get('/api/v1/tasks')
      expect(res.status).toBe(401)
    })
  })
})
