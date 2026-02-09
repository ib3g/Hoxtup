'use client'

import { useTranslation } from 'react-i18next'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskValidationBannerProps {
  pendingCount: number
  onViewPending?: () => void
  className?: string
}

export function TaskValidationBanner({ pendingCount, onViewPending, className }: TaskValidationBannerProps) {
  const { t } = useTranslation()

  if (pendingCount === 0) return null

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-300 ease-out',
        className,
      )}
      style={{ backgroundColor: '#FEF9E7' }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-amber-600" aria-hidden="true" />
        <span className="text-sm font-medium text-amber-800">
          {t('tasks:pendingBanner', { count: pendingCount, defaultValue: `${pendingCount} tâche(s) à valider` })}
        </span>
      </div>
      {onViewPending && (
        <button
          type="button"
          onClick={onViewPending}
          className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700"
        >
          {t('tasks:viewPending', { defaultValue: 'Voir' })}
        </button>
      )}
    </div>
  )
}
