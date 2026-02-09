'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Archive, RotateCcw, MapPin, Users, CalendarDays, FileText } from 'lucide-react'
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
import { PropertyFormSheet } from '@/components/property-form-sheet'
import { toast } from 'sonner'

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

type Tab = 'info' | 'reservations' | 'ical' | 'tasks'

export default function PropertyDetailPage() {
  const { t } = useTranslation('properties')
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [editOpen, setEditOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const fetchProperty = useCallback(() => {
    setLoading(true)
    fetch(`${API_URL}/properties/${id}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Property | null) => setProperty(data))
      .catch(() => setProperty(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetchProperty()
  }, [fetchProperty])

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
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: t('detail.tabs.info') },
    { key: 'reservations', label: t('detail.tabs.reservations') },
    { key: 'ical', label: t('detail.tabs.ical') },
    { key: 'tasks', label: t('detail.tabs.tasks') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/properties')}>
          <ArrowLeft className="size-4" />
        </Button>
        <PropertyColorDot colorIndex={property.colorIndex} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-heading truncate">{property.name}</h2>
            {isArchived && (
              <Badge variant="secondary">{t('status.archived')}</Badge>
            )}
          </div>
          <p className="text-caption text-muted-foreground truncate">{property.address}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {!isArchived && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4 mr-1" />
              {t('detail.actions.edit')}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setArchiveDialogOpen(true)}>
              <Archive className="size-4 mr-1" />
              {t('detail.actions.archive')}
            </Button>
          </>
        )}
        {isArchived && (
          <Button variant="secondary" size="sm" onClick={handleReactivate}>
            <RotateCcw className="size-4 mr-1" />
            {t('detail.actions.reactivate')}
          </Button>
        )}
      </div>

      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-label border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <FileText className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-micro text-muted-foreground">{t('detail.info.type')}</p>
                  <p className="text-label">{t(`type.${property.type.toLowerCase()}`)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-micro text-muted-foreground">{t('detail.info.address')}</p>
                  <p className="text-label">{property.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-micro text-muted-foreground">{t('detail.info.capacity')}</p>
                  <p className="text-label">{property.capacity}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-micro text-muted-foreground">{t('detail.info.createdAt')}</p>
                  <p className="text-label">
                    {new Date(property.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {property.notes ? (
              <div className="pt-3 border-t">
                <p className="text-micro text-muted-foreground mb-1">{t('detail.info.notes')}</p>
                <p className="text-body">{property.notes}</p>
              </div>
            ) : (
              <div className="pt-3 border-t">
                <p className="text-caption text-muted-foreground">{t('detail.info.noNotes')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'reservations' && (
        <Card>
          <CardContent className="p-5 text-center text-muted-foreground">
            <p className="text-body">{t('detail.tabs.reservations')} — {t('empty.description')}</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'ical' && (
        <Card>
          <CardContent className="p-5 text-center text-muted-foreground">
            <p className="text-body">{t('ical.empty')}</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tasks' && (
        <Card>
          <CardContent className="p-5 text-center text-muted-foreground">
            <p className="text-body">{t('detail.tabs.tasks')} — {t('empty.description')}</p>
          </CardContent>
        </Card>
      )}

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
    </div>
  )
}
