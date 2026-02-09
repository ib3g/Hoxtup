'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useNavItems } from '@/hooks/useNavItems'
import type { UserRole } from '@/hooks/useNavItems'
import { cn } from '@/lib/utils'

const BOTTOM_NAV_KEYS = ['home', 'calendar', 'team', 'more', 'tasks', 'planning', 'incident']

export default function MorePage() {
  const { t } = useTranslation('common')
  const pathname = usePathname()
  const { activeOrg } = useAuth()
  const memberRole = (activeOrg?.members?.[0]?.role ?? 'owner') as UserRole
  const { sidebarNav } = useNavItems(memberRole)

  const extraItems = sidebarNav.filter(
    (item) => !BOTTOM_NAV_KEYS.includes(item.key) && item.key !== 'dashboard'
  )

  return (
    <div className="space-y-2">
      {extraItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname.startsWith(item.href)

        return (
          <Link
            key={item.key}
            href={item.disabled ? '#' : item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-foreground hover:bg-muted',
              item.disabled && 'pointer-events-none opacity-40'
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span>{t(item.labelKey)}</span>
            {item.v1Only && (
              <span className="ml-auto text-micro text-muted-foreground">{t('nav.inventoryV1')}</span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
