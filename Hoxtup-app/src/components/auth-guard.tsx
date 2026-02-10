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
  const initialSetDone = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const verifyMembership = useCallback(async () => {
    if (!isAuthenticated || isLoading) return
    try {
      const res = await authClient.organization.list()
      const orgs = res.data
      if (!orgs || orgs.length === 0) {
        router.replace('/onboarding/organization')
        return
      }
      if (!activeOrg) {
        authClient.organization.setActive({ organizationId: orgs[0].id })
      } else {
        const stillMember = orgs.some((o: { id: string }) => o.id === activeOrg.id)
        if (!stillMember) {
          authClient.organization.setActive({ organizationId: orgs[0].id })
        }
      }
    } catch {
      // network error — skip
    }
  }, [isAuthenticated, isLoading, activeOrg, router])

  // Initial org setup on mount
  useEffect(() => {
    if (!isAuthenticated || isLoading || initialSetDone.current) return
    initialSetDone.current = true
    verifyMembership()
  }, [isAuthenticated, isLoading, verifyMembership])

  // Re-verify on every route change
  useEffect(() => {
    if (!isAuthenticated || isLoading) return
    verifyMembership()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic check every 30s to catch removal without navigation
  useEffect(() => {
    if (!isAuthenticated || isLoading) return
    const interval = setInterval(verifyMembership, MEMBERSHIP_CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [isAuthenticated, isLoading, verifyMembership])

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
