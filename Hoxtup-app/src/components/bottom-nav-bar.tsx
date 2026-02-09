'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useNavItems } from '@/hooks/useNavItems'
import type { NavItem, UserRole } from '@/hooks/useNavItems'

const BOTTOM_NAV_KEYS = ['home', 'calendar', 'team', 'more', 'tasks', 'planning', 'incident']

interface BottomNavBarProps {
  items: NavItem[]
}

export function BottomNavBar({ items }: BottomNavBarProps) {
  const pathname = usePathname()
  const { t } = useTranslation('common')
  const [moreOpen, setMoreOpen] = useState(false)
  const { activeOrg } = useAuth()
  const memberRole = (activeOrg?.members?.[0]?.role ?? 'owner') as UserRole
  const { sidebarNav } = useNavItems(memberRole)

  const extraItems = sidebarNav.filter(
    (item) => !BOTTOM_NAV_KEYS.includes(item.key) && item.key !== 'dashboard'
  )

  return (
    <>
      <nav
        aria-label={t('nav.main')}
        className="sticky bottom-0 z-40 border-t bg-card md:hidden"
      >
        <ul className="flex h-14 items-center justify-around">
          {items.map((item) => {
            const isMore = item.key === 'more'
            const isActive = isMore
              ? false
              : item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            const Icon = item.icon

            if (isMore) {
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => setMoreOpen(true)}
                    className="flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 rounded-md px-3 py-1 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    <span className="text-[0.625rem] font-medium leading-tight">
                      {t(item.labelKey)}
                    </span>
                  </button>
                </li>
              )
            }

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 rounded-md px-3 py-1 transition-colors',
                    isActive
                      ? 'text-cta'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="relative">
                    <Icon className="size-5" aria-hidden="true" />
                    {item.badge != null && item.badge > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.625rem] font-medium text-white">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[0.625rem] font-medium leading-tight">
                    {t(item.labelKey)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[50vh] rounded-t-2xl px-4 pb-6">
          <div className="space-y-1 pt-2">
            {extraItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)

              return (
                <Link
                  key={item.key}
                  href={item.disabled ? '#' : item.href}
                  onClick={() => setMoreOpen(false)}
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
        </SheetContent>
      </Sheet>
    </>
  )
}
