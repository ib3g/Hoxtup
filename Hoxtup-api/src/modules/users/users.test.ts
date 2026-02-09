import { describe, it, expect, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

const TEST_PREFIX = `team-${Date.now()}`

describe('Team Management (Story 1.6)', () => {
  let sessionCookie: string
  let orgId: string
  let userId: string

  afterAll(async () => {
    try {
      await prisma.teamAuditLog.deleteMany({ where: { actorId: userId } })
      const members = await prisma.member.findMany({ where: { userId } })
      for (const m of members) {
        await prisma.member.delete({ where: { id: m.id } })
      }
      await prisma.user.updateMany({ where: { id: userId }, data: { organizationId: null } })
      const orgs = await prisma.organization.findMany({ where: { slug: { startsWith: TEST_PREFIX } } })
      for (const o of orgs) {
        await prisma.member.deleteMany({ where: { organizationId: o.id } })
        await prisma.invitation.deleteMany({ where: { organizationId: o.id } })
        await prisma.organization.delete({ where: { id: o.id } })
      }
      await prisma.account.deleteMany({ where: { userId } })
      await prisma.session.deleteMany({ where: { userId } })
      await prisma.user.deleteMany({ where: { id: userId } })

      const staffManaged = await prisma.user.findMany({
        where: { email: { startsWith: 'staff-managed-' }, hasAccount: false },
      })
      for (const s of staffManaged) {
        await prisma.member.deleteMany({ where: { userId: s.id } })
        await prisma.teamAuditLog.deleteMany({ where: { targetId: s.id } })
        await prisma.user.delete({ where: { id: s.id } })
      }
    } catch {
      // cleanup best-effort
    }
  })

  it('should sign up and create org for team tests', async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Team Owner' })
    expect(signUpRes.status).toBe(200)

    sessionCookie = extractSessionCookie(signUpRes)!
    expect(sessionCookie).toBeDefined()

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Team', lastName: 'Owner' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    // Set active organization so RBAC resolves the owner role
    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })
  })

  it('should list team members (AC-1)', async () => {
    const res = await request(app)
      .get('/api/v1/team')
      .set('Cookie', sessionCookie)
    expect(res.status).toBe(200)
    expect(res.body.members).toBeDefined()
    expect(res.body.members.length).toBeGreaterThanOrEqual(1)
  })

  it('should create staff managed profile (AC-5)', async () => {
    const res = await request(app)
      .post('/api/v1/team/staff-managed')
      .set('Cookie', sessionCookie)
      .send({ name: 'Jean Dupont', firstName: 'Jean', lastName: 'Dupont' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Jean Dupont')
    expect(res.body.hasAccount).toBe(false)
    expect(res.body.role).toBe('STAFF_MANAGED')
  })

  it('should return 401 for unauthenticated team access', async () => {
    const res = await request(app).get('/api/v1/team')
    expect(res.status).toBe(401)
  })

  it('should log audit entry on staff managed creation (AC-6)', async () => {
    const logs = await prisma.teamAuditLog.findMany({
      where: { actorId: userId, action: 'STAFF_MANAGED_CREATED' },
    })
    expect(logs.length).toBeGreaterThanOrEqual(1)
    expect(logs[0].details).toContain('Jean Dupont')
  })
})
