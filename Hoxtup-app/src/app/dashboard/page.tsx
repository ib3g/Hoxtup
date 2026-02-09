'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Home, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const [propertyCount, setPropertyCount] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/properties`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown[]) => setPropertyCount(data.length))
      .catch(() => setPropertyCount(0))
  }, [])

  if (propertyCount === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (propertyCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 mb-6">
          <Home className="size-8 text-brand-primary" />
        </div>
        <h2 className="text-heading mb-2">{t('empty.title')}</h2>
        <p className="text-body text-muted-foreground mb-6 max-w-sm">
          {t('empty.description')}
        </p>
        <Button asChild>
          <Link href="/onboarding/property">
            <Plus className="size-4 mr-2" />
            {t('empty.cta')}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('title')}</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-body text-muted-foreground">
            {t('context.welcome')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
