import { prisma } from '../../config/database.js'
import type { HoxtupRole } from '../types/roles.js'

/**
 * Resolves the properties a user is allowed to access based on their role and assignments.
 * 
 * @returns 
 * - null: Full access to all properties in the organization (Owner/Admin)
 * - string[]: Restricted to these specific property IDs
 */
export async function resolvePropertyScope(
    organizationId: string,
    actorId: string,
    actorRole: HoxtupRole,
    filterPropertyId?: string,
): Promise<string[] | null> {
    // Owners and Admins have full access to all properties in the organization
    const role = actorRole.toLowerCase()
    if (role === 'owner' || role === 'admin') {
        if (filterPropertyId) return [filterPropertyId]
        return null
    }

    // Managers and Staff members are restricted to properties they are assigned to
    const assignments = await prisma.propertyAssignment.findMany({
        where: { userId: actorId },
        select: { propertyId: true },
    })
    const scopeIds = assignments.map((a: { propertyId: string }) => a.propertyId)

    if (filterPropertyId) {
        return scopeIds.includes(filterPropertyId) ? [filterPropertyId] : []
    }

    // Return the list of assigned property IDs
    return scopeIds
}

/**
 * Validates if an actor has access to a specific property.
 * Throws an error or returns false if denied.
 */
export async function hasPropertyAccess(
    organizationId: string,
    actorId: string,
    actorRole: HoxtupRole,
    propertyId: string,
): Promise<boolean> {
    const scope = await resolvePropertyScope(organizationId, actorId, actorRole, propertyId)
    if (scope === null) return true
    return scope.includes(propertyId)
}
