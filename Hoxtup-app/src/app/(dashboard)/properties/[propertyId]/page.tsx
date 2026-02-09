'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MapPin, Users, Home, Link2, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PropertyColorDot } from '@/components/features/properties/PropertyColorDot'

import { api } from '@/lib/api-client'
import { SkeletonCard } from '@/components/common/Skeleton'

import type { components } from '@/generated/api'

interface Property {
  id: string
  name: string
  address: string
  capacity: number
  type: string
  colorIndex: number
  photoUrl: string | null
  notes: string | null
  assignments: { userId: string }[]
}

type PropertyType = components['schemas']['Property']['type']

interface ICalSource {
  id: string
  name: string
  url: string
  syncIntervalMinutes: number
  lastSyncAt: string | null
  lastSyncStatus: string | null
  errorMessage: string | null
}

export default function PropertyProfilePage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [icalSources, setIcalSources] = useState<ICalSource[]>([])
  const [showAddIcal, setShowAddIcal] = useState(false)
  const [icalLoading, setIcalLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!propertyId) return

    try {
      const [propRes, icalRes] = await Promise.all([
        api.GET('/properties/{id}', { params: { path: { id: propertyId } } }),
        api.GET('/properties/{propertyId}/ical-sources', { params: { path: { propertyId } } })
      ])

      if (propRes.data) setProperty(propRes.data as Property)
      if (icalRes.data) setIcalSources(icalRes.data.sources as ICalSource[])
    } catch (error) {
      console.error('Failed to load property data:', error)
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
      return
    }
    if (isAuthenticated && propertyId) {
      loadData()
    }
  }, [isAuthenticated, authLoading, propertyId, router, loadData])

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body: components['schemas']['UpdatePropertyInput'] = {
      name: form.get('name') as string,
      address: form.get('address') as string,
      capacity: Number(form.get('capacity')) || 1,
      type: form.get('type') as PropertyType,
      notes: (form.get('notes') as string) || undefined,
    }

    const { data, error } = await api.PATCH('/properties/{id}', {
      params: { path: { id: propertyId } },
      body,
    })

    if (data) {
      setProperty(data as Property)
      setEditing(false)
    } else if (error) {
      console.error('Update failed:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-3xl p-4 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">{t('common:error.notFound')}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-primary underline">
          {t('common:back')}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <button onClick={() => router.push('/properties')} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> {t('common:back')}
      </button>

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-start gap-3">
          <PropertyColorDot colorIndex={property.colorIndex} size="selector" className="mt-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">{property.name}</h1>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={14} /> {property.address}
            </p>
          </div>
          <button onClick={() => setEditing(!editing)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
            {editing ? t('common:cancel') : t('common:edit')}
          </button>
        </div>

        <div className="mb-4 flex gap-4 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users size={14} /> {property.capacity} {t('properties:fields.maxGuests').toLowerCase()}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Home size={14} /> {t(`properties:type.${property.type.toLowerCase()}`)}
          </span>
        </div>

        {property.notes && !editing && (
          <p className="mb-4 text-sm text-muted-foreground">{property.notes}</p>
        )}

        {editing && (
          <form onSubmit={handleUpdate} className="space-y-3 border-t pt-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-foreground">{t('properties:fields.name')}</label>
                <input id="edit-name" name="name" defaultValue={property.name} required minLength={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="edit-address" className="mb-1 block text-sm font-medium text-foreground">{t('properties:fields.address')}</label>
                <input id="edit-address" name="address" defaultValue={property.address} required minLength={5}
                  className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="edit-capacity" className="mb-1 block text-sm font-medium text-foreground">{t('properties:fields.maxGuests')}</label>
                <input id="edit-capacity" name="capacity" type="number" min={1} max={100} defaultValue={property.capacity}
                  className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="edit-type" className="mb-1 block text-sm font-medium text-foreground">{t('properties:fields.type')}</label>
                <select id="edit-type" name="type" defaultValue={property.type} className="w-full rounded-lg border px-3 py-2 text-sm">
                  <option value="APARTMENT">{t('properties:type.apartment')}</option>
                  <option value="HOUSE">{t('properties:type.house')}</option>
                  <option value="VILLA">{t('properties:type.villa')}</option>
                  <option value="STUDIO">{t('properties:type.studio')}</option>
                  <option value="ROOM">{t('properties:type.room')}</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="edit-notes" className="mb-1 block text-sm font-medium text-foreground">{t('properties:fields.description')}</label>
              <textarea id="edit-notes" name="notes" defaultValue={property.notes ?? ''} rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90">
              {t('common:save')}
            </button>
          </form>
        )}

        <div className="mt-6 border-t pt-4">
          <h3 className="mb-2 text-sm font-medium text-foreground">{t('settings:team.members')}</h3>
          {(property.assignments?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">{t('properties:profile.noMembers')}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t('properties:profile.membersCount', { count: property.assignments?.length ?? 0 })}</p>
          )}
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{t('properties:ical.title')}</h3>
            <button onClick={() => setShowAddIcal(true)} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Plus size={14} /> {t('properties:ical.add')}
            </button>
          </div>

          {showAddIcal && (
            <form onSubmit={async (e) => {
              e.preventDefault()
              setIcalLoading(true)
              const form = new FormData(e.currentTarget)
              const { data, error } = await api.POST('/properties/{propertyId}/ical-sources', {
                params: { path: { propertyId } },
                body: {
                  name: form.get('ical-name') as string,
                  url: form.get('ical-url') as string,
                  syncIntervalMinutes: Number(form.get('ical-interval')) || 15,
                },
              })
              if (data) {
                setIcalSources((prev) => [data as ICalSource, ...prev])
                setShowAddIcal(false)
              } else if (error) {
                console.error('Failed to add iCal source:', error)
              }
              setIcalLoading(false)
            }} className="mb-4 space-y-3 rounded-lg border bg-muted/30 p-3">
              <div>
                <label htmlFor="ical-name" className="mb-1 block text-sm font-medium text-foreground">{t('properties:ical.sourceName')}</label>
                <input id="ical-name" name="ical-name" required minLength={2} placeholder={t('properties:ical.sourceNamePlaceholder')}
                  className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="ical-url" className="mb-1 block text-sm font-medium text-foreground">{t('properties:ical.url')}</label>
                <input id="ical-url" name="ical-url" type="url" required placeholder={t('properties:ical.urlPlaceholder')}
                  className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="ical-interval" className="mb-1 block text-sm font-medium text-foreground">{t('properties:ical.interval')}</label>
                <select id="ical-interval" name="ical-interval" defaultValue="15" className="w-full rounded-lg border px-3 py-2 text-sm">
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="25">25 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={icalLoading}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50">
                  {icalLoading ? t('properties:ical.validating') : t('properties:ical.add')}
                </button>
                <button type="button" onClick={() => setShowAddIcal(false)}
                  className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
                  {t('common:cancel')}
                </button>
              </div>
            </form>
          )}

          {icalSources.length === 0 && !showAddIcal ? (
            <p className="text-sm text-muted-foreground">{t('properties:ical.empty')}</p>
          ) : (
            <div className="space-y-2">
              {icalSources.map((src) => (
                <div key={src.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Link2 size={16} className="shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{src.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{src.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {src.lastSyncStatus === 'ok' ? (
                      <CheckCircle size={14} className="text-success" />
                    ) : src.lastSyncStatus === 'error' ? (
                      <AlertCircle size={14} className="text-danger" />
                    ) : null}
                    <span className="text-xs text-muted-foreground">{src.syncIntervalMinutes}min</span>
                    <button
                      onClick={async () => {
                        if (!confirm(t('properties:ical.deleteConfirm', { name: src.name }))) return
                        const { error } = await api.DELETE('/properties/{propertyId}/ical-sources/{sourceId}', {
                          params: { path: { propertyId, sourceId: src.id } },
                        })
                        if (!error) {
                          setIcalSources((prev) => prev.filter((s) => s.id !== src.id))
                        } else {
                          console.error('Failed to delete iCal source:', error)
                        }
                      }}
                      className="text-danger hover:text-danger/80"
                      aria-label={t('common:delete') + ' ' + src.name}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
