'use client'

import { useCallback } from 'react'
import { formatMoney, CURRENCIES } from '@/lib/currency'
import { useAuth } from './useAuth'

export function useCurrency() {
  const { activeOrg } = useAuth()
  const currencyCode = (activeOrg as { currencyCode?: string })?.currencyCode ?? 'EUR'
  const currency = CURRENCIES[currencyCode] ?? CURRENCIES.EUR

  const format = useCallback(
    (centimes: number, locale?: string) => formatMoney(centimes, currencyCode, locale),
    [currencyCode],
  )

  return {
    currencyCode,
    currency,
    formatMoney: format,
  }
}
