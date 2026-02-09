'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PropertyColorDot } from '@/components/property-color-dot'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property {
  id: string
  name: string
  colorIndex: number
}

interface ReservationFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  properties: Property[]
}

export function ReservationFormSheet({ open, onOpenChange, onSuccess, properties }: ReservationFormSheetProps) {
  const { t } = useTranslation('reservations')
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = z.object({
    propertyId: z.string().min(1, t('form.error.propertyRequired')),
    guestName: z.string().min(1, t('form.error.guestRequired')),
    checkIn: z.string().min(1, t('form.error.checkInRequired')),
    checkOut: z.string().min(1, t('form.error.checkOutRequired')),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyId: '',
      guestName: '',
      checkIn: '',
      checkOut: '',
    },
  })

  async function onSubmit(data: FormData) {
    setServerError(null)

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, sourceType: 'MANUAL' }),
      })

      if (!res.ok) {
        setServerError(t('form.error.generic'))
        return
      }

      reset()
      onSuccess()
    } catch {
      setServerError(t('form.error.generic'))
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('form.createTitle')}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6 px-1">
          <div className="space-y-1">
            <Label>{t('fields.property')}</Label>
            <Select onValueChange={(val) => setValue('propertyId', val)}>
              <SelectTrigger>
                <SelectValue placeholder={t('fields.propertySelect')} />
              </SelectTrigger>
              <SelectContent>
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
            {errors.propertyId && (
              <p className="text-caption text-danger">{errors.propertyId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="guestName">{t('fields.guestName')}</Label>
            <Input
              id="guestName"
              placeholder={t('fields.guestNamePlaceholder')}
              {...register('guestName')}
              aria-invalid={!!errors.guestName}
            />
            {errors.guestName && (
              <p className="text-caption text-danger">{errors.guestName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="checkIn">{t('fields.checkIn')}</Label>
              <Input
                id="checkIn"
                type="date"
                {...register('checkIn')}
                aria-invalid={!!errors.checkIn}
              />
              {errors.checkIn && (
                <p className="text-caption text-danger">{errors.checkIn.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="checkOut">{t('fields.checkOut')}</Label>
              <Input
                id="checkOut"
                type="date"
                {...register('checkOut')}
                aria-invalid={!!errors.checkOut}
              />
              {errors.checkOut && (
                <p className="text-caption text-danger">{errors.checkOut.message}</p>
              )}
            </div>
          </div>

          {serverError && (
            <p className="text-caption text-danger text-center" role="alert">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('form.creating') : t('form.submit')}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
