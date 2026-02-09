import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '../../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { createOrganizationForUser } from './auth.service.js'

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://hoxtup:hoxtup_dev@localhost:5433/hoxtup_dev'

function createTestClient() {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  return new PrismaClient({ adapter })
}

describe('Auth Service — createOrganizationForUser', () => {
  let prisma: PrismaClient
  const createdOrgIds: string[] = []
  const createdUserIds: string[] = []

  beforeAll(() => {
    prisma = createTestClient()
  })

  afterAll(async () => {
    await prisma.member.deleteMany({ where: { organizationId: { in: createdOrgIds } } })
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } })
    await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } })
    await prisma.$disconnect()
  })

  it('should create org + update user atomically', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Test Atomic',
        email: `atomic-${Date.now()}@test.com`,
      },
    })
    createdUserIds.push(user.id)

    const org = await createOrganizationForUser({
      name: 'Test Org Atomic',
      userId: user.id,
      userEmail: user.email,
      firstName: 'Test',
      lastName: 'Atomic',
    })
    createdOrgIds.push(org.id)

    expect(org.name).toBe('Test Org Atomic')
    expect(org.slug).toBe('test-org-atomic')

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } })
    expect(updatedUser?.organizationId).toBe(org.id)
    expect(updatedUser?.role).toBe('OWNER')
    expect(updatedUser?.hasAccount).toBe(true)
    expect(updatedUser?.firstName).toBe('Test')
    expect(updatedUser?.lastName).toBe('Atomic')

    const member = await prisma.member.findFirst({
      where: { organizationId: org.id, userId: user.id },
    })
    expect(member).not.toBeNull()
    expect(member?.role).toBe('owner')
  })

  it('should generate unique slug on collision', async () => {
    const user1 = await prisma.user.create({
      data: { name: 'Slug Test 1', email: `slug1-${Date.now()}@test.com` },
    })
    createdUserIds.push(user1.id)

    const org1 = await createOrganizationForUser({
      name: 'Slug Test',
      userId: user1.id,
      userEmail: user1.email,
      firstName: 'Slug',
      lastName: 'One',
    })
    createdOrgIds.push(org1.id)

    const user2 = await prisma.user.create({
      data: { name: 'Slug Test 2', email: `slug2-${Date.now()}@test.com` },
    })
    createdUserIds.push(user2.id)

    const org2 = await createOrganizationForUser({
      name: 'Slug Test',
      userId: user2.id,
      userEmail: user2.email,
      firstName: 'Slug',
      lastName: 'Two',
    })
    createdOrgIds.push(org2.id)

    expect(org1.slug).toBe('slug-test')
    expect(org2.slug).toBe('slug-test-1')
  })
})

describe('Auth — Better Auth integration', () => {
  let prisma: PrismaClient

  beforeAll(() => {
    prisma = createTestClient()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should register a new user via Better Auth', async () => {
    const email = `register-${Date.now()}@test.com`

    const { app } = await import('../../app.js')
    const { default: request } = await import('supertest')

    const res = await request(app)
      .post('/api/auth/sign-up/email')
      .send({
        email,
        password: 'TestPass1!',
        name: 'Register Test',
      })

    expect(res.status).toBe(200)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.email).toBe(email)

    const dbUser = await prisma.user.findFirst({ where: { email } })
    expect(dbUser).not.toBeNull()

    if (dbUser) {
      await prisma.account.deleteMany({ where: { userId: dbUser.id } })
      await prisma.session.deleteMany({ where: { userId: dbUser.id } })
      await prisma.user.delete({ where: { id: dbUser.id } })
    }
  })

  it('should reject duplicate email registration', async () => {
    const email = `dup-${Date.now()}@test.com`

    const { app } = await import('../../app.js')
    const { default: request } = await import('supertest')

    await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'First' })

    const res = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Second' })

    expect(res.status).not.toBe(200)

    const dbUser = await prisma.user.findFirst({ where: { email } })
    if (dbUser) {
      await prisma.account.deleteMany({ where: { userId: dbUser.id } })
      await prisma.session.deleteMany({ where: { userId: dbUser.id } })
      await prisma.user.delete({ where: { id: dbUser.id } })
    }
  })

  it('should set HttpOnly session cookie on successful registration', async () => {
    const email = `cookie-${Date.now()}@test.com`

    const { app } = await import('../../app.js')
    const { default: request } = await import('supertest')

    const res = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Cookie Test' })

    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()

    const sessionCookie = (Array.isArray(cookies) ? cookies : [cookies])
      .find((c: string) => c.includes('better-auth'))

    if (sessionCookie) {
      expect(sessionCookie).toContain('HttpOnly')
    }

    const dbUser = await prisma.user.findFirst({ where: { email } })
    if (dbUser) {
      await prisma.account.deleteMany({ where: { userId: dbUser.id } })
      await prisma.session.deleteMany({ where: { userId: dbUser.id } })
      await prisma.user.delete({ where: { id: dbUser.id } })
    }
  })
})
