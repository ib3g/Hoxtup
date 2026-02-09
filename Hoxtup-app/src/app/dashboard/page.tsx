'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Home, Plus, ClipboardList, CalendarDays, AlertTriangle, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PropertyColorDot } from '@/components/property-color-dot'
import { TaskTypeIcon } from '@/components/task-type-icon'
import { TaskDetailSheet } from '@/components/task-detail-sheet'
import { TaskFormSheet } from '@/components/task-form-sheet'
import { ReservationFormSheet } from '@/components/reservation-form-sheet'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { TASK_STATUS_COLORS, TASK_STATUS_KEY_MAP } from '@/lib/task-constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property { id: string; name: string; colorIndex: number }
interface AssignedUser { id: string; name: string }
interface DashTask {
  id: string; title: string; type: string; status: string; scheduledAt: string | null
  property: Property; assignedUser: AssignedUser | null
}
interface DashboardData {
  kpis: { todayTasksCount: number; checkInsToday: number; openIncidents: number; unassignedTasks: number }
  weekTasks: DashTask[]
}


function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const { t: tTasks } = useTranslation('tasks')
  const [propertyCount, setPropertyCount] = useState<number | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [resFormOpen, setResFormOpen] = useState(false)

  function fetchData() {
    setLoading(true)
    Promise.all([
      fetch(`${API_URL}/properties`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
      fetch(`${API_URL}/dashboard/home`, { credentials: 'include' }).then((r) => r.ok ? r.json() : null),
    ])
      .then(([props, dashData]: [Property[], DashboardData | null]) => {
        setPropertyCount(props.length)
        setProperties(props)
        setData(dashData)
      })
      .catch(() => { setPropertyCount(0); setData(null) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const tasksByDay = useMemo(() => {
    if (!data?.weekTasks?.length) return []
    const groups: { date: Date; label: string; tasks: DashTask[] }[] = []
    const today = new Date()

    for (const task of data.weekTasks) {
      if (!task.scheduledAt) continue
      const taskDate = new Date(task.scheduledAt)
      const existing = groups.find((g) => isSameDay(g.date, taskDate))
      if (existing) {
        existing.tasks.push(task)
      } else {
        const isToday = isSameDay(taskDate, today)
        const label = isToday
          ? t('today')
          : taskDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })
        groups.push({ date: taskDate, label, tasks: [task] })
      }
    }
    return groups.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [data?.weekTasks, t])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-36 rounded-md" />)}
        </div>
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

  const kpis = data?.kpis

  function handleTaskClick(taskId: string) {
    setSelectedTaskId(taskId)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setTaskFormOpen(true)}>
          <ClipboardList className="size-4 mr-1" />
          {t('quickActions.newTask')}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setResFormOpen(true)}>
          <CalendarDays className="size-4 mr-1" />
          {t('quickActions.newReservation')}
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/dashboard/calendar">
            <CalendarDays className="size-4 mr-1" />
            {t('quickActions.viewCalendar')}
          </Link>
        </Button>
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-label">{t('weekTasks')}</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/tasks">{t('viewAllTasks')}</Link>
          </Button>
        </div>

        {tasksByDay.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-center text-muted-foreground">
              <p className="text-body">{t('noTasksWeek')}</p>
            </CardContent>
          </Card>
        ) : (
          tasksByDay.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="text-caption font-medium text-muted-foreground capitalize">{group.label}</p>
              {group.tasks.map((task) => (
                <button key={task.id} onClick={() => handleTaskClick(task.id)} className="w-full text-left">
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <TaskTypeIcon type={task.type} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-label truncate">{task.title}</p>
                        <p className="text-micro text-muted-foreground">
                          <PropertyColorDot colorIndex={task.property.colorIndex} size="sm" className="inline-block mr-1" />
                          {task.property.name}
                          {task.scheduledAt && ` — ${new Date(task.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                      <Badge className={cn('text-micro shrink-0 border', TASK_STATUS_COLORS[task.status] ?? '')}>{tTasks(`status.${TASK_STATUS_KEY_MAP[task.status] ?? task.status}`)}</Badge>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          ))
        )}
      </div>

      <TaskDetailSheet
        taskId={selectedTaskId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      <TaskFormSheet
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        onSuccess={() => { setTaskFormOpen(false); fetchData(); toast.success('Tâche créée') }}
        properties={properties}
      />
      <ReservationFormSheet
        open={resFormOpen}
        onOpenChange={setResFormOpen}
        onSuccess={() => { setResFormOpen(false); fetchData(); toast.success('Réservation créée') }}
        properties={properties}
      />
    </div>
  )
}
