import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'

const TEST_PREFIX = `assign-${Date.now()}`

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

describe('Task Assignment & Manual Management (Story 3.3)', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string
  let propertyId: string
  let taskId: string

  beforeAll(async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Assign Tester' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Assign', lastName: 'Test' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })

    const propRes = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({ name: 'Villa Assign', address: '1 Rue Assign' })
    expect(propRes.status).toBe(201)
    propertyId = propRes.body.id
  })

  afterAll(async () => {
    try {
      await prisma.taskHistory.deleteMany({ where: { task: { organizationId: orgId } } })
      await prisma.task.deleteMany({ where: { organizationId: orgId } })
      await prisma.taskAutoRule.deleteMany({ where: { organizationId: orgId } })
      await prisma.propertyAssignment.deleteMany({ where: { property: { organizationId: orgId } } })
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

  describe('Manual task creation (AC-3)', () => {
    it('should create a manual task via POST /tasks', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Cookie', sessionCookie)
        .send({
          propertyId,
          title: 'Nettoyage manuel',
          type: 'CLEANING',
          description: 'Test description',
          scheduledAt: '2026-04-01T10:00:00Z',
          durationMinutes: 60,
        })
      expect(res.status).toBe(201)
      expect(res.body.title).toBe('Nettoyage manuel')
      expect(res.body.status).toBe('PENDING_VALIDATION')
      expect(res.body.type).toBe('CLEANING')
      taskId = res.body.id
    })
  })

  describe('Task assignment (AC-1)', () => {
    it('should assign a task to a member', async () => {
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Task to assign', status: 'TODO' },
      })

      const events: unknown[] = []
      const handler = (e: unknown) => events.push(e)
      eventBus.on(EVENT.TASK_ASSIGNED, handler)

      const res = await request(app)
        .patch(`/api/v1/tasks/${task.id}/assign`)
        .set('Cookie', sessionCookie)
        .send({ assignedUserId: userId })
      expect(res.status).toBe(200)
      expect(res.body.assignedUser).toBeTruthy()
      expect(res.body.assignedUser.id).toBe(userId)

      expect(events).toHaveLength(1)
      expect((events[0] as { assignedUserId: string }).assignedUserId).toBe(userId)

      eventBus.off(EVENT.TASK_ASSIGNED, handler)
    })

    it('should return 422 for non-member assignee', async () => {
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Task bad assign', status: 'TODO' },
      })

      const res = await request(app)
        .patch(`/api/v1/tasks/${task.id}/assign`)
        .set('Cookie', sessionCookie)
        .send({ assignedUserId: 'non-existent-user-id' })
      expect(res.status).toBe(422)
    })

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .patch('/api/v1/tasks/non-existent/assign')
        .set('Cookie', sessionCookie)
        .send({ assignedUserId: userId })
      expect(res.status).toBe(404)
    })
  })

  describe('Bulk assignment (AC-2)', () => {
    it('should bulk-assign multiple tasks', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Bulk 1', status: 'TODO' },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Bulk 2', status: 'TODO' },
      })

      const events: unknown[] = []
      const handler = (e: unknown) => events.push(e)
      eventBus.on(EVENT.TASK_ASSIGNED, handler)

      const res = await request(app)
        .post('/api/v1/tasks/bulk-assign')
        .set('Cookie', sessionCookie)
        .send({ taskIds: [t1.id, t2.id], assignedUserId: userId })
      expect(res.status).toBe(200)
      expect(res.body.assigned).toBe(2)

      expect(events).toHaveLength(2)

      const updated1 = await prisma.task.findUnique({ where: { id: t1.id } })
      const updated2 = await prisma.task.findUnique({ where: { id: t2.id } })
      expect(updated1!.assignedUserId).toBe(userId)
      expect(updated2!.assignedUserId).toBe(userId)

      eventBus.off(EVENT.TASK_ASSIGNED, handler)
    })

    it('should return 404 if any task ID is invalid', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Bulk valid', status: 'TODO' },
      })

      const res = await request(app)
        .post('/api/v1/tasks/bulk-assign')
        .set('Cookie', sessionCookie)
        .send({ taskIds: [t1.id, 'non-existent'], assignedUserId: userId })
      expect(res.status).toBe(404)
    })
  })

  describe('My tasks endpoint (AC-5)', () => {
    it('should return only tasks assigned to current user', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'My task', status: 'TODO', assignedUserId: userId },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Unassigned task', status: 'TODO' },
      })

      const res = await request(app)
        .get('/api/v1/tasks/my')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.tasks).toHaveLength(1)
      expect(res.body.tasks[0].title).toBe('My task')
    })
  })

  describe('Task listing with filters', () => {
    it('should filter tasks by status', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Todo task', status: 'TODO' },
      })
      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Done task', status: 'COMPLETED' },
      })

      const res = await request(app)
        .get('/api/v1/tasks?status=TODO')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.tasks).toHaveLength(1)
      expect(res.body.tasks[0].title).toBe('Todo task')
    })

    it('should filter tasks by propertyId', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Prop task', status: 'TODO' },
      })

      const res = await request(app)
        .get(`/api/v1/tasks?propertyId=${propertyId}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.tasks.length).toBeGreaterThanOrEqual(1)
      expect(res.body.tasks.every((t: { property: { id: string } }) => t.property.id === propertyId)).toBe(true)
    })
  })

  describe('Unauthenticated access', () => {
    it('should return 401 for assign without auth', async () => {
      const res = await request(app)
        .patch('/api/v1/tasks/some-id/assign')
        .send({ assignedUserId: userId })
      expect(res.status).toBe(401)
    })

    it('should return 401 for bulk-assign without auth', async () => {
      const res = await request(app)
        .post('/api/v1/tasks/bulk-assign')
        .send({ taskIds: ['a'], assignedUserId: userId })
      expect(res.status).toBe(401)
    })
  })
})
