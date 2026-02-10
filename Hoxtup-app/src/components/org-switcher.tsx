'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronsUpDown, Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/hooks/useAuth'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface Org {
  id: string
  name: string
  slug: string
  logo?: string | null
}

interface OrgSwitcherProps {
  collapsed?: boolean
  variant?: 'sidebar' | 'header'
}

export function OrgSwitcher({ collapsed = false, variant = 'sidebar' }: OrgSwitcherProps) {
  const { t } = useTranslation('common')
  const { activeOrg, isAuthenticated } = useAuth()
  const [orgs, setOrgs] = useState<Org[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    authClient.organization.list().then((res) => {
      if (res.data) setOrgs(res.data as Org[])
    }).catch(() => {})
  }, [isAuthenticated, activeOrg?.id])

  async function handleSwitch(orgId: string) {
    if (orgId === activeOrg?.id) {
      setOpen(false)
      return
    }
    await authClient.organization.setActive({ organizationId: orgId })
    setOpen(false)
    window.location.reload()
  }

  if (!activeOrg || orgs.length < 2) {
    // Only one org — show name but no switcher
    if (variant === 'sidebar') {
      return (
        <div className={cn('flex items-center gap-2 px-3 py-2', collapsed && 'justify-center px-0')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">
            {activeOrg?.name?.charAt(0).toUpperCase() ?? 'O'}
          </div>
          {!collapsed && (
            <span className="truncate text-sm font-medium text-white/80">
              {activeOrg?.name ?? t('org.default')}
            </span>
          )}
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-xs font-bold text-brand-primary">
          {activeOrg?.name?.charAt(0).toUpperCase() ?? 'O'}
        </div>
        <span className="truncate text-sm font-medium">{activeOrg?.name ?? t('org.default')}</span>
      </div>
    )
  }

  const isSidebar = variant === 'sidebar'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-2 rounded-md transition-colors',
            isSidebar
              ? cn('px-3 py-2 text-white/80 hover:bg-white/10', collapsed && 'justify-center px-2')
              : 'px-2 py-1.5 hover:bg-muted'
          )}
        >
          <div
            className={cn(
              'flex shrink-0 items-center justify-center rounded-md text-xs font-bold',
              isSidebar
                ? 'h-8 w-8 bg-white/10 text-white'
                : 'h-7 w-7 bg-brand-primary/10 text-brand-primary'
            )}
          >
            {activeOrg.name?.charAt(0).toUpperCase() ?? 'O'}
          </div>
          {!(isSidebar && collapsed) && (
            <>
              <span className={cn('flex-1 truncate text-left text-sm font-medium', isSidebar && 'text-white/80')}>
                {activeOrg.name}
              </span>
              <ChevronsUpDown className={cn('size-4 shrink-0 opacity-50', isSidebar ? 'text-white/50' : 'text-muted-foreground')} />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side={isSidebar ? 'right' : 'bottom'}
        className="w-64 p-1"
      >
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {t('org.switch')}
        </p>
        <div className="space-y-0.5">
          {orgs.map((org) => {
            const isActive = org.id === activeOrg.id
            return (
              <button
                key={org.id}
                type="button"
                onClick={() => handleSwitch(org.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                    isActive
                      ? 'bg-brand-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 truncate text-left">{org.name}</span>
                {isActive && <Check className="size-4 shrink-0 text-brand-primary" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
