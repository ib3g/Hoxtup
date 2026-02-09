import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import type { ReservationStatus } from '../../generated/prisma/client.js'

interface ParsedEvent {
  uid: string
  summary: string
  dtstart: Date
  dtend: Date
}

export async function syncSource(sourceId: string): Promise<{ created: number; updated: number; cancelled: number }> {
  const source = await prisma.iCalSource.findUnique({ where: { id: sourceId } })
  if (!source) throw new Error(`Source ${sourceId} not found`)

  let events: ParsedEvent[]
  try {
    events = await fetchAndParseIcal(source.url)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Fetch failed'
    await prisma.iCalSource.update({
      where: { id: sourceId },
      data: { lastSyncAt: new Date(), lastSyncStatus: 'error', errorMessage: errorMsg },
    })

    await checkFailureAlert(source)
    throw err
  }

  const stats = { created: 0, updated: 0, cancelled: 0 }
  const seenUids = new Set<string>()

  for (const event of events) {
    seenUids.add(event.uid)

    const existing = await prisma.reservation.findUnique({
      where: { icalSourceId_icalUid: { icalSourceId: sourceId, icalUid: event.uid } },
    })

    if (!existing) {
      const reservation = await prisma.reservation.create({
        data: {
          organizationId: source.organizationId,
          propertyId: source.propertyId,
          icalSourceId: sourceId,
          icalUid: event.uid,
          guestName: event.summary || 'Réservation',
          checkIn: event.dtstart,
          checkOut: event.dtend,
          status: 'CONFIRMED',
          sourceType: 'ICAL',
        },
      })
      stats.created++
      eventBus.emit(EVENT.RESERVATION_CREATED, {
        reservationId: reservation.id,
        propertyId: source.propertyId,
        organizationId: source.organizationId,
        guestName: reservation.guestName,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
      })
    } else if (
      existing.checkIn.getTime() !== event.dtstart.getTime() ||
      existing.checkOut.getTime() !== event.dtend.getTime() ||
      existing.guestName !== (event.summary || 'Réservation')
    ) {
      await prisma.reservation.update({
        where: { id: existing.id },
        data: {
          guestName: event.summary || 'Réservation',
          checkIn: event.dtstart,
          checkOut: event.dtend,
          status: 'CONFIRMED',
        },
      })
      stats.updated++
      eventBus.emit(EVENT.RESERVATION_UPDATED, {
        reservationId: existing.id,
        propertyId: source.propertyId,
        organizationId: source.organizationId,
        guestName: event.summary || 'Réservation',
        checkIn: event.dtstart,
        checkOut: event.dtend,
        oldCheckIn: existing.checkIn,
        oldCheckOut: existing.checkOut,
        source: 'ical_sync' as const,
      })
    }
  }

  const activeReservations = await prisma.reservation.findMany({
    where: { icalSourceId: sourceId, status: 'CONFIRMED', organizationId: source.organizationId },
  })
  for (const res of activeReservations) {
    if (res.icalUid && !seenUids.has(res.icalUid)) {
      await prisma.reservation.update({
        where: { id: res.id },
        data: { status: 'CANCELLED' as ReservationStatus },
      })
      stats.cancelled++
      eventBus.emit(EVENT.RESERVATION_CANCELLED, {
        reservationId: res.id,
        propertyId: source.propertyId,
        organizationId: source.organizationId,
        guestName: res.guestName,
        checkIn: res.checkIn,
        checkOut: res.checkOut,
        source: 'ical_sync' as const,
      })
    }
  }

  await prisma.iCalSource.update({
    where: { id: sourceId },
    data: { lastSyncAt: new Date(), lastSyncStatus: 'ok', errorMessage: null },
  })

  return stats
}

async function fetchAndParseIcal(url: string): Promise<ParsedEvent[]> {
  const parsedUrl = new URL(url)
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Protocole non supporté')
  }

  // Basic SSRF protection: block local/private IPs
  const hostname = parsedUrl.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
    throw new Error('URL non autorisée')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  const res = await fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'Hoxtup/1.0 iCal Sync' },
  })
  clearTimeout(timeout)

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const text = await res.text()
  if (!text.includes('BEGIN:VCALENDAR')) throw new Error('Format iCalendar invalide')

  const events: ParsedEvent[] = []
  const veventBlocks = text.split('BEGIN:VEVENT')

  for (let i = 1; i < veventBlocks.length; i++) {
    const block = veventBlocks[i].split('END:VEVENT')[0]
    const uid = extractField(block, 'UID')
    const summary = extractField(block, 'SUMMARY')
    const dtstart = parseIcalDate(extractField(block, 'DTSTART'))
    const dtend = parseIcalDate(extractField(block, 'DTEND'))

    if (uid && dtstart && dtend) {
      events.push({ uid, summary: summary || 'Réservation', dtstart, dtend })
    }
  }

  return events
}

function extractField(block: string, field: string): string {
  const regex = new RegExp(`${field}[^:]*:(.+)`, 'm')
  const match = block.match(regex)
  return match ? match[1].trim() : ''
}

async function checkFailureAlert(source: { id: string; propertyId: string; organizationId: string; name: string; lastSyncAt: Date | null; lastSyncStatus: string | null }) {
  const SIX_HOURS = 6 * 60 * 60 * 1000
  const failingSince = source.lastSyncStatus === 'error' && source.lastSyncAt
    ? source.lastSyncAt
    : new Date()

  if (source.lastSyncAt && Date.now() - source.lastSyncAt.getTime() > SIX_HOURS && source.lastSyncStatus === 'error') {
    eventBus.emit(EVENT.SYNC_FAILURE_ALERT, {
      sourceId: source.id,
      propertyId: source.propertyId,
      organizationId: source.organizationId,
      sourceName: source.name,
      errorMessage: 'Sync en échec depuis plus de 6 heures',
      failingSince,
    })
  }
}

function parseIcalDate(value: string): Date | null {
  if (!value) return null
  const clean = value.replace(/[TZ]/g, '')
  if (clean.length >= 8) {
    const year = parseInt(clean.substring(0, 4))
    const month = parseInt(clean.substring(4, 6)) - 1
    const day = parseInt(clean.substring(6, 8))
    const hour = clean.length >= 10 ? parseInt(clean.substring(8, 10)) : 0
    const minute = clean.length >= 12 ? parseInt(clean.substring(10, 12)) : 0
    return new Date(Date.UTC(year, month, day, hour, minute))
  }
  return new Date(value)
}
