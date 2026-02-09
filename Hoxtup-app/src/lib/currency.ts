export interface CurrencyConfig {
  code: string
  symbol: string
  decimals: number
  locale: string
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  EUR: { code: 'EUR', symbol: '€', decimals: 2, locale: 'fr-FR' },
  MAD: { code: 'MAD', symbol: 'MAD', decimals: 2, locale: 'fr-MA' },
  USD: { code: 'USD', symbol: '$', decimals: 2, locale: 'en-US' },
  GBP: { code: 'GBP', symbol: '£', decimals: 2, locale: 'en-GB' },
}

export function formatMoney(centimes: number, currencyCode: string, locale?: string): string {
  const currency = CURRENCIES[currencyCode]
  if (!currency) {
    return `${(centimes / 100).toFixed(2)} ${currencyCode}`
  }
  return new Intl.NumberFormat(locale ?? currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimals,
  }).format(centimes / 100)
}

export function parseMoney(amount: number): number {
  return Math.round(amount * 100)
}
