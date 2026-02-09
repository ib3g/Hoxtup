'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { PropertyColorDot } from '@/components/features/properties/PropertyColorDot'

type TaskStatus =
  | 'PENDING_VALIDATION'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'INCIDENT'
  | 'FUSION_SUGGESTED'
  | 'CANCELLED'

type TaskAction =
  | 'validate'
  | 'start'
  | 'complete'
  | 'report_incident'
  | 'resolve_resume'
  | 'resolve_complete'
  | 'accept_fusion'
  | 'reject_fusion'
  | 'cancel'

interface TaskCardTask {
  id: string
  title: string
  status: TaskStatus
  type: string
  scheduledAt?: string | null
  assignedUser?: { id: string; name: string; firstName?: string | null; lastName?: string | null } | null
  property?: { id: string; name: string; colorIndex: number } | null
  note?: string | null
}

interface TaskCardProps {
  task: TaskCardTask
  variant?: 'default' | 'prominent'
  onTransition?: (taskId: string, action: TaskAction, note?: string) => Promise<void>
  className?: string
}

const STATUS_STYLES: Record<TaskStatus, { border: string; bg: string; opacity?: string }> = {
  PENDING_VALIDATION: { border: 'border-l-warning', bg: 'bg-amber-50' },
  TODO: { border: '', bg: 'bg-white' },
  IN_PROGRESS: { border: 'border-l-brand-cta', bg: 'bg-orange-50/50' },
  COMPLETED: { border: 'border-l-success', bg: 'bg-white', opacity: 'opacity-50' },
  INCIDENT: { border: 'border-l-danger', bg: 'bg-red-50' },
  FUSION_SUGGESTED: { border: 'border-l-purple-400', bg: 'bg-purple-50' },
  CANCELLED: { border: 'border-l-gray-300', bg: 'bg-gray-50', opacity: 'opacity-40' },
}

const STATUS_I18N_KEY: Record<TaskStatus, string> = {
  PENDING_VALIDATION: 'tasks.status.pendingValidation',
  TODO: 'tasks.status.todo',
  IN_PROGRESS: 'tasks.status.inProgress',
  COMPLETED: 'tasks.status.completed',
  INCIDENT: 'tasks.status.incident',
  FUSION_SUGGESTED: 'tasks.status.fusionSuggested',
  CANCELLED: 'tasks.status.cancelled',
}

const CTA_CONFIG: Partial<Record<TaskStatus, { action: TaskAction; i18nKey: string; color: string }>> = {
  PENDING_VALIDATION: { action: 'validate', i18nKey: 'tasks.actions.validate', color: 'bg-brand-cta hover:bg-brand-cta/90 text-white' },
  IN_PROGRESS: { action: 'complete', i18nKey: 'tasks.actions.complete', color: 'bg-brand-cta hover:bg-brand-cta/90 text-white' },
  INCIDENT: { action: 'resolve_resume', i18nKey: 'tasks.actions.resolveResume', color: 'bg-danger hover:bg-danger/90 text-white' },
}

const UNDO_DURATION_S = 5

export function TaskCard({ task, variant = 'default', onTransition, className }: TaskCardProps) {
  const { t } = useTranslation()
  const [undoCountdown, setUndoCountdown] = useState<number | null>(null)
  const [optimisticCompleted, setOptimisticCompleted] = useState(false)
  const undoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const undoCommitRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const displayStatus: TaskStatus = optimisticCompleted ? 'COMPLETED' : task.status
  const styles = STATUS_STYLES[displayStatus]
  const cta = CTA_CONFIG[displayStatus]
  const isProminent = variant === 'prominent'

  const clearUndoTimers = useCallback(() => {
    if (undoTimerRef.current) clearInterval(undoTimerRef.current)
    if (undoCommitRef.current) clearTimeout(undoCommitRef.current)
    undoTimerRef.current = null
    undoCommitRef.current = null
  }, [])

  useEffect(() => {
    return () => clearUndoTimers()
  }, [clearUndoTimers])

  const handleCta = useCallback(async () => {
    if (!cta || !onTransition) return

    if (cta.action === 'complete') {
      setOptimisticCompleted(true)
      setUndoCountdown(UNDO_DURATION_S)

      undoTimerRef.current = setInterval(() => {
        setUndoCountdown((prev) => {
          if (prev === null || prev <= 1) return null
          return prev - 1
        })
      }, 1000)

      undoCommitRef.current = setTimeout(async () => {
        clearUndoTimers()
        setUndoCountdown(null)
        try {
          await onTransition(task.id, 'complete')
        } catch {
          setOptimisticCompleted(false)
        }
      }, UNDO_DURATION_S * 1000)
    } else {
      await onTransition(task.id, cta.action)
    }
  }, [cta, onTransition, task.id, clearUndoTimers])

  const handleUndo = useCallback(() => {
    clearUndoTimers()
    setOptimisticCompleted(false)
    setUndoCountdown(null)
  }, [clearUndoTimers])

  const assigneeName = task.assignedUser
    ? task.assignedUser.firstName && task.assignedUser.lastName
      ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
      : task.assignedUser.name
    : null

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border border-l-4 px-3 py-2 transition-all duration-300 ease-out',
        styles.border,
        styles.bg,
        styles.opacity,
        displayStatus === 'COMPLETED' && 'line-through decoration-muted-foreground/50',
        displayStatus === 'IN_PROGRESS' && 'shadow-sm shadow-brand-cta/20',
        isProminent ? 'min-h-[140px]' : 'min-h-[72px]',
        className,
      )}
      style={
        displayStatus === 'TODO' && task.property
          ? { borderLeftColor: `var(--property-color-${task.property.colorIndex}, #4A90D9)` }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {task.property && <PropertyColorDot colorIndex={task.property.colorIndex} size="inline" />}
            <span className="truncate text-xs text-muted-foreground">{task.property?.name}</span>
          </div>
          <h3 className={cn(
            'mt-0.5 text-sm font-medium text-foreground',
            displayStatus === 'COMPLETED' && 'text-muted-foreground',
          )}>
            {task.title}
          </h3>
          {isProminent && (
            <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              {assigneeName && <p>{assigneeName}</p>}
              {task.scheduledAt && (
                <p>{new Date(task.scheduledAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-medium',
            displayStatus === 'PENDING_VALIDATION' && 'bg-amber-100 text-amber-800',
            displayStatus === 'TODO' && 'bg-blue-100 text-blue-800',
            displayStatus === 'IN_PROGRESS' && 'bg-orange-100 text-orange-800',
            displayStatus === 'COMPLETED' && 'bg-green-100 text-green-800',
            displayStatus === 'INCIDENT' && 'bg-red-100 text-red-800',
            displayStatus === 'FUSION_SUGGESTED' && 'bg-purple-100 text-purple-800',
            displayStatus === 'CANCELLED' && 'bg-gray-100 text-gray-500',
          )}>
            {t(STATUS_I18N_KEY[displayStatus])}
          </span>

          {undoCountdown !== null ? (
            <button
              type="button"
              onClick={handleUndo}
              className="rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background transition-colors hover:bg-foreground/80"
            >
              {t('tasks:undoComplete', { seconds: undoCountdown })}
            </button>
          ) : cta && onTransition ? (
            <button
              type="button"
              onClick={handleCta}
              className={cn('rounded-md px-2 py-1 text-[11px] font-medium transition-colors', cta.color)}
            >
              {t(cta.i18nKey)}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
