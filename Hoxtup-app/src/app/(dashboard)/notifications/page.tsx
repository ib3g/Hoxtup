'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonList } from '@/components/common/Skeleton'

interface Notification {
  id: string
  type: string
  title: string
  body?: string
  read: boolean
  createdAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation(['notifications', 'common'])

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/notifications`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications ?? [])
      }
    } catch { /* */ } finally { setLoading(false) }
  }, [])

  const markAllRead = async () => {
    await fetch(`${API_URL}/notifications/read-all`, { method: 'POST', credentials: 'include' })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.replace('/login'); return }
    if (isAuthenticated) loadData()
  }, [isAuthenticated, authLoading, router, loadData])

  if (authLoading || loading) return <div className="p-4"><SkeletonList count={5} /></div>

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('notifications:title')}</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <CheckCheck size={14} />
            {t('notifications:markAllRead')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title={t('notifications:empty')} />
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <div key={n.id} className={`rounded-lg border p-3 ${n.read ? 'bg-card' : 'bg-accent/10 border-accent/30'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm ${n.read ? 'text-foreground' : 'font-medium text-foreground'}`}>{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
