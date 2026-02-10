'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { authClient } from '@/lib/auth-client'
import { Skeleton } from '@/components/ui/skeleton'

const MEMBERSHIP_CHECK_INTERVAL = 30_000 // 30s

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, activeOrg } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const settingOrg = useRef(false)
  const activeOrgRef = useRef(activeOrg)
  activeOrgRef.current = activeOrg
  const prevPathname = useRef(pathname)
  const ready = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const verifyMembership = useCallback(async () => {
    if (!isAuthenticated || isLoading || settingOrg.current) return
    try {
      const res = await authClient.organization.list()
      const orgs = res.data
      if (!orgs || orgs.length === 0) {
        router.replace('/onboarding/organization')
        return
      }
      const currentOrg = activeOrgRef.current
      if (!currentOrg) {
        settingOrg.current = true
        await authClient.organization.setActive({ organizationId: orgs[0].id })
        settingOrg.current = false
      } else {
        const stillMember = orgs.some((o: { id: string }) => o.id === currentOrg.id)
        if (!stillMember) {
          settingOrg.current = true
          await authClient.organization.setActive({ organizationId: orgs[0].id })
          settingOrg.current = false
        }
      }
    } catch {
      settingOrg.current = false
    }
  }, [isAuthenticated, isLoading, router])

  // Single initial verification + periodic check
  useEffect(() => {
    if (!isAuthenticated || isLoading) return
    if (!ready.current) {
      ready.current = true
      verifyMembership()
    }
    const interval = setInterval(verifyMembership, MEMBERSHIP_CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [isAuthenticated, isLoading, verifyMembership])

  // Re-verify only on actual route changes (not initial mount)
  useEffect(() => {
    if (!ready.current || !isAuthenticated || isLoading) return
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      verifyMembership()
    }
  }, [pathname, isAuthenticated, isLoading, verifyMembership])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-4 p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
