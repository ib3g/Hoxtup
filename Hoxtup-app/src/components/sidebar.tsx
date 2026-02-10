'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { OrgSwitcher } from '@/components/org-switcher'
import type { NavItem } from '@/hooks/useNavItems'

interface SidebarProps {
  items: NavItem[]
}

export function Sidebar({ items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { t } = useTranslation('common')

  return (
    <aside
      aria-label={t('nav.sidebar')}
      className={cn(
        'hidden lg:flex flex-col h-screen z-10 bg-immersive text-white transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn('flex items-center border-b border-white/10 px-4', collapsed ? 'h-14 justify-center' : 'h-14 gap-2')}>
        <span className="text-subheading font-semibold text-white">
          {collapsed ? 'H' : 'Hoxtup'}
        </span>
        {!collapsed && (
          <span className="inline-block h-2 w-2 rounded-full bg-brand-accent" />
        )}
      </div>

      <div className="border-b border-white/10 px-2 py-2">
        <OrgSwitcher collapsed={collapsed} variant="sidebar" />
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {items.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <li key={item.key}>
                <Link
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-cta/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                    item.disabled && 'pointer-events-none opacity-40'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  tabIndex={item.disabled ? -1 : undefined}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <span className="flex-1 truncate">{t(item.labelKey)}</span>
                  )}
                  {!collapsed && item.v1Only && (
                    <Badge variant="secondary" className="ml-auto text-[0.625rem] px-1.5 py-0 h-5 bg-white/10 text-white/60 border-0 hover:bg-white/10">
                      {t('nav.inventoryV1')}
                    </Badge>
                  )}
                  {!collapsed && item.badge != null && item.badge > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[0.625rem] font-medium text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose className="size-5" aria-hidden="true" />
              <span>{t('nav.collapse')}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
