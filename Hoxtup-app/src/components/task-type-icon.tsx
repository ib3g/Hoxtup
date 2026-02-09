'use client'

import { Sparkles, Wrench, Search, DoorOpen, DoorClosed, RotateCcw, MoreHorizontal, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const TASK_TYPE_CONFIG: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  CLEANING: { icon: Sparkles, bg: 'bg-violet-100', text: 'text-violet-600' },
  MAINTENANCE: { icon: Wrench, bg: 'bg-amber-100', text: 'text-amber-700' },
  INSPECTION: { icon: Search, bg: 'bg-sky-100', text: 'text-sky-600' },
  CHECK_IN: { icon: DoorOpen, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  CHECK_OUT: { icon: DoorClosed, bg: 'bg-rose-100', text: 'text-rose-600' },
  TURNOVER: { icon: RotateCcw, bg: 'bg-indigo-100', text: 'text-indigo-600' },
  OTHER: { icon: MoreHorizontal, bg: 'bg-slate-100', text: 'text-slate-600' },
  INCIDENT: { icon: AlertTriangle, bg: 'bg-red-100', text: 'text-red-600' },
}

interface TaskTypeIconProps {
  type: string
  size?: 'sm' | 'md'
  className?: string
}

export function TaskTypeIcon({ type, size = 'sm', className }: TaskTypeIconProps) {
  const config = TASK_TYPE_CONFIG[type] ?? TASK_TYPE_CONFIG.OTHER
  const Icon = config.icon
  const iconSize = size === 'sm' ? 'size-3' : 'size-4'
  const containerSize = size === 'sm' ? 'size-5' : 'size-7'

  return (
    <div className={cn('flex items-center justify-center rounded-md shrink-0', containerSize, config.bg, className)}>
      <Icon className={cn(iconSize, config.text)} />
    </div>
  )
}

export function getTaskTypeBg(type: string): string {
  return TASK_TYPE_CONFIG[type]?.bg ?? TASK_TYPE_CONFIG.OTHER.bg
}

export function getTaskTypeText(type: string): string {
  return TASK_TYPE_CONFIG[type]?.text ?? TASK_TYPE_CONFIG.OTHER.text
}
