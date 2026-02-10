import { Polar } from '@polar-sh/sdk'
import { config } from './index.js'
import { logger } from './logger.js'

export const polar: Polar | null = config.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: config.POLAR_ACCESS_TOKEN,
      ...(config.POLAR_SANDBOX ? { server: 'sandbox' } : {}),
    })
  : null

export function isPolarConfigured(): boolean {
  return polar !== null
}

if (!polar) {
  logger.warn('Polar SDK not configured — billing checkout/webhooks will be unavailable. Set POLAR_ACCESS_TOKEN to enable.')
}
