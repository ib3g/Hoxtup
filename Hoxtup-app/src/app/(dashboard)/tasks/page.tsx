'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ClipboardList, Plus, Filter } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api-client'
import { SkeletonList } from '../../../components/common/Skeleton'
import { EmptyState } from '../../../components/common/EmptyState'
import { TaskValidationBanner } from '../../../components/features/tasks/TaskValidationBanner'
import { PropertyColorDot } from '../../../components/features/properties/PropertyColorDot'
import { TaskCard } from '../../../components/features/tasks/TaskCard'

import type { components } from '@/generated/api'

type TaskStatus = components['schemas']['Task']['status']
type Task = components['schemas']['Task']
type Property = components['schemas']['Property']

const STATUS_PRIORITY: Record<string, number> = {
  INCIDENT: 0,
  PENDING_VALIDATION: 1,
  TODO: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function sortTasks(tasks: any[]): any[] {
  return [...tasks].sort((a, b) => {
    const pa = STATUS_PRIORITY[a.status] ?? 99
    const pb = STATUS_PRIORITY[b.status] ?? 99
    if (pa !== pb) return pa - pb
    if (a.scheduledAt && b.scheduledAt) return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    if (a.scheduledAt) return -1
    if (b.scheduledAt) return 1
    return 0
  })
}

export default function TasksPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [tasks, setTasks] = useState<any[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [filterProperty, setFilterProperty] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const pendingCount = tasks.filter((t) => t.status === 'PENDING_VALIDATION').length

  const loadData = useCallback(async () => {
    try {
      const [tasksRes, propRes, staffRes] = await Promise.all([
        api.GET('/tasks', {
          params: {
            query: {
              propertyId: filterProperty || undefined,
              status: filterStatus as any || undefined,
            }
          }
        }),
        api.GET('/properties', {}),
        api.GET('/team', {}), // Changed from /users to /team
      ])

      if (tasksRes.data) {
        setTasks(tasksRes.data.tasks)
      }
      if (propRes.data) {
        setProperties(propRes.data.properties)
      }
      if (staffRes.data) {
        setStaff((staffRes.data as any).users ?? [])
      }
    } catch (error) {
      console.error('Failed to load tasks data:', error)
    } finally {
      setLoading(false)
    }
  }, [filterProperty, filterStatus])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
      return
    }
    if (isAuthenticated) loadData()
  }, [isAuthenticated, authLoading, router, loadData])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)

    const body: components['schemas']['CreateTaskInput'] = {
      propertyId: form.get('propertyId') as string,
      title: form.get('title') as string,
      type: form.get('type') as any,
      description: (form.get('description') as string) || undefined,
      scheduledAt: (form.get('scheduledAt') as string) || undefined,
      assignedUserId: (form.get('assignedUserId') as string) || undefined,
      durationMinutes: form.get('durationMinutes') ? Number(form.get('durationMinutes')) : undefined,
    }

    const { data, error } = await api.POST('/tasks', {
      body,
    })

    if (data) {
      setShowForm(false)
      await loadData()
    } else if (error) {
      console.error('Task creation error:', error)
    }
    setCreating(false)
  }

  const handleTransition = async (taskId: string, action: string) => {
    const { error } = await api.PATCH('/tasks/{id}/transition', {
      params: { path: { id: taskId } },
      body: { action: action as any },
    })
    if (!error) {
      await loadData()
    } else {
      console.error('Transition failed:', error)
    }
  }

  const handleAssign = async (taskId: string, assignedUserId: string) => {
    const { error } = await api.PATCH('/tasks/{id}/assign', {
      params: { path: { id: taskId } },
      body: { assignedUserId },
    })
    if (!error) {
      await loadData()
    } else {
      console.error('Assignment failed:', error)
    }
  }

  if (authLoading || loading) {
    return <div className="p-4"><SkeletonList count={4} /></div>
  }

  const sorted = sortTasks(tasks)

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('tasks:title')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          <Plus size={16} />
          {t('tasks:create')}
        </button>
      </div>

      <TaskValidationBanner
        pendingCount={pendingCount}
        onViewPending={() => setFilterStatus('PENDING_VALIDATION')}
        className="mb-4"
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-muted-foreground" />
        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          className="rounded-lg border px-2 py-1 text-sm"
        >
          <option value="">{t('tasks:noProperty')}</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border px-2 py-1 text-sm"
        >
          <option value="">{t('tasks:filterByStatus')}</option>
          <option value="PENDING_VALIDATION">{t('tasks:status.pendingValidation')}</option>
          <option value="TODO">{t('tasks:status.todo')}</option>
          <option value="IN_PROGRESS">{t('tasks:status.inProgress')}</option>
          <option value="COMPLETED">{t('tasks:status.completed')}</option>
          <option value="INCIDENT">{t('tasks:status.incident')}</option>
        </select>
        {(filterProperty || filterStatus) && (
          <button
            onClick={() => { setFilterProperty(''); setFilterStatus('') }}
            className="text-xs text-muted-foreground underline"
          >
            {t('common:reset', { defaultValue: 'Réinitialiser' })}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">{t('tasks:createManual')}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-foreground">{t('tasks:fields.title')}</label>
              <input id="task-title" name="title" required
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="task-property" className="mb-1 block text-sm font-medium text-foreground">{t('tasks:fields.property')}</label>
              <select id="task-property" name="propertyId" required className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">{t('tasks:noProperty')}</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-type" className="mb-1 block text-sm font-medium text-foreground">Type</label>
              <select id="task-type" name="type" className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="CLEANING">{t('tasks:type.cleaning')}</option>
                <option value="MAINTENANCE">{t('tasks:type.maintenance')}</option>
                <option value="INSPECTION">{t('tasks:type.inspection')}</option>
                <option value="CHECK_IN">{t('tasks:type.checkIn')}</option>
                <option value="CHECK_OUT">{t('tasks:type.checkOut')}</option>
                <option value="TURNOVER">{t('tasks:type.turnover')}</option>
                <option value="OTHER">{t('tasks:type.other')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-scheduled" className="mb-1 block text-sm font-medium text-foreground">{t('tasks:scheduledAt')}</label>
              <input id="task-scheduled" name="scheduledAt" type="datetime-local"
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="task-assign" className="mb-1 block text-sm font-medium text-foreground">{t('tasks:assignTo')}</label>
              <select id="task-assign" name="assignedUserId" className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">{t('tasks:selectStaff')}</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-duration" className="mb-1 block text-sm font-medium text-foreground">Durée (min)</label>
              <input id="task-duration" name="durationMinutes" type="number" min="5" max="480"
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="task-desc" className="mb-1 block text-sm font-medium text-foreground">{t('tasks:fields.description')}</label>
              <textarea id="task-desc" name="description" rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50">
              {creating ? t('tasks:creating') : t('common:create', { defaultValue: 'Créer' })}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
              {t('common:cancel', { defaultValue: 'Annuler' })}
            </button>
          </div>
        </form>
      )}

      {/* Task list */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t('tasks:empty.title')}
          description={t('tasks:empty.description')}
          action={
            <button onClick={() => setShowForm(true)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              {t('tasks:create')}
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((task, index) => (
            <div key={task.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <PropertyColorDot colorIndex={task.property.colorIndex} size="card" />
              <div className="min-w-0 flex-1">
                <TaskCard
                  task={task}
                  variant={index === 0 ? 'prominent' : 'default'}
                  onTransition={(action) => handleTransition(task.id, action)}
                />
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{task.property.name}</span>
                  {task.scheduledAt && (
                    <span>· {formatDateTime(task.scheduledAt)}</span>
                  )}
                  {task.assignedUser ? (
                    <span>· {task.assignedUser.name}</span>
                  ) : (
                    <select
                      value=""
                      onChange={(e) => { if (e.target.value) handleAssign(task.id, e.target.value) }}
                      className="rounded border px-1 py-0.5 text-xs"
                    >
                      <option value="">{t('tasks:assignTo')}</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
