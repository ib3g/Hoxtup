'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PropertyColorDot } from '@/components/property-color-dot'
import { TASK_TYPE_KEY_MAP } from '@/lib/task-constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

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
  const [propertyId, setPropertyId] = useState('')
  const [taskType, setTaskType] = useState('CLEANING')
  const [assigneeId, setAssigneeId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetch(`${API_URL}/team`, { credentials: 'include' })
        .then((r) => r.ok ? r.json() : [])
        .then(setMembers)
        .catch(() => setMembers([]))
    } else {
      setPropertyId('')
      setTaskType('CLEANING')
      setAssigneeId('')
      setScheduledAt('')
      setDescription('')
      setServerError(null)
    }
  }, [open])

  function buildTitle() {
    const typeLabel = t(`type.${TASK_TYPE_KEY_MAP[taskType] ?? 'other'}`)
    const prop = properties.find((p) => p.id === propertyId)
    const member = members.find((m) => m.user.id === assigneeId)
    let title = typeLabel
    if (prop) title += ` - ${prop.name}`
    if (member) title += ` - ${member.user.name.split(' ')[0]}`
    return title
  }

  async function handleSubmit() {
    if (!propertyId) return
    setSubmitting(true)
    setServerError(null)

    try {
      const body: Record<string, unknown> = {
        propertyId,
        title: buildTitle(),
        type: taskType,
      }
      if (scheduledAt) body.scheduledAt = scheduledAt
      if (description) body.description = description
      if (assigneeId) body.assignedUserId = assigneeId

      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        setServerError(t('form.error.generic'))
        return
      }

      onSuccess()
    } catch {
      setServerError(t('form.error.generic'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('form.createTitle')}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6 px-1">
          <div className="space-y-1">
            <Label>{t('form.property')}</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
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
            {!propertyId && serverError && (
              <p className="text-caption text-danger">{t('form.error.propertyRequired')}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>{t('form.type')}</Label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_TYPE_KEY_MAP).map(([key, i18nKey]) => (
                  <SelectItem key={key} value={key}>
                    {t(`type.${i18nKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{t('form.scheduledAt')}</Label>
            <DateTimePicker
              value={scheduledAt || undefined}
              onChange={setScheduledAt}
              placeholder={t('form.scheduledAt')}
            />
          </div>

          {members.length > 0 && (
            <div className="space-y-1">
              <Label>{t('assignTo')}</Label>
              <Select value={assigneeId} onValueChange={(val) => setAssigneeId(val === '_none' ? '' : val)}>
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
            <Label>{t('form.description')}</Label>
            <Textarea
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {serverError && (
            <p className="text-caption text-danger text-center" role="alert">
              {serverError}
            </p>
          )}

          <Button className="w-full" disabled={submitting || !propertyId} onClick={handleSubmit}>
            {submitting ? t('form.creating') : t('form.submit')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
