'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  deepLink: string | null
  readAt: string | null
  createdAt: string
}

function timeAgo(date: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return t('timeAgo.justNow')
  if (minutes < 60) return t('timeAgo.minutes', { count: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('timeAgo.hours', { count: hours })
  const days = Math.floor(hours / 24)
  return t('timeAgo.days', { count: days })
}

export default function NotificationsPage() {
  const { t } = useTranslation('notifications')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(() => {
    setLoading(true)
    fetch(`${API_URL}/notifications`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Notification[]) => setNotifications(data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' })
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })))
    await fetch(`${API_URL}/notifications/read-all`, { method: 'PATCH', credentials: 'include' })
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck className="size-4 mr-1" />
            {t('markAllRead')}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Bell className="size-6 text-muted-foreground" />
          </div>
          <p className="text-label mb-1">{t('empty')}</p>
          <p className="text-body text-muted-foreground">{t('emptyDescription')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn('cursor-pointer transition-colors', !n.readAt && 'bg-brand-primary/5')}
              onClick={() => { if (!n.readAt) markRead(n.id) }}
            >
              <CardContent className="p-4 flex items-start gap-3">
                {!n.readAt && (
                  <div className="mt-2 h-2 w-2 rounded-full bg-cta shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-label">{n.title}</p>
                  <p className="text-caption text-muted-foreground">{n.body}</p>
                </div>
                <span className="text-micro text-muted-foreground shrink-0">
                  {timeAgo(n.createdAt, t)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
