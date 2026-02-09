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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PropertyColorDot } from '@/components/property-color-dot'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM'] as const

interface PropertyFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  property?: {
    id: string
    name: string
    address: string
    type: string
    colorIndex: number
    capacity: number
    notes: string | null
  }
}

export function PropertyFormSheet({ open, onOpenChange, onSuccess, property }: PropertyFormSheetProps) {
  const { t } = useTranslation('properties')
  const [serverError, setServerError] = useState<string | null>(null)
  const isEdit = !!property

  const schema = z.object({
    name: z.string().min(1, t('form.error.nameRequired')),
    address: z.string().min(1, t('form.error.addressRequired')),
    type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM', 'OTHER']),
    colorIndex: z.number().int().min(0).max(4),
    capacity: z.number().int().min(1),
    notes: z.string().optional(),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: property?.name ?? '',
      address: property?.address ?? '',
      type: (property?.type as FormData['type']) ?? 'APARTMENT',
      colorIndex: property?.colorIndex ?? 0,
      capacity: property?.capacity ?? 1,
      notes: property?.notes ?? '',
    },
  })

  const selectedColor = watch('colorIndex')

  async function onSubmit(data: FormData) {
    setServerError(null)

    const url = isEdit ? `${API_URL}/properties/${property.id}` : `${API_URL}/properties`
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
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
          <SheetTitle>{isEdit ? t('form.editTitle') : t('form.createTitle')}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6 px-1">
          <div className="space-y-1">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input
              id="name"
              placeholder={t('form.namePlaceholder')}
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-caption text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="address">{t('form.address')}</Label>
            <Input
              id="address"
              placeholder={t('form.addressPlaceholder')}
              {...register('address')}
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <p className="text-caption text-danger">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>{t('form.type')}</Label>
            <Select
              defaultValue={property?.type ?? 'APARTMENT'}
              onValueChange={(val) => setValue('type', val as FormData['type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((pt) => (
                  <SelectItem key={pt} value={pt}>
                    {t(`type.${pt.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{t('form.color')}</Label>
            <div className="flex gap-3">
              {[0, 1, 2, 3, 4].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setValue('colorIndex', idx)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                    selectedColor === idx ? 'border-foreground' : 'border-transparent',
                  )}
                >
                  <PropertyColorDot colorIndex={idx} size="lg" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="capacity">{t('form.capacity')}</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              {...register('capacity', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">{t('form.notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('form.notesPlaceholder')}
              rows={3}
              {...register('notes')}
            />
          </div>

          {serverError && (
            <p className="text-caption text-danger text-center" role="alert">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? (isEdit ? t('form.updating') : t('form.creating'))
              : t('form.submit')}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
