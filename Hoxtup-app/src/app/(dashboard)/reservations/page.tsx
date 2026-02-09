'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { CalendarDays, Plus, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PropertyColorDot } from '@/components/features/properties/PropertyColorDot'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonList } from '@/components/common/Skeleton'

import { api } from '@/lib/api-client'
import { SkeletonList } from '@/components/common/Skeleton'

import type { components } from '@/generated/api'

interface Reservation {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  status: string
  sourceType: string
  property: { id: string; name: string; colorIndex: number }
}

type CreateReservationInput = components['schemas']['CreateReservationInput']

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ReservationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [properties, setProperties] = useState<components['schemas']['Property'][]>([]) // Properties list for selector
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [resRes, propRes] = await Promise.all([
        api.GET('/reservations'),
        api.GET('/properties')
      ])
      
      if (resRes.data) {
        setReservations(resRes.data.reservations as Reservation[])
      }
      if (propRes.data) {
        setProperties(propRes.data.properties)
      }
    } catch (error) {
      console.error('Failed to load reservations data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

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
    
    const body: CreateReservationInput = {
      propertyId: form.get('propertyId') as string,
      guestName: (form.get('guestName') as string) || t('reservations:fields.guestNamePlaceholder'),
      checkIn: form.get('checkIn') as string,
      checkOut: form.get('checkOut') as string,
    }

    const { data, error } = await api.POST('/reservations', {
      body,
    })

    if (data) {
      setShowForm(false)
      await loadData()
    } else if (error) {
      console.error('Reservation creation error:', error)
    }
    setCreating(false)
  }

  const handleCancel = async (id: string, guestName: string) => {
    if (!confirm(t('reservations:cancelConfirm', { name: guestName }))) return
    
    const { error } = await api.DELETE('/reservations/{id}', {
      params: { path: { id } }
    })
    
    if (!error) {
      await loadData()
    } else {
      console.error('Failed to cancel reservation:', error)
    }
  }

  if (authLoading || loading) {
    return <div className="p-4"><SkeletonList count={4} /></div>
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('reservations:title')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          <Plus size={16} />
          {t('reservations:create')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">{t('reservations:createManual')}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="res-property" className="mb-1 block text-sm font-medium text-foreground">{t('reservations:fields.property')}</label>
              <select id="res-property" name="propertyId" required className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">{t('reservations:fields.propertySelect')}</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="res-guest" className="mb-1 block text-sm font-medium text-foreground">{t('reservations:fields.guestName')}</label>
              <input id="res-guest" name="guestName" placeholder={t('reservations:fields.guestNamePlaceholder')}
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="res-checkin" className="mb-1 block text-sm font-medium text-foreground">{t('reservations:fields.checkIn')}</label>
              <input id="res-checkin" name="checkIn" type="date" required
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="res-checkout" className="mb-1 block text-sm font-medium text-foreground">{t('reservations:fields.checkOut')}</label>
              <input id="res-checkout" name="checkOut" type="date" required
                className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50">
              {creating ? t('reservations:creating') : t('common:create')}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
              {t('common:cancel')}
            </button>
          </div>
        </form>
      )}

      {reservations.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={t('reservations:empty.title')}
          description={t('reservations:empty.description')}
          action={
            <button onClick={() => setShowForm(true)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              {t('reservations:create')}
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {reservations.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <PropertyColorDot colorIndex={r.property.colorIndex} size="card" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{r.property.name}</p>
                  {r.sourceType === 'MANUAL' && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">{t('reservations:badge.manual')}</span>
                  )}
                  {r.status === 'CANCELLED' && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">{t('reservations:badge.cancelled')}</span>
                  )}
                </div>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User size={12} /> {r.guestName}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-foreground">{formatDate(r.checkIn)}</p>
                <p className="text-muted-foreground">→ {formatDate(r.checkOut)}</p>
              </div>
              {r.sourceType === 'MANUAL' && r.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleCancel(r.id, r.guestName)}
                  className="ml-2 text-xs text-danger hover:text-danger/80"
                >
                  {t('reservations:cancel')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
