import type { Permission } from './permissions.js'

export type HoxtupRole = 'owner' | 'admin' | 'manager' | 'staff_autonomous' | 'staff_managed'

export const ROLE_PERMISSIONS: Record<HoxtupRole, readonly Permission[]> = {
  owner: ['*'] as unknown as Permission[],
  admin: [
    'org:settings',
    'billing:manage',
    'billing:view',
    'property:create',
    'property:read',
    'property:update',
    'property:archive',
    'task:create',
    'task:read',
    'task:update',
    'task:assign',
    'task:validate',
    'task:proxy',
    'team:invite',
    'team:manage',
    'team:read',
    'analytics:view',
    'inventory:manage',
    'inventory:read',
    'incident:create',
    'incident:resolve',
  ],
  manager: [
    'property:read',
    'property:update',
    'task:create',
    'task:read',
    'task:update',
    'task:assign',
    'task:validate',
    'task:proxy',
    'team:read',
    'analytics:view',
    'inventory:read',
    'incident:create',
    'incident:resolve',
  ],
  staff_autonomous: [
    'task:read',
    'task:update',
    'incident:create',
  ],
  staff_managed: [],
} as const

export function hasPermission(role: HoxtupRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) {
    return false
  }
  
  // Use a type-safe check for the wildcard permission
  const permsArray = permissions as readonly string[]
  if (permsArray.includes('*')) {
    return true
  }
  
  return permsArray.includes(permission)
}
