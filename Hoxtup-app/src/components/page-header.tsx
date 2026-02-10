'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrgSwitcher } from '@/components/org-switcher'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'nav.dashboard',
  '/dashboard/tasks': 'nav.tasks',
  '/dashboard/calendar': 'nav.calendar',
  '/dashboard/team': 'nav.team',
  '/dashboard/properties': 'nav.properties',
  '/dashboard/reservations': 'nav.reservations',
  '/dashboard/notifications': 'nav.notifications',
  '/dashboard/settings': 'nav.settings',
  '/dashboard/billing': 'nav.billing',
  '/dashboard/incidents': 'nav.incident',
  '/dashboard/more': 'nav.more',
}

interface Crumb {
  label: string
  href: string
}

function buildCrumbs(pathname: string, t: (key: string) => string): { crumbs: Crumb[]; title: string | null } {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return { crumbs: [], title: t('nav.dashboard') }
  }

  const crumbs: Crumb[] = [{ label: t('nav.home'), href: '/dashboard' }]

  const knownTitle = ROUTE_TITLES[pathname]
  if (knownTitle) {
    return { crumbs, title: t(knownTitle) }
  }

  let path = ''
  for (let i = 0; i < segments.length - 1; i++) {
    path += `/${segments[i]}`
    const key = ROUTE_TITLES[path]
    if (key && path !== '/dashboard') {
      crumbs.push({ label: t(key), href: path })
    }
  }

  const parentPath = '/' + segments.slice(0, -1).join('/')
  const parentKey = ROUTE_TITLES[parentPath]
  const lastSegment = segments[segments.length - 1]

  if (parentKey && !crumbs.find((c) => c.href === parentPath)) {
    crumbs.push({ label: t(parentKey), href: parentPath })
  }

  const isDetailPage = /^[0-9a-f-]{20,}$/i.test(lastSegment)
  const title = isDetailPage ? null : lastSegment

  return { crumbs, title }
}

export function PageHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation('common')

  if (pathname === '/dashboard') return null

  const { crumbs, title } = buildCrumbs(pathname, t)

  return (
    <header className="px-4 pt-4 pb-2 md:px-6 md:pt-6 space-y-1">
      <div className="flex items-center justify-between lg:hidden mb-1">
        <OrgSwitcher variant="header" />
      </div>
      <div className="flex items-center gap-1 text-micro text-muted-foreground">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 mr-4"
          onClick={() => router.back()}
          aria-label={t('back')}
        >
          <ChevronLeft className="size-4" />
        </Button>
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            <button
              onClick={() => router.push(crumb.href)}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {crumb.label}
            </button>
            {i < crumbs.length - 1 && <ChevronRight className="size-3" />}
          </span>
        ))}
      </div>
      {title && <h1 className="text-heading text-foreground">{title}</h1>}
    </header>
  )
}
