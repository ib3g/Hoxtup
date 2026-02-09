'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Archive, RotateCcw, MapPin, Users, CalendarDays, FileText, Plus, Trash2, Link2, CheckCircle, XCircle, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PropertyColorDot } from '@/components/property-color-dot'
import { TASK_STATUS_COLORS } from '@/lib/task-constants'
import { PropertyFormSheet } from '@/components/property-form-sheet'
import { TaskDetailSheet } from '@/components/task-detail-sheet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property {
  id: string
  name: string
  address: string
  type: string
  colorIndex: number
  capacity: number
  notes: string | null
  archivedAt: string | null
  createdAt: string
}

interface TaskItem {
  id: string; title: string; type: string; status: string; scheduledAt: string | null
  assignedUser: { id: string; name: string } | null
}

interface ReservationItem {
  id: string; guestName: string; checkIn: string; checkOut: string; status: string
}

export default function PropertyDetailPage() {
  const { t } = useTranslation('properties')
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [reservations, setReservations] = useState<ReservationItem[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskSheetOpen, setTaskSheetOpen] = useState(false)

  const fetchProperty = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API_URL}/properties/${id}`, { credentials: 'include' }).then((r) => r.ok ? r.json() : null),
      fetch(`${API_URL}/tasks?propertyId=${id}`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
      fetch(`${API_URL}/reservations?propertyId=${id}`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
    ])
      .then(([prop, taskData, resData]: [Property | null, TaskItem[], ReservationItem[]]) => {
        setProperty(prop)
        setTasks(taskData)
        setReservations(resData)
      })
      .catch(() => { setProperty(null); setTasks([]); setReservations([]) })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { fetchProperty() }, [fetchProperty])

  async function handleArchive() {
    setArchiving(true)
    try {
      const res = await fetch(`${API_URL}/properties/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        toast.success(t('form.success.archived'))
        router.push('/dashboard/properties')
      }
    } finally {
      setArchiving(false)
      setArchiveDialogOpen(false)
    }
  }

  async function handleReactivate() {
    const res = await fetch(`${API_URL}/properties/${id}/reactivate`, {
      method: 'PATCH',
      credentials: 'include',
    })
    if (res.ok) {
      toast.success(t('form.success.reactivated'))
      fetchProperty()
    }
  }

  function handleEditSuccess() {
    setEditOpen(false)
    fetchProperty()
    toast.success(t('form.success.updated'))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-body text-muted-foreground">{t('detail.notFound')}</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/dashboard/properties')}>
          <ArrowLeft className="size-4 mr-2" />
          {t('title')}
        </Button>
      </div>
    )
  }

  const isArchived = !!property.archivedAt


  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <PropertyColorDot colorIndex={property.colorIndex} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-heading truncate">{property.name}</h2>
                {isArchived && <Badge variant="secondary">{t('status.archived')}</Badge>}
              </div>
              <p className="text-caption text-muted-foreground truncate">{property.address}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {!isArchived && (
                <>
                  <Button variant="ghost" size="xs" onClick={() => setEditOpen(true)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => setArchiveDialogOpen(true)}>
                    <Archive className="size-3.5" />
                  </Button>
                </>
              )}
              {isArchived && (
                <Button variant="secondary" size="xs" onClick={handleReactivate}>
                  <RotateCcw className="size-3.5 mr-1" />
                  {t('detail.actions.reactivate')}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t">
            <div>
              <p className="text-micro text-muted-foreground">{t('detail.info.type')}</p>
              <p className="text-caption font-medium">{t(`type.${property.type.toLowerCase()}`)}</p>
            </div>
            <div>
              <p className="text-micro text-muted-foreground">{t('detail.info.capacity')}</p>
              <p className="text-caption font-medium">{property.capacity}</p>
            </div>
            <div>
              <p className="text-micro text-muted-foreground">{t('detail.info.createdAt')}</p>
              <p className="text-caption font-medium">
                {new Date(property.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-micro text-muted-foreground">{t('detail.info.notes')}</p>
              <p className="text-caption font-medium truncate">{property.notes || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                <h3 className="text-label">{t('detail.upcomingReservations')}</h3>
              </div>
              <Badge variant="secondary">{reservations.length}</Badge>
            </div>
            {reservations.length === 0 ? (
              <p className="text-caption text-muted-foreground py-4 text-center">{t('detail.noReservations')}</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reservations.slice(0, 8).map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-medium truncate">{r.guestName}</p>
                      <p className="text-micro text-muted-foreground">
                        {new Date(r.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → {new Date(r.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-micro shrink-0">{r.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-4 text-muted-foreground" />
                <h3 className="text-label">{t('detail.recentTasks')}</h3>
              </div>
              <Badge variant="secondary">{tasks.length}</Badge>
            </div>
            {tasks.length === 0 ? (
              <p className="text-caption text-muted-foreground py-4 text-center">{t('detail.noTasks')}</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tasks.slice(0, 8).map((task) => (
                  <button key={task.id} onClick={() => { setSelectedTaskId(task.id); setTaskSheetOpen(true) }} className="w-full text-left">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-caption font-medium truncate">{task.title}</p>
                        <p className="text-micro text-muted-foreground">
                          {task.scheduledAt ? new Date(task.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                          {task.assignedUser && ` · ${task.assignedUser.name}`}
                        </p>
                      </div>
                      <Badge className={cn('text-micro shrink-0', TASK_STATUS_COLORS[task.status] ?? 'bg-muted')}>
                        {task.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ICalTab propertyId={property.id} />

      <PropertyFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={handleEditSuccess}
        property={property}
      />

      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('detail.archiveDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('detail.archiveDialog.description', { name: property.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setArchiveDialogOpen(false)}>
              {t('detail.archiveDialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleArchive} disabled={archiving}>
              {t('detail.archiveDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TaskDetailSheet
        taskId={selectedTaskId}
        open={taskSheetOpen}
        onOpenChange={setTaskSheetOpen}
        onTaskUpdated={fetchProperty}
      />
    </div>
  )
}

const ICAL_API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface ICalSource {
  id: string
  name: string
  url: string
  lastSyncAt: string | null
  lastSyncStatus: string | null
  errorMessage: string | null
  createdAt: string
}

function ICalTab({ propertyId }: { propertyId: string }) {
  const { t } = useTranslation('properties')
  const [sources, setSources] = useState<ICalSource[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchSources = useCallback(() => {
    setLoading(true)
    fetch(`${ICAL_API}/properties/${propertyId}/ical-sources`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ICalSource[]) => setSources(data))
      .catch(() => setSources([]))
      .finally(() => setLoading(false))
  }, [propertyId])

  useEffect(() => { fetchSources() }, [fetchSources])

  async function handleAdd() {
    setSubmitting(true)
    try {
      const res = await fetch(`${ICAL_API}/properties/${propertyId}/ical-sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, url }),
      })
      if (res.ok) {
        setName('')
        setUrl('')
        setAdding(false)
        fetchSources()
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(sourceId: string) {
    await fetch(`${ICAL_API}/properties/${propertyId}/ical-sources/${sourceId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    fetchSources()
  }

  if (loading) return <Skeleton className="h-32 rounded-lg" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label">{t('ical.title')}</h3>
        <Button size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="size-4 mr-1" />
          {t('ical.add')}
        </Button>
      </div>

      {adding && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <input
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder={t('ical.sourceNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder={t('ical.urlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button size="sm" onClick={handleAdd} disabled={submitting || !name || !url}>
              {submitting ? t('ical.validating') : t('ical.add')}
            </Button>
          </CardContent>
        </Card>
      )}

      {sources.length === 0 && !adding ? (
        <Card>
          <CardContent className="p-5 text-center text-muted-foreground">
            <Link2 className="size-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-body">{t('ical.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sources.map((src) => (
            <Card key={src.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-label">{src.name}</span>
                    {src.lastSyncStatus === 'success' ? (
                      <CheckCircle className="size-3.5 text-success" />
                    ) : src.lastSyncStatus === 'error' ? (
                      <XCircle className="size-3.5 text-danger" />
                    ) : null}
                  </div>
                  <p className="text-micro text-muted-foreground truncate">{src.url}</p>
                  {src.lastSyncAt && (
                    <p className="text-micro text-muted-foreground">
                      {new Date(src.lastSyncAt).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(src.id)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
