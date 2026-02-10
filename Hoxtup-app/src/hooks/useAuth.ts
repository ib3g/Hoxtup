'use client'

import { useSession, authClient } from '@/lib/auth-client'

export function useAuth() {
  const session = useSession()
  const activeOrg = authClient.useActiveOrganization()

  return {
    user: session.data?.user ?? null,
    isAuthenticated: !!session.data,
    isLoading: session.isPending || activeOrg.isPending,
    activeOrg: activeOrg.data,
    signOut: () => authClient.signOut(),
  }
}
