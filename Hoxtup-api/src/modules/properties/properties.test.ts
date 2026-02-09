import { describe, it, expect, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

const TEST_PREFIX = `prop-${Date.now()}`

describe('Property CRUD (Story 2.1)', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string
  let propertyId: string

  afterAll(async () => {
    try {
      if (propertyId) await prisma.property.deleteMany({ where: { id: propertyId } })
      const members = await prisma.member.findMany({ where: { userId } })
      for (const m of members) await prisma.member.delete({ where: { id: m.id } })
      await prisma.user.updateMany({ where: { id: userId }, data: { organizationId: null } })
      const orgs = await prisma.organization.findMany({ where: { slug: { startsWith: TEST_PREFIX } } })
      for (const o of orgs) {
        await prisma.property.deleteMany({ where: { organizationId: o.id } })
        await prisma.member.deleteMany({ where: { organizationId: o.id } })
        await prisma.invitation.deleteMany({ where: { organizationId: o.id } })
        await prisma.organization.delete({ where: { id: o.id } })
      }
      await prisma.account.deleteMany({ where: { userId } })
      await prisma.session.deleteMany({ where: { userId } })
      await prisma.user.deleteMany({ where: { id: userId } })
    } catch {
      // cleanup best-effort
    }
  })

  it('should sign up and create org for property tests', async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Prop Owner' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Prop', lastName: 'Owner' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })
  })

  it('should create a property (AC-2)', async () => {
    const res = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({ name: 'Riad Marrakech', address: '12 Rue des Roses, Marrakech', capacity: 6, type: 'HOUSE' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Riad Marrakech')
    expect(res.body.colorIndex).toBe(0)
    expect(res.body.type).toBe('HOUSE')
    propertyId = res.body.id
  })

  it('should list properties (AC-1)', async () => {
    const res = await request(app)
      .get('/api/v1/properties')
      .set('Cookie', sessionCookie)
    expect(res.status).toBe(200)
    expect(res.body.properties.length).toBe(1)
    expect(res.body.properties[0].name).toBe('Riad Marrakech')
  })

  it('should get property by id (AC-4)', async () => {
    const res = await request(app)
      .get(`/api/v1/properties/${propertyId}`)
      .set('Cookie', sessionCookie)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Riad Marrakech')
    expect(res.body.address).toBe('12 Rue des Roses, Marrakech')
  })

  it('should update a property (AC-5)', async () => {
    const res = await request(app)
      .patch(`/api/v1/properties/${propertyId}`)
      .set('Cookie', sessionCookie)
      .send({ capacity: 8 })
    expect(res.status).toBe(200)
    expect(res.body.capacity).toBe(8)
  })

  it('should auto-assign color index (AC-8)', async () => {
    const res = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({ name: 'Apt Centre', address: '5 Av Mohammed V, Casablanca', capacity: 2 })
    expect(res.status).toBe(201)
    expect(res.body.colorIndex).toBe(1)
    // cleanup
    await prisma.property.delete({ where: { id: res.body.id } })
  })

  it('should return 401 for unauthenticated access', async () => {
    const res = await request(app).get('/api/v1/properties')
    expect(res.status).toBe(401)
  })
})
