'use client'

import { useState, useEffect } from 'react'
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

const TASK_TYPES = ['CLEANING', 'MAINTENANCE', 'INSPECTION', 'CHECK_IN', 'CHECK_OUT', 'TURNOVER', 'OTHER'] as const

interface Property { id: string; name: string; colorIndex: number }
interface TeamMember { id: string; userId: string; role: string; user: { id: string; name: string; email: string } }

interface TaskFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  properties: Property[]
}

export function TaskFormSheet({ open, onOpenChange, onSuccess, properties }: TaskFormSheetProps) {
  const { t } = useTranslation('tasks')
  const [serverError, setServerError] = useState<string | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    if (open) {
      fetch(`${API_URL}/team`, { credentials: 'include' })
        .then((r) => r.ok ? r.json() : [])
        .then(setMembers)
        .catch(() => setMembers([]))
    }
  }, [open])

  const schema = z.object({
    propertyId: z.string().min(1, t('form.error.propertyRequired')),
    title: z.string().min(1, t('form.error.titleRequired')),
    description: z.string().optional(),
    type: z.enum(['CLEANING', 'MAINTENANCE', 'INSPECTION', 'CHECK_IN', 'CHECK_OUT', 'TURNOVER', 'OTHER']),
    scheduledAt: z.string().optional(),
    assignedUserId: z.string().optional(),
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
      title: '',
      description: '',
      type: 'OTHER',
      scheduledAt: '',
    },
  })

  async function onSubmit(data: FormData) {
    setServerError(null)

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
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

  const typeKeyMap: Record<string, string> = {
    CLEANING: 'cleaning',
    MAINTENANCE: 'maintenance',
    INSPECTION: 'inspection',
    CHECK_IN: 'checkIn',
    CHECK_OUT: 'checkOut',
    TURNOVER: 'turnover',
    OTHER: 'other',
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('form.createTitle')}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6 px-1">
          <div className="space-y-1">
            <Label>{t('form.property')}</Label>
            <Select onValueChange={(val) => setValue('propertyId', val)}>
              <SelectTrigger>
                <SelectValue placeholder={t('fields.property')} />
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
            <Label htmlFor="title">{t('form.title')}</Label>
            <Input
              id="title"
              placeholder={t('form.titlePlaceholder')}
              {...register('title')}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-caption text-danger">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>{t('form.type')}</Label>
            <Select defaultValue="OTHER" onValueChange={(val) => setValue('type', val as FormData['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map((tt) => (
                  <SelectItem key={tt} value={tt}>
                    {t(`type.${typeKeyMap[tt]}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="scheduledAt">{t('form.scheduledAt')}</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              {...register('scheduledAt')}
            />
          </div>

          {members.length > 0 && (
            <div className="space-y-1">
              <Label>{t('assignTo')}</Label>
              <Select onValueChange={(val) => setValue('assignedUserId', val === '_none' ? undefined : val)}>
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

          <div className="space-y-1">
            <Label htmlFor="description">{t('form.description')}</Label>
            <Textarea
              id="description"
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
              {...register('description')}
            />
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
