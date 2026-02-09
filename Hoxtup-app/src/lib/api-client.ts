import createClient from 'openapi-fetch'
import type { paths } from '@/generated/api'

export const api = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  credentials: 'include',
})
