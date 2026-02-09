'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, User, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PropertyColorDot } from '@/components/property-color-dot'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property { id: string; name: string; colorIndex: number }
interface CalendarReservation {
  id: string; guestName: string; checkIn: string; checkOut: string; status: string
  property: Property
}
interface CalendarTask {
  id: string; title: string; type: string; status: string; scheduledAt: string
  property: Property; assignedUser: { id: string; name: string } | null
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const d = date.getTime()
  return d >= start.getTime() && d < end.getTime()
}

export default function CalendarPage() {
  const { t } = useTranslation('calendar')
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [reservations, setReservations] = useState<CalendarReservation[]>([])
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [loading, setLoading] = useState(true)

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart])
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    })
    if (propertyFilter !== 'all') params.set('propertyId', propertyFilter)

    Promise.all([
      fetch(`${API_URL}/calendar?${params}`, { credentials: 'include' }).then((r) => r.ok ? r.json() : { reservations: [], tasks: [] }),
      fetch(`${API_URL}/properties`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
    ])
      .then(([calData, propData]: [{ reservations: CalendarReservation[]; tasks: CalendarTask[] }, Property[]]) => {
        setReservations(calData.reservations)
        setTasks(calData.tasks)
        setProperties(propData)
      })
      .catch(() => { setReservations([]); setTasks([]); setProperties([]) })
      .finally(() => setLoading(false))
  }, [weekStart, weekEnd, propertyFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const today = new Date()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-heading">{t('title')}</h2>
        <div className="flex items-center gap-2">
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allProperties')}</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <PropertyColorDot colorIndex={p.colorIndex} size="sm" />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-label min-w-[180px] text-center">
            {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — {addDays(weekStart, 6).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setWeekStart(getWeekStart(new Date()))}>
          {t('today')}
        </Button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-7 border rounded-lg overflow-hidden">
        {weekDays.map((day, i) => {
          const dayReservations = reservations.filter((r) => {
            const ci = new Date(r.checkIn)
            const co = new Date(r.checkOut)
            return isWithinRange(day, ci, co) || isSameDay(day, ci)
          })
          const dayTasks = tasks.filter((t) => t.scheduledAt && isSameDay(new Date(t.scheduledAt), day))
          const isToday = isSameDay(day, today)

          return (
            <div
              key={i}
              className={cn(
                'border-r border-b last:border-r-0 min-h-[120px] p-2',
                isToday && 'bg-brand-primary/5',
              )}
            >
              <div className="text-micro text-muted-foreground mb-1">
                {t(`days.${DAY_KEYS[i]}`)}
              </div>
              <div className={cn('text-label mb-2', isToday && 'text-brand-primary font-semibold')}>
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayReservations.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-micro bg-info/10 truncate"
                  >
                    <PropertyColorDot colorIndex={r.property.colorIndex} size="sm" />
                    <span className="truncate">{r.guestName}</span>
                  </div>
                ))}
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-1 px-1.5 py-0.5 rounded text-micro truncate',
                      task.status === 'COMPLETED' ? 'bg-success/10' : task.status === 'INCIDENT' ? 'bg-danger/10' : 'bg-warning/10',
                    )}
                  >
                    <PropertyColorDot colorIndex={task.property.colorIndex} size="sm" />
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
