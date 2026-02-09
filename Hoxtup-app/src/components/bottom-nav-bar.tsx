'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/hooks/useNavItems'

interface BottomNavBarProps {
  items: NavItem[]
}

export function BottomNavBar({ items }: BottomNavBarProps) {
  const pathname = usePathname()
  const { t } = useTranslation('common')

  return (
    <nav
      aria-label={t('nav.main')}
      className="sticky bottom-0 z-40 border-t bg-card md:hidden"
    >
      <ul className="flex h-14 items-center justify-around">
        {items.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          const Icon = item.icon

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
  )
}
