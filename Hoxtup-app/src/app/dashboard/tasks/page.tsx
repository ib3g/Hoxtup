'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Plus, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PropertyColorDot } from '@/components/property-color-dot'
import { TaskFormSheet } from '@/components/task-form-sheet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property { id: string; name: string; colorIndex: number }
interface AssignedUser { id: string; name: string }
interface Task {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  scheduledAt: string | null
  property: Property
  assignedUser: AssignedUser | null
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  PENDING_VALIDATION: 'border-l-warning bg-warning/5',
  TODO: 'border-l-brand-primary',
  IN_PROGRESS: 'border-l-cta',
  COMPLETED: 'border-l-success opacity-60',
  INCIDENT: 'border-l-danger bg-danger/5',
  CANCELLED: 'border-l-muted-foreground opacity-40',
}

export default function TasksPage() {
  const { t } = useTranslation('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [propertyFilter, setPropertyFilter] = useState<string>('all')
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (propertyFilter !== 'all') params.set('propertyId', propertyFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)

    Promise.all([
      fetch(`${API_URL}/tasks?${params}`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
      fetch(`${API_URL}/properties`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
    ])
      .then(([taskData, propData]: [Task[], Property[]]) => {
        setTasks(taskData)
        setProperties(propData)
      })
      .catch(() => { setTasks([]); setProperties([]) })
      .finally(() => setLoading(false))
  }, [propertyFilter, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  function handleCreated() {
    setSheetOpen(false)
    fetchData()
    toast.success(t('form.success.created'))
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    })
    fetchData()
  }

  function statusKey(s: string) {
    const map: Record<string, string> = {
      PENDING_VALIDATION: 'pendingValidation',
      TODO: 'todo',
      IN_PROGRESS: 'inProgress',
      COMPLETED: 'completed',
      INCIDENT: 'incident',
      FUSION_SUGGESTED: 'fusionSuggested',
      CANCELLED: 'cancelled',
    }
    return map[s] ?? s
  }

  function typeKey(t: string) {
    const map: Record<string, string> = {
      CLEANING: 'cleaning',
      MAINTENANCE: 'maintenance',
      INSPECTION: 'inspection',
      CHECK_IN: 'checkIn',
      CHECK_OUT: 'checkOut',
      TURNOVER: 'turnover',
      OTHER: 'other',
    }
    return map[t] ?? t
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading">{t('title')}</h2>
        <Button onClick={() => setSheetOpen(true)}>
          <Plus className="size-4 mr-2" />
          {t('create')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTasks')}</SelectItem>
            <SelectItem value="PENDING_VALIDATION">{t('status.pendingValidation')}</SelectItem>
            <SelectItem value="TODO">{t('status.todo')}</SelectItem>
            <SelectItem value="IN_PROGRESS">{t('status.inProgress')}</SelectItem>
            <SelectItem value="COMPLETED">{t('status.completed')}</SelectItem>
            <SelectItem value="INCIDENT">{t('status.incident')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('filterByProperty')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('noProperty')}</SelectItem>
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

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <ClipboardList className="size-6 text-muted-foreground" />
          </div>
          <p className="text-body text-muted-foreground">{t('empty.description')}</p>
          <Button className="mt-4" onClick={() => setSheetOpen(true)}>
            <Plus className="size-4 mr-2" />
            {t('create')}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card key={task.id} className={cn('border-l-4', STATUS_STYLES[task.status] ?? '')}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <PropertyColorDot colorIndex={task.property.colorIndex} size="md" className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/dashboard/tasks/${task.id}`} className={cn('text-label hover:underline', task.status === 'COMPLETED' && 'line-through')}>{task.title}</Link>
                      <Badge variant="secondary" className="text-micro">{t(`type.${typeKey(task.type)}`)}</Badge>
                      <Badge variant="outline" className="text-micro">{t(`status.${statusKey(task.status)}`)}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-micro text-muted-foreground">
                      <span>{task.property.name}</span>
                      {task.assignedUser && <span>→ {task.assignedUser.name}</span>}
                      {task.scheduledAt && <span>{new Date(task.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {task.status === 'PENDING_VALIDATION' && (
                      <Button size="sm" variant="secondary" onClick={() => handleStatusChange(task.id, 'TODO')}>
                        {t('actions.validate')}
                      </Button>
                    )}
                    {task.status === 'TODO' && (
                      <Button size="sm" onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}>
                        {t('actions.start')}
                      </Button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <Button size="sm" onClick={() => handleStatusChange(task.id, 'COMPLETED')}>
                        {t('actions.complete')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TaskFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleCreated}
        properties={properties}
      />
    </div>
  )
}
