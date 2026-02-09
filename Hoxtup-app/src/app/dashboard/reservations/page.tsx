'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, CalendarDays, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PropertyColorDot } from '@/components/property-color-dot'
import { ReservationFormSheet } from '@/components/reservation-form-sheet'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property {
  id: string
  name: string
  colorIndex: number
}

interface Reservation {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  status: string
  sourceType: string
  property: Property
  createdAt: string
}

export default function ReservationsPage() {
  const { t } = useTranslation('reservations')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [propertyFilter, setPropertyFilter] = useState<string>('all')
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (propertyFilter !== 'all') params.set('propertyId', propertyFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter.toUpperCase())

    Promise.all([
      fetch(`${API_URL}/reservations?${params}`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
      fetch(`${API_URL}/properties`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
    ])
      .then(([resData, propData]: [Reservation[], Property[]]) => {
        setReservations(resData)
        setProperties(propData)
      })
      .catch(() => {
        setReservations([])
        setProperties([])
      })
      .finally(() => setLoading(false))
  }, [propertyFilter, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleCreated() {
    setSheetOpen(false)
    fetchData()
    toast.success(t('form.success.created'))
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  function nightCount(checkIn: string, checkOut: string) {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
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
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter.all')}</SelectItem>
            <SelectItem value="confirmed">{t('filter.confirmed')}</SelectItem>
            <SelectItem value="cancelled">{t('filter.cancelled')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter.allProperties')}</SelectItem>
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

      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <CalendarDays className="size-6 text-muted-foreground" />
          </div>
          <p className="text-body text-muted-foreground">{t('empty.description')}</p>
          <Button className="mt-4" onClick={() => setSheetOpen(true)}>
            <Plus className="size-4 mr-2" />
            {t('create')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => (
            <Card key={res.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <PropertyColorDot colorIndex={res.property.colorIndex} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <User className="size-3 text-muted-foreground" />
                        <span className="text-label truncate">{res.guestName}</span>
                      </div>
                      {res.status === 'CANCELLED' && (
                        <Badge variant="destructive" className="text-micro">{t('status.cancelled')}</Badge>
                      )}
                      <Badge variant="secondary" className="text-micro">
                        {t(`source.${res.sourceType}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                      <CalendarDays className="size-3" />
                      <span className="text-caption">
                        {formatDate(res.checkIn)} → {formatDate(res.checkOut)}
                        <span className="ml-1 text-micro">({t('nights', { count: nightCount(res.checkIn, res.checkOut) })})</span>
                      </span>
                    </div>
                    <p className="text-micro text-muted-foreground mt-0.5">{res.property.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReservationFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleCreated}
        properties={properties}
      />
    </div>
  )
}
