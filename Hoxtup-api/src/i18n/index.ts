import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

type TranslationMap = Record<string, string | Record<string, string>>

const cache = new Map<string, TranslationMap>()

// Pre-load translations at startup to avoid sync IO during requests
function preloadTranslations() {
  const localesDir = join(__dirname, 'locales')
  try {
    const locales = readdirSync(localesDir)
    for (const locale of locales) {
      const localeDir = join(localesDir, locale)
      const namespaces = readdirSync(localeDir)
      for (const nsFile of namespaces) {
        if (!nsFile.endsWith('.json')) continue
        const namespace = nsFile.replace('.json', '')
        const filePath = join(localeDir, nsFile)
        const content = JSON.parse(readFileSync(filePath, 'utf-8'))
        cache.set(`${locale}:${namespace}`, content)
      }
    }
  } catch (error) {
    console.error('Failed to pre-load translations:', error)
  }
}

preloadTranslations()

function getNamespace(locale: string, namespace: string): TranslationMap {
  const key = `${locale}:${namespace}`
  return cache.get(key) || {}
}

export function t(key: string, locale = 'fr', params?: Record<string, string>): string {
  const [namespace, ...rest] = key.split('.')
  const path = rest.join('.')

  const translations = getNamespace(locale, namespace)
  let value: unknown = translations

  for (const segment of path.split('.')) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[segment]
    } else {
      return key
    }
  }

  if (typeof value !== 'string') return key

  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, k: string) => params[k] ?? `{{${k}}}`)
  }
  return value
}
