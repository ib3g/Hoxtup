'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays, FileText, Clock, AlertTriangle, Pencil, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PropertyColorDot } from '@/components/property-color-dot'
import { TaskTypeIcon } from '@/components/task-type-icon'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { TASK_STATUS_COLORS, taskStatusKey, taskTypeKey } from '@/lib/task-constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property { id: string; name: string; colorIndex: number }
interface AssignedUser { id: string; name: string }
interface Reservation { id: string; guestName: string; checkIn: string; checkOut: string }
interface Task {
  id: string; title: string; description: string | null; type: string; status: string
  scheduledAt: string | null; startedAt: string | null; completedAt: string | null
  note: string | null; property: Property; assignedUser: AssignedUser | null
  reservation: Reservation | null; createdAt: string
}
interface Member { id: string; userId: string; role: string; user: { id: string; name: string; email: string } }


const CAN_MANAGE_ROLES = ['owner', 'admin', 'manager']

interface TaskDetailSheetProps {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated?: () => void
}

export function TaskDetailSheet({ taskId, open, onOpenChange, onTaskUpdated }: TaskDetailSheetProps) {
  const { t } = useTranslation('tasks')
  const { activeOrg } = useAuth()
  const memberRole = activeOrg?.members?.[0]?.role ?? 'member'
  const canManage = CAN_MANAGE_ROLES.includes(memberRole)

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editDescription, setEditDescription] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchTask = useCallback(() => {
    if (!taskId) return
    setLoading(true)
    fetch(`${API_URL}/tasks/${taskId}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: Task | null) => setTask(data))
      .catch(() => setTask(null))
      .finally(() => setLoading(false))
  }, [taskId])

  useEffect(() => {
    if (open && taskId) {
      fetchTask()
      fetch(`${API_URL}/team`, { credentials: 'include' })
        .then((r) => r.ok ? r.json() : [])
        .then(setMembers)
        .catch(() => setMembers([]))
    }
    if (!open) {
      setTask(null)
      setEditing(false)
      setDeleteOpen(false)
    }
  }, [open, taskId, fetchTask])

  async function transition(newStatus: string) {
    if (!task || !taskId) return
    const prev = task
    setTask({ ...prev, status: newStatus })
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setTask(updated)
        toast.success(t('form.success.updated'))
        onTaskUpdated?.()
      } else {
        setTask(prev)
      }
    } catch {
      setTask(prev)
    }
  }

  async function handleSaveEdit() {
    if (!taskId || !task) return
    setEditSaving(true)
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description: editDescription || null }),
      })
      if (res.ok) {
        const updated = await res.json()
        setTask(updated)
        setEditing(false)
        toast.success(t('form.success.updated'))
        onTaskUpdated?.()
      }
    } finally {
      setEditSaving(false)
    }
  }

  function buildTitleWithAssignee(currentTitle: string, firstName: string, previousAssignee: string | null) {
    let base = currentTitle
    if (previousAssignee) {
      const prevFirst = previousAssignee.split(' ')[0]
      if (base.endsWith(` - ${prevFirst}`)) {
        base = base.slice(0, -(` - ${prevFirst}`.length))
      }
    }
    return `${base} - ${firstName}`
  }

  async function handleAssign(userId: string, userName: string) {
    if (!taskId || !task) return
    const firstName = userName.split(' ')[0]
    const newTitle = buildTitleWithAssignee(task.title, firstName, task.assignedUser?.name ?? null)
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ assignedUserId: userId, title: newTitle }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTask(updated)
      toast.success(`${t('assigned')} → ${userName}`)
      onTaskUpdated?.()
    }
  }

  async function handleDelete() {
    if (!taskId) return
    setDeleting(true)
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok || res.status === 204) {
        toast.success(t('deleteSuccess'))
        setDeleteOpen(false)
        onOpenChange(false)
        onTaskUpdated?.()
      }
    } finally {
      setDeleting(false)
    }
  }

  function startEditing() {
    if (!task) return
    setEditDescription(task.description ?? '')
    setEditing(true)
  }

  const isEditable = task ? !['COMPLETED', 'CANCELLED'].includes(task.status) : false


  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {loading ? (
            <div className="space-y-4 p-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          ) : !task ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-body">{t('empty.title')}</p>
            </div>
          ) : (
            <div className="space-y-4 p-2">
              <SheetHeader className="p-0">
                <div className="flex items-center gap-3">
                  <TaskTypeIcon type={task.type} size="md" />
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-left truncate">{task.title}</SheetTitle>
                    <p className="text-micro text-muted-foreground flex items-center gap-1">
                      <PropertyColorDot colorIndex={task.property.colorIndex} size="sm" />
                      {task.property.name}
                    </p>
                  </div>
                  {canManage && isEditable && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="xs" onClick={startEditing}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="size-3.5 text-danger" />
                      </Button>
                    </div>
                  )}
                </div>
              </SheetHeader>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{t(`type.${taskTypeKey(task.type)}`)}</Badge>
                <Badge className={cn('border', TASK_STATUS_COLORS[task.status] ?? '')}>
                  {t(`status.${taskStatusKey(task.status)}`)}
                </Badge>
              </div>

              {canManage && isEditable && members.length > 0 && (
                <div className="space-y-1">
                  <Label>{t('assignTo')}</Label>
                  <Select
                    value={task.assignedUser?.id ?? '_none'}
                    onValueChange={(val) => {
                      if (val === '_none') return
                      const m = members.find((mb) => mb.user.id === val)
                      if (m) handleAssign(m.user.id, m.user.name)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectStaff')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">{t('unassigned')}</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.user.id}>
                          {m.user.name} ({m.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!canManage && task.assignedUser && (
                <p className="text-caption text-muted-foreground">{t('assignTo')}: {task.assignedUser.name}</p>
              )}

              {editing && (
                <div className="space-y-3 rounded-lg border border-brand-primary p-3">
                  <div className="space-y-1">
                    <Label>{t('form.description')}</Label>
                    <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit} disabled={editSaving}>
                      {editSaving ? t('updating') : t('form.submit')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                      {t('actions.cancel')}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {task.status === 'PENDING_VALIDATION' && (
                  <Button size="sm" className="flex-1" onClick={() => transition('TODO')}>
                    {t('actions.validate')}
                  </Button>
                )}
                {task.status === 'TODO' && (
                  <Button size="sm" className="flex-1" onClick={() => transition('IN_PROGRESS')}>
                    {t('actions.start')}
                  </Button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <>
                    <Button size="sm" className="flex-1" onClick={() => transition('COMPLETED')}>
                      {t('actions.complete')}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => transition('INCIDENT')}>
                      <AlertTriangle className="size-3.5 mr-1" />
                      {t('actions.reportIncident')}
                    </Button>
                  </>
                )}
                {task.status === 'INCIDENT' && (
                  <>
                    <Button size="sm" className="flex-1" onClick={() => transition('IN_PROGRESS')}>
                      {t('actions.resolveResume')}
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => transition('COMPLETED')}>
                      {t('actions.resolveComplete')}
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                {task.description && (
                  <div className="flex items-start gap-2">
                    <FileText className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-micro text-muted-foreground">{t('fields.description')}</p>
                      <p className="text-caption">{task.description}</p>
                    </div>
                  </div>
                )}

                {task.scheduledAt && (
                  <div className="flex items-start gap-2">
                    <CalendarDays className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-micro text-muted-foreground">{t('scheduledAt')}</p>
                      <p className="text-caption">
                        {new Date(task.scheduledAt).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {task.startedAt && (
                  <div className="flex items-start gap-2">
                    <Clock className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-micro text-muted-foreground">{t('actions.start')}</p>
                      <p className="text-caption">{new Date(task.startedAt).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                )}

                {task.status === 'INCIDENT' && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-3.5 mt-0.5 text-danger shrink-0" />
                    <div>
                      <p className="text-micro text-danger">{t('actions.reportIncident')}</p>
                      <p className="text-caption">{task.note ?? t('status.incident')}</p>
                    </div>
                  </div>
                )}

                {task.completedAt && (
                  <div className="flex items-start gap-2">
                    <Clock className="size-3.5 mt-0.5 text-success shrink-0" />
                    <div>
                      <p className="text-micro text-muted-foreground">{t('actions.complete')}</p>
                      <p className="text-caption">{new Date(task.completedAt).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                )}

                {task.reservation && (
                  <div className="flex items-start gap-2 pt-2 border-t">
                    <CalendarDays className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-micro text-muted-foreground">{t('fields.notes')}</p>
                      <p className="text-caption">
                        {task.reservation.guestName} — {new Date(task.reservation.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → {new Date(task.reservation.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                )}

                {task.note && task.status !== 'INCIDENT' && (
                  <div className="flex items-start gap-2">
                    <FileText className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-micro text-muted-foreground">{t('fields.notes')}</p>
                      <p className="text-caption">{task.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirm')}</DialogTitle>
            <DialogDescription>{t('deleteDescription', { title: task?.title })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              {t('deleteCancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
