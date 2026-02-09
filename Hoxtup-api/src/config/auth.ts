import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { prisma } from './database.js'
import { config } from './index.js'

export const auth = betterAuth({
  baseURL: config.BETTER_AUTH_URL,
  secret: config.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: config.CORS_ORIGINS.split(',').map((o) => o.trim()),
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
  user: {
    modelName: 'User',
    additionalFields: {
      firstName: { type: 'string', required: false, fieldName: 'firstName' },
      lastName: { type: 'string', required: false, fieldName: 'lastName' },
      role: { type: 'string', required: false, defaultValue: 'STAFF_MANAGED', fieldName: 'role' },
      preferredLanguage: { type: 'string', required: false, defaultValue: 'fr', fieldName: 'preferredLanguage' },
    },
  },
})

export type Auth = typeof auth
