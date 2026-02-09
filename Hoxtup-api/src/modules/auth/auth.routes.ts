import { Router } from 'express'
import { requireAuth } from '../../common/middleware/auth.middleware.js'
import { createOrganization } from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/organizations', requireAuth, createOrganization)
