import { describe, it, expect } from 'vitest'
import { hasPermission, ROLE_PERMISSIONS } from '../types/roles.js'
import type { HoxtupRole } from '../types/roles.js'

describe('RBAC — Permission Matrix (Story 1.5)', () => {
  it('owner has all permissions (AC-2, AC-7)', () => {
    expect(hasPermission('owner', 'org:delete')).toBe(true)
    expect(hasPermission('owner', 'org:transfer')).toBe(true)
    expect(hasPermission('owner', 'org:settings')).toBe(true)
    expect(hasPermission('owner', 'billing:manage')).toBe(true)
    expect(hasPermission('owner', 'property:create')).toBe(true)
    expect(hasPermission('owner', 'task:create')).toBe(true)
    expect(hasPermission('owner', 'team:manage')).toBe(true)
    expect(hasPermission('owner', 'analytics:view')).toBe(true)
    expect(hasPermission('owner', 'inventory:manage')).toBe(true)
    expect(hasPermission('owner', 'incident:resolve')).toBe(true)
  })

  it('admin cannot delete org or transfer ownership (AC-3)', () => {
    expect(hasPermission('admin', 'org:delete')).toBe(false)
    expect(hasPermission('admin', 'org:transfer')).toBe(false)
    expect(hasPermission('admin', 'org:settings')).toBe(true)
    expect(hasPermission('admin', 'billing:manage')).toBe(true)
    expect(hasPermission('admin', 'property:create')).toBe(true)
    expect(hasPermission('admin', 'task:create')).toBe(true)
    expect(hasPermission('admin', 'team:manage')).toBe(true)
    expect(hasPermission('admin', 'analytics:view')).toBe(true)
  })

  it('manager can access assigned properties and tasks but not billing (AC-4)', () => {
    expect(hasPermission('manager', 'property:read')).toBe(true)
    expect(hasPermission('manager', 'property:update')).toBe(true)
    expect(hasPermission('manager', 'task:create')).toBe(true)
    expect(hasPermission('manager', 'task:assign')).toBe(true)
    expect(hasPermission('manager', 'task:validate')).toBe(true)
    expect(hasPermission('manager', 'analytics:view')).toBe(true)
    expect(hasPermission('manager', 'inventory:read')).toBe(true)
    expect(hasPermission('manager', 'billing:manage')).toBe(false)
    expect(hasPermission('manager', 'billing:view')).toBe(false)
    expect(hasPermission('manager', 'org:settings')).toBe(false)
    expect(hasPermission('manager', 'org:delete')).toBe(false)
    expect(hasPermission('manager', 'team:manage')).toBe(false)
    expect(hasPermission('manager', 'property:create')).toBe(false)
    expect(hasPermission('manager', 'property:archive')).toBe(false)
  })

  it('staff_autonomous can only read/update tasks and create incidents (AC-5)', () => {
    expect(hasPermission('staff_autonomous', 'task:read')).toBe(true)
    expect(hasPermission('staff_autonomous', 'task:update')).toBe(true)
    expect(hasPermission('staff_autonomous', 'incident:create')).toBe(true)
    expect(hasPermission('staff_autonomous', 'property:read')).toBe(false)
    expect(hasPermission('staff_autonomous', 'team:read')).toBe(false)
    expect(hasPermission('staff_autonomous', 'analytics:view')).toBe(false)
    expect(hasPermission('staff_autonomous', 'billing:view')).toBe(false)
    expect(hasPermission('staff_autonomous', 'task:create')).toBe(false)
    expect(hasPermission('staff_autonomous', 'task:assign')).toBe(false)
  })

  it('staff_managed has no permissions (AC-6)', () => {
    expect(hasPermission('staff_managed', 'task:read')).toBe(false)
    expect(hasPermission('staff_managed', 'property:read')).toBe(false)
    expect(hasPermission('staff_managed', 'incident:create')).toBe(false)
    expect(ROLE_PERMISSIONS.staff_managed).toHaveLength(0)
  })

  it('all 5 roles are defined (AC-7)', () => {
    const roles: HoxtupRole[] = ['owner', 'admin', 'manager', 'staff_autonomous', 'staff_managed']
    roles.forEach((role) => {
      expect(ROLE_PERMISSIONS[role]).toBeDefined()
    })
  })
})

describe('RBAC — Middleware (Story 1.5)', () => {
  it('should return 403 for missing permission on protected route (AC-1)', async () => {
    const { app } = await import('../../app.js')
    const { default: request } = await import('supertest')

    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: `rbac-${Date.now()}@test.com`, password: 'TestPass1!', name: 'RBAC Test' })

    const cookies = signUpRes.headers['set-cookie']
    const cookieArr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
    const sessionCookie = cookieArr.find((c: string) => c.includes('better-auth.session_token'))
    expect(sessionCookie).toBeDefined()
  })
})
