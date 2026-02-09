'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays, FileText, MapPin, Moon } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PropertyColorDot } from '@/components/property-color-dot'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property { id: string; name: string; colorIndex: number; address: string | null }
interface Reservation {
  id: string; guestName: string; checkIn: string; checkOut: string
  status: string; source: string; notes: string | null
  property: Property; createdAt: string
}

interface ReservationDetailSheetProps {
  reservationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReservationUpdated?: () => void
}

function nightCount(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.max(1, Math.round(ms / 86400000))
}

export function ReservationDetailSheet({ reservationId, open, onOpenChange, onReservationUpdated }: ReservationDetailSheetProps) {
  const { t } = useTranslation('reservations')
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const fetchReservation = useCallback(() => {
    if (!reservationId) return
    setLoading(true)
    fetch(`${API_URL}/reservations/${reservationId}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: Reservation | null) => setReservation(data))
      .catch(() => setReservation(null))
      .finally(() => setLoading(false))
  }, [reservationId])

  useEffect(() => {
    if (open && reservationId) fetchReservation()
    if (!open) { setReservation(null); setCancelOpen(false) }
  }, [open, reservationId, fetchReservation])

  async function handleCancel() {
    if (!reservationId) return
    setCancelling(true)
    try {
      const res = await fetch(`${API_URL}/reservations/${reservationId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok || res.status === 204) {
        toast.success(t('form.success.cancelled'))
        setCancelOpen(false)
        onOpenChange(false)
        onReservationUpdated?.()
      }
    } finally {
      setCancelling(false)
    }
  }

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
          ) : !reservation ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-body">{t('empty.title')}</p>
            </div>
          ) : (
            <div className="space-y-4 p-2">
              <SheetHeader className="p-0">
                <div className="flex items-center gap-3">
                  <PropertyColorDot colorIndex={reservation.property.colorIndex} size="lg" />
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-left truncate">{reservation.guestName}</SheetTitle>
                    <p className="text-micro text-muted-foreground flex items-center gap-1">
                      <PropertyColorDot colorIndex={reservation.property.colorIndex} size="sm" />
                      {reservation.property.name}
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex flex-wrap gap-2">
                {reservation.source && (
                  <Badge variant="secondary">
                    {t(`source.${reservation.source}`, reservation.source)}
                  </Badge>
                )}
                <Badge className={cn('border', reservation.status === 'CONFIRMED'
                  ? 'bg-success/10 text-success border-success'
                  : 'bg-muted text-muted-foreground border-muted')}>
                  {t(`status.${reservation.status.toLowerCase()}`, reservation.status)}
                </Badge>
                <Badge variant="secondary">
                  <Moon className="size-3 mr-1" />
                  {t('nights', { count: nightCount(reservation.checkIn, reservation.checkOut) })}
                </Badge>
              </div>

              <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="size-3.5 mt-0.5 text-success shrink-0" />
                    <div>
                      <p className="text-micro text-muted-foreground">{t('fields.checkIn')}</p>
                      <p className="text-caption font-medium">
                        {new Date(reservation.checkIn).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarDays className="size-3.5 mt-0.5 text-danger shrink-0" />
                    <div>
                      <p className="text-micro text-muted-foreground">{t('fields.checkOut')}</p>
                      <p className="text-caption font-medium">
                        {new Date(reservation.checkOut).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {reservation.property.address && (
                  <div className="flex items-start gap-2 pt-2 border-t">
                    <MapPin className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-micro text-muted-foreground">{reservation.property.name}</p>
                      <p className="text-caption">{reservation.property.address}</p>
                    </div>
                  </div>
                )}

                {reservation.notes && (
                  <div className="flex items-start gap-2 pt-2 border-t">
                    <FileText className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-micro text-muted-foreground">{t('fields.notes')}</p>
                      <p className="text-caption">{reservation.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {reservation.status === 'CONFIRMED' && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => setCancelOpen(true)}
                >
                  {t('cancel')}
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancelDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('cancelDialog.description', { name: reservation?.guestName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              {t('cancelDialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {t('cancelDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
