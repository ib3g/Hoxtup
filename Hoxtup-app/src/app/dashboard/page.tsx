'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Home, Plus, Loader2, ClipboardList, CalendarDays, AlertTriangle, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PropertyColorDot } from '@/components/property-color-dot'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property { id: string; name: string; colorIndex: number }
interface AssignedUser { id: string; name: string }
interface DashTask {
  id: string; title: string; type: string; status: string; scheduledAt: string | null
  property: Property; assignedUser: AssignedUser | null
}
interface DashboardData {
  kpis: { todayTasksCount: number; checkInsToday: number; openIncidents: number; unassignedTasks: number }
  todayTasks: DashTask[]
}

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const [propertyCount, setPropertyCount] = useState<number | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API_URL}/properties`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
      fetch(`${API_URL}/dashboard/home`, { credentials: 'include' }).then((r) => r.ok ? r.json() : null),
    ])
      .then(([props, dashData]: [unknown[], DashboardData | null]) => {
        setPropertyCount(props.length)
        setData(dashData)
      })
      .catch(() => { setPropertyCount(0); setData(null) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (propertyCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 mb-6">
          <Home className="size-8 text-brand-primary" />
        </div>
        <h2 className="text-heading mb-2">{t('empty.title')}</h2>
        <p className="text-body text-muted-foreground mb-6 max-w-sm">
          {t('empty.description')}
        </p>
        <Button asChild>
          <Link href="/onboarding/property">
            <Plus className="size-4 mr-2" />
            {t('empty.cta')}
          </Link>
        </Button>
      </div>
    )
  }

  const hour = new Date().getHours()
  const greetingKey = hour < 12 ? 'greeting' : hour < 18 ? 'greetingAfternoon' : 'greetingEvening'
  const kpis = data?.kpis

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading">{t(greetingKey, { name: '' })}</h2>
        <p className="text-caption text-muted-foreground">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <ClipboardList className="size-5 mx-auto mb-1 text-brand-primary" />
              <p className="text-heading">{kpis.todayTasksCount}</p>
              <p className="text-micro text-muted-foreground">{t('kpi.tasks')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CalendarDays className="size-5 mx-auto mb-1 text-info" />
              <p className="text-heading">{kpis.checkInsToday}</p>
              <p className="text-micro text-muted-foreground">{t('kpi.checkIns')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className={cn('size-5 mx-auto mb-1', kpis.openIncidents > 0 ? 'text-danger' : 'text-success')} />
              <p className={cn('text-heading', kpis.openIncidents > 0 && 'text-danger')}>{kpis.openIncidents}</p>
              <p className="text-micro text-muted-foreground">{t('kpi.incidents')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserX className={cn('size-5 mx-auto mb-1', kpis.unassignedTasks > 0 ? 'text-warning' : 'text-success')} />
              <p className={cn('text-heading', kpis.unassignedTasks > 0 && 'text-warning')}>{kpis.unassignedTasks}</p>
              <p className="text-micro text-muted-foreground">{t('kpi.unassigned')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label">{t('todayTasks')}</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/tasks">{t('viewAllTasks')}</Link>
          </Button>
        </div>

        {(!data?.todayTasks || data.todayTasks.length === 0) ? (
          <Card>
            <CardContent className="p-5 text-center text-muted-foreground">
              <p className="text-body">{t('noTasksToday')}</p>
            </CardContent>
          </Card>
        ) : (
          data.todayTasks.map((task) => (
            <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <PropertyColorDot colorIndex={task.property.colorIndex} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-label truncate">{task.title}</p>
                    <p className="text-micro text-muted-foreground">
                      {task.property.name}
                      {task.scheduledAt && ` — ${new Date(task.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-micro">{task.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-label">{t('quickActions.title')}</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link href="/dashboard/tasks">
              <ClipboardList className="size-4 mr-1" />
              {t('quickActions.newTask')}
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard/reservations">
              <CalendarDays className="size-4 mr-1" />
              {t('quickActions.newReservation')}
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard/calendar">
              <CalendarDays className="size-4 mr-1" />
              {t('quickActions.viewCalendar')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
