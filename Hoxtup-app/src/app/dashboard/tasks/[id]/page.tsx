'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CalendarDays, User, FileText, Clock, AlertTriangle, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PropertyColorDot } from '@/components/property-color-dot'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property { id: string; name: string; colorIndex: number }
interface AssignedUser { id: string; name: string }
interface Reservation { id: string; guestName: string; checkIn: string; checkOut: string }
interface Task {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  scheduledAt: string | null
  startedAt: string | null
  completedAt: string | null
  durationMinutes: number | null
  note: string | null
  property: Property
  assignedUser: AssignedUser | null
  reservation: Reservation | null
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_VALIDATION: 'bg-warning/10 text-warning border-warning',
  TODO: 'bg-brand-primary/10 text-brand-primary border-brand-primary',
  IN_PROGRESS: 'bg-cta/10 text-cta border-cta',
  COMPLETED: 'bg-success/10 text-success border-success',
  INCIDENT: 'bg-danger/10 text-danger border-danger',
  CANCELLED: 'bg-muted text-muted-foreground border-muted-foreground',
}

export default function TaskDetailPage() {
  const { t } = useTranslation('tasks')
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [assignOpen, setAssignOpen] = useState(false)
  const [members, setMembers] = useState<{ id: string; userId: string; role: string; user: { id: string; name: string; email: string } }[]>([])

  const fetchTask = useCallback(() => {
    setLoading(true)
    fetch(`${API_URL}/tasks/${id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Task | null) => setTask(data))
      .catch(() => setTask(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { fetchTask() }, [fetchTask])

  useEffect(() => {
    fetch(`${API_URL}/team`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then(setMembers)
      .catch(() => setMembers([]))
  }, [])

  async function transition(newStatus: string) {
    const prev = task
    if (!prev) return

    setTask({ ...prev, status: newStatus })

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setTask(updated)
        toast.success(t('form.success.updated'))
      } else {
        setTask(prev)
      }
    } catch {
      setTask(prev)
    }
  }

  function statusKey(s: string) {
    const map: Record<string, string> = {
      PENDING_VALIDATION: 'pendingValidation', TODO: 'todo', IN_PROGRESS: 'inProgress',
      COMPLETED: 'completed', INCIDENT: 'incident', FUSION_SUGGESTED: 'fusionSuggested', CANCELLED: 'cancelled',
    }
    return map[s] ?? s
  }

  function typeKey(ty: string) {
    const map: Record<string, string> = {
      CLEANING: 'cleaning', MAINTENANCE: 'maintenance', INSPECTION: 'inspection',
      CHECK_IN: 'checkIn', CHECK_OUT: 'checkOut', TURNOVER: 'turnover', OTHER: 'other',
    }
    return map[ty] ?? ty
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-body text-muted-foreground">{t('empty.title')}</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/dashboard/tasks')}>
          <ArrowLeft className="size-4 mr-2" />
          {t('title')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/tasks')}>
          <ArrowLeft className="size-4" />
        </Button>
        <PropertyColorDot colorIndex={task.property.colorIndex} size="lg" />
        <div className="flex-1 min-w-0">
          <h2 className="text-heading truncate">{task.title}</h2>
          <p className="text-caption text-muted-foreground">{task.property.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{t(`type.${typeKey(task.type)}`)}</Badge>
        <Badge className={cn('border', STATUS_COLORS[task.status] ?? '')}>
          {t(`status.${statusKey(task.status)}`)}
        </Badge>
        {task.assignedUser && (
          <Badge variant="outline">
            <User className="size-3 mr-1" />
            {task.assignedUser.name}
          </Badge>
        )}
      </div>

      {/* Transition buttons */}
      <div className="flex flex-wrap gap-2">
        {task.status === 'PENDING_VALIDATION' && (
          <Button className="w-full sm:w-auto" onClick={() => transition('TODO')}>
            {t('actions.validate')}
          </Button>
        )}
        {task.status === 'TODO' && (
          <Button className="w-full sm:w-auto" onClick={() => transition('IN_PROGRESS')}>
            {t('actions.start')}
          </Button>
        )}
        {task.status === 'IN_PROGRESS' && (
          <>
            <Button className="w-full sm:w-auto" onClick={() => transition('COMPLETED')}>
              {t('actions.complete')}
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={() => transition('INCIDENT')}>
              <AlertTriangle className="size-4 mr-1" />
              {t('actions.reportIncident')}
            </Button>
          </>
        )}
        {task.status === 'INCIDENT' && (
          <Button className="w-full sm:w-auto" onClick={() => transition('COMPLETED')}>
            {t('actions.resolveComplete')}
          </Button>
        )}
        <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setAssignOpen(true)}>
          <UserPlus className="size-4 mr-1" />
          {task.assignedUser ? t('assignTo') : t('assign')}
        </Button>
      </div>

      {/* Task info card */}
      <Card>
        <CardContent className="p-5 space-y-4">
          {task.description && (
            <div className="flex items-start gap-3">
              <FileText className="size-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-micro text-muted-foreground">{t('fields.description')}</p>
                <p className="text-body">{task.description}</p>
              </div>
            </div>
          )}

          {task.scheduledAt && (
            <div className="flex items-start gap-3">
              <CalendarDays className="size-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-micro text-muted-foreground">{t('scheduledAt')}</p>
                <p className="text-label">
                  {new Date(task.scheduledAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}

          {task.startedAt && (
            <div className="flex items-start gap-3">
              <Clock className="size-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-micro text-muted-foreground">{t('actions.start')}</p>
                <p className="text-label">{new Date(task.startedAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          )}

          {task.completedAt && (
            <div className="flex items-start gap-3">
              <Clock className="size-4 mt-0.5 text-success shrink-0" />
              <div>
                <p className="text-micro text-muted-foreground">{t('actions.complete')}</p>
                <p className="text-label">{new Date(task.completedAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          )}

          {task.reservation && (
            <div className="pt-3 border-t">
              <p className="text-micro text-muted-foreground mb-1">{t('fields.notes')}</p>
              <p className="text-body">
                {task.reservation.guestName} — {new Date(task.reservation.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → {new Date(task.reservation.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          )}

          {task.note && (
            <div className="pt-3 border-t">
              <p className="text-micro text-muted-foreground mb-1">{t('fields.notes')}</p>
              <p className="text-body">{task.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={assignOpen} onOpenChange={setAssignOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>{t('assignTo')}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={async () => {
                  const res = await fetch(`${API_URL}/tasks/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ assignedUserId: m.user.id }),
                  })
                  if (res.ok) {
                    const updated = await res.json()
                    setTask(updated)
                    setAssignOpen(false)
                    toast.success(`${t('assigned')} → ${m.user.name}`)
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium">
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-label">{m.user.name}</p>
                  <p className="text-micro text-muted-foreground">{m.role}</p>
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
