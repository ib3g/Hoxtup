'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Building2, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PropertyColorDot } from '@/components/features/properties/PropertyColorDot'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonList } from '@/components/common/Skeleton'

import { api } from '@/lib/api-client'

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
  _count?: { assignments: number }
}

type PropertyType = components['schemas']['Property']['type']

export default function PropertiesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const loadProperties = useCallback(async () => {
    try {
      const { data, error } = await api.GET('/properties')
      if (data) {
        setProperties(data.properties as Property[])
      } else if (error) {
        console.error('Failed to load properties:', error)
      }
    } catch (err) {
      console.error('Properties load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
      return
    }
    if (isAuthenticated) loadProperties()
  }, [isAuthenticated, authLoading, router, loadProperties])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get('name') as string,
      address: form.get('address') as string,
      capacity: Number(form.get('capacity')) || 1,
      type: form.get('type') as PropertyType,
      notes: (form.get('notes') as string) || undefined,
    }

    const { data, error } = await api.POST('/properties', {
      body,
    })

    if (data) {
      setShowForm(false)
      await loadProperties()
    } else if (error) {
      console.error('Property creation error:', error)
    }
  }

  if (authLoading || loading) {
    return <div className="p-4"><SkeletonList count={4} /></div>
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('properties:title')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          <Plus size={16} />
          {t('properties:create')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">{t('properties:create')}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="create-name" className="mb-1 block text-sm font-medium text-foreground">{t('properties:fields.name')}</label>
              <input id="create-name" name="name" required minLength={2}
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="create-address" className="mb-1 block text-sm font-medium text-foreground">{t('properties:fields.address')}</label>
              <input id="create-address" name="address" required minLength={5}
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="create-capacity" className="mb-1 block text-sm font-medium text-foreground">{t('properties:fields.maxGuests')}</label>
              <input id="create-capacity" name="capacity" type="number" min={1} max={100} defaultValue={1}
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="create-type" className="mb-1 block text-sm font-medium text-foreground">{t('properties:fields.type')}</label>
              <select id="create-type" name="type" defaultValue="APARTMENT" className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="APARTMENT">{t('properties:type.apartment')}</option>
                <option value="HOUSE">{t('properties:type.house')}</option>
                <option value="VILLA">{t('properties:type.villa')}</option>
                <option value="STUDIO">{t('properties:type.studio')}</option>
                <option value="ROOM">{t('properties:type.room')}</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="create-notes" className="mb-1 block text-sm font-medium text-foreground">{t('properties:fields.description')}</label>
            <textarea id="create-notes" name="notes" rows={2}
              className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90">
              {t('common:create')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
              {t('common:cancel')}
            </button>
          </div>
        </form>
      )}

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t('properties:empty.title')}
          description={t('properties:empty.description')}
          action={
            <button onClick={() => setShowForm(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              {t('properties:create')}
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {properties.map((p) => (
            <a
              key={p.id}
              href={`/properties/${p.id}`}
              className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <PropertyColorDot colorIndex={p.colorIndex} size="card" />
              <div className="flex-1">
                <p className="font-medium text-foreground">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.address}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{p.capacity} {t('properties:fields.maxGuests').toLowerCase()}</p>
                <p className="text-xs">{t(`properties:type.${p.type.toLowerCase()}`)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
