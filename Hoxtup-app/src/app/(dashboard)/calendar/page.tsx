'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PropertyColorDot } from '@/components/features/properties/PropertyColorDot'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/Skeleton'

interface CalendarEvent {
  id: string
  type: 'reservation' | 'task'
  title: string
  start: string
  end?: string
  propertyName: string
  propertyColorIndex: number
  status?: string
  taskType?: string
  hasConflict?: boolean
}

interface Property {
  id: string
  name: string
  colorIndex: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function CalendarPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation(['calendar', 'common', 'tasks'])

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterProperty, setFilterProperty] = useState('')
  const [filterTypes, setFilterTypes] = useState('')
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')

  const getDateRange = useCallback(() => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)
    if (view === 'day') {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (view === 'week') {
      const day = start.getDay()
      const diff = day === 0 ? -6 : 1 - day
      start.setDate(start.getDate() + diff)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
    } else {
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
    }
    return { start, end }
  }, [currentDate, view])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { start, end } = getDateRange()
      const params = new URLSearchParams({ start: formatDate(start), end: formatDate(end) })
      if (filterProperty) params.set('propertyId', filterProperty)
      if (filterTypes) params.set('types', filterTypes)

      const [calRes, propRes] = await Promise.all([
        fetch(`${API_URL}/calendar?${params}`, { credentials: 'include' }),
        fetch(`${API_URL}/properties`, { credentials: 'include' }),
      ])

      if (calRes.ok) {
        const data = await calRes.json()
        setEvents(data.events ?? [])
      }
      if (propRes.ok) {
        const data = await propRes.json()
        setProperties(data.properties ?? [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [getDateRange, filterProperty, filterTypes])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.replace('/login'); return }
    if (isAuthenticated) loadData()
  }, [isAuthenticated, authLoading, router, loadData])

  const navigate = (delta: number) => {
    const d = new Date(currentDate)
    if (view === 'day') d.setDate(d.getDate() + delta)
    else if (view === 'week') d.setDate(d.getDate() + delta * 7)
    else d.setMonth(d.getMonth() + delta)
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(new Date())

  if (authLoading) return <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>

  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const dateKey = ev.start.split('T')[0]
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(ev)
    return acc
  }, {})

  const sortedDates = Object.keys(eventsByDate).sort()

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('calendar:title')}</h1>
        <div className="flex items-center gap-1">
          {(['day', 'week', 'month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1 text-sm ${view === v ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {t(`calendar:views.${v}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="rounded-md p-1 hover:bg-muted" aria-label={t('common:previous', { defaultValue: 'Précédent' })}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => navigate(1)} className="rounded-md p-1 hover:bg-muted" aria-label={t('common:next', { defaultValue: 'Suivant' })}>
            <ChevronRight size={20} />
          </button>
          <button onClick={goToday} className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted">
            {t('calendar:today')}
          </button>
        </div>
        <span className="text-sm font-medium text-foreground">{formatDisplayDate(currentDate)}</span>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-muted-foreground" />
        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          className="rounded-lg border px-2 py-1 text-sm"
        >
          <option value="">{t('common:allProperties', { defaultValue: 'Toutes les propriétés' })}</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={filterTypes}
          onChange={(e) => setFilterTypes(e.target.value)}
          className="rounded-lg border px-2 py-1 text-sm"
        >
          <option value="">{t('common:allTypes', { defaultValue: 'Tous les types' })}</option>
          <option value="CLEANING">{t('tasks:type.cleaning')}</option>
          <option value="MAINTENANCE">{t('tasks:type.maintenance')}</option>
          <option value="CHECK_IN">{t('tasks:type.checkIn')}</option>
          <option value="CHECK_OUT">{t('tasks:type.checkOut')}</option>
        </select>
        {(filterProperty || filterTypes) && (
          <button onClick={() => { setFilterProperty(''); setFilterTypes('') }} className="text-xs text-muted-foreground underline">
            {t('common:reset', { defaultValue: 'Réinitialiser' })}
          </button>
        )}
      </div>

      {/* Events */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : sortedDates.length === 0 ? (
        <EmptyState icon={CalendarIcon} title={t('calendar:noEvents')} />
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                {new Date(dateKey + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <div className="space-y-2">
                {eventsByDate[dateKey].map((ev) => (
                  <div
                    key={`${ev.type}-${ev.id}`}
                    className={`flex items-start gap-3 rounded-lg border bg-card p-3 ${ev.hasConflict ? 'border-amber-400' : ''}`}
                  >
                    <PropertyColorDot colorIndex={ev.propertyColorIndex} size="card" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${ev.type === 'reservation' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                          {ev.type === 'reservation' ? 'Résa' : ev.taskType ?? 'Tâche'}
                        </span>
                        {ev.hasConflict && (
                          <span className="text-[10px] font-medium text-amber-600">⚠ {t('common:conflict', { defaultValue: 'Conflit' })}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ev.propertyName} · {formatTime(ev.start)}
                        {ev.end ? ` – ${formatTime(ev.end)}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
