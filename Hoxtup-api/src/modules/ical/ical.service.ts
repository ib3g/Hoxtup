import { prisma } from '../../config/database.js'
import type { CreateICalSourceInput, UpdateICalSourceInput } from './ical.validation.js'
import { scheduleSourceSync, removeSourceSync, triggerImmediateSync } from '../reservations/ical-sync.jobs.js'

export async function listSources(propertyId: string, organizationId: string) {
  return prisma.iCalSource.findMany({
    where: { propertyId, organizationId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createSource(propertyId: string, organizationId: string, input: CreateICalSourceInput) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, organizationId, archivedAt: null },
  })
  if (!property) return null

  const source = await prisma.iCalSource.create({
    data: {
      propertyId,
      organizationId,
      name: input.name,
      url: input.url,
      syncIntervalMinutes: input.syncIntervalMinutes,
    },
  })

  await scheduleSourceSync(source.id, source.syncIntervalMinutes)
  await triggerImmediateSync(source.id)

  return source
}

export async function updateSource(sourceId: string, organizationId: string, input: UpdateICalSourceInput) {
  const source = await prisma.iCalSource.findFirst({
    where: { id: sourceId, organizationId },
  })
  if (!source) return null

  const updated = await prisma.iCalSource.update({
    where: { id: sourceId },
    data: input,
  })

  if (input.syncIntervalMinutes || input.url) {
    await scheduleSourceSync(updated.id, updated.syncIntervalMinutes)
    if (input.url) await triggerImmediateSync(updated.id)
  }

  return updated
}

export async function deleteSource(sourceId: string, organizationId: string) {
  const source = await prisma.iCalSource.findFirst({
    where: { id: sourceId, organizationId },
  })
  if (!source) return null

  await removeSourceSync(sourceId)
  
  return prisma.$transaction(async (tx) => {
    // AC-6: Reservations marked "Source removed" (not deleted)
    // We keep the reservations but clear the source link
    await tx.reservation.updateMany({
      where: { icalSourceId: sourceId, organizationId },
      data: { icalSourceId: null },
    })

    await tx.iCalSource.delete({ where: { id: sourceId } })
    return source
  })
}

export async function validateICalUrl(url: string): Promise<{ valid: boolean; eventCount?: number; error?: string }> {
  try {
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { valid: false, error: 'Protocole non supporté' }
    }

    // Basic SSRF protection: block local/private IPs
    const hostname = parsedUrl.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      return { valid: false, error: 'URL non autorisée' }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Hoxtup/1.0 iCal Sync' },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return { valid: false, error: `HTTP ${res.status}` }
    }

    const text = await res.text()

    if (!text.includes('BEGIN:VCALENDAR')) {
      return { valid: false, error: 'Format iCalendar invalide' }
    }

    const eventCount = (text.match(/BEGIN:VEVENT/g) || []).length
    return { valid: true, eventCount }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'URL inaccessible'
    return { valid: false, error: message }
  }
}
