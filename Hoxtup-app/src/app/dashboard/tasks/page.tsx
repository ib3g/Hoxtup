'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PropertyColorDot } from '@/components/property-color-dot'
import { TaskTypeIcon } from '@/components/task-type-icon'
import { TaskFormSheet } from '@/components/task-form-sheet'
import { TaskDetailSheet } from '@/components/task-detail-sheet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { TASK_STATUS_COLORS, TASK_STATUS_CARD_STYLES, taskStatusKey } from '@/lib/task-constants'

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


export default function TasksPage() {
  const { t } = useTranslation('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [propertyFilter, setPropertyFilter] = useState<string>('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

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
      <div className="flex justify-end">
        <Button onClick={() => setSheetOpen(true)}>
          <Plus className="size-4 mr-2" />
          {t('create')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-45">
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
        <div className="space-y-1.5">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => { setDetailTaskId(task.id); setDetailOpen(true) }}
              className="w-full text-left"
            >
              <Card className={cn('border-l-4 hover:bg-muted/50 transition-colors cursor-pointer', TASK_STATUS_CARD_STYLES[task.status] ?? '')}>
                <CardContent className="px-3 py-2.5 flex items-center gap-2.5">
                  <TaskTypeIcon type={task.type} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', task.status === 'COMPLETED' && 'line-through opacity-60')}>{task.title}</p>
                    <p className="text-micro text-muted-foreground truncate">
                      {task.property.name}
                      {task.assignedUser && ` · ${task.assignedUser.name}`}
                      {task.scheduledAt && ` · ${new Date(task.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
                    </p>
                  </div>
                  <Badge className={cn('text-micro shrink-0 border', TASK_STATUS_COLORS[task.status] ?? '')}>
                    {t(`status.${taskStatusKey(task.status)}`)}
                  </Badge>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      <TaskFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleCreated}
        properties={properties}
      />
      <TaskDetailSheet
        taskId={detailTaskId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onTaskUpdated={fetchData}
      />
    </div>
  )
}
