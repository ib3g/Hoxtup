import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import { createICalSourceSchema, updateICalSourceSchema } from './ical.validation.js'
import * as icalService from './ical.service.js'

type ICalRequest = AuthenticatedRequest & TenantRequest

export async function listSources(req: ICalRequest, res: Response, next: NextFunction) {
  try {
    const sources = await icalService.listSources(req.params.propertyId as string, req.tenantId)
    res.json({ sources })
  } catch (error) {
    next(error)
  }
}

export async function createSource(req: ICalRequest, res: Response, next: NextFunction) {
  try {
    const input = createICalSourceSchema.parse(req.body)

    const validation = await icalService.validateICalUrl(input.url)
    if (!validation.valid) {
      res.status(400).json({
        type: 'validation-error',
        title: 'URL inaccessible ou format invalide',
        status: 400,
        detail: validation.error,
      })
      return
    }

    const source = await icalService.createSource(req.params.propertyId as string, req.tenantId, input)
    if (!source) {
      res.status(404).json({ type: 'not-found', title: 'Propriété introuvable', status: 404 })
      return
    }

    res.status(201).json({ ...source, eventCount: validation.eventCount })
  } catch (error) {
    next(error)
  }
}

export async function updateSource(req: ICalRequest, res: Response, next: NextFunction) {
  try {
    const input = updateICalSourceSchema.parse(req.body)

    if (input.url) {
      const validation = await icalService.validateICalUrl(input.url)
      if (!validation.valid) {
        res.status(400).json({
          type: 'validation-error',
          title: 'URL inaccessible ou format invalide',
          status: 400,
          detail: validation.error,
        })
        return
      }
    }

    const source = await icalService.updateSource(req.params.sourceId as string, req.tenantId, input)
    if (!source) {
      res.status(404).json({ type: 'not-found', title: 'Source iCal introuvable', status: 404 })
      return
    }
    res.json(source)
  } catch (error) {
    next(error)
  }
}

export async function deleteSource(req: ICalRequest, res: Response, next: NextFunction) {
  try {
    const source = await icalService.deleteSource(req.params.sourceId as string, req.tenantId)
    if (!source) {
      res.status(404).json({ type: 'not-found', title: 'Source iCal introuvable', status: 404 })
      return
    }
    res.json({ id: source.id, deleted: true })
  } catch (error) {
    next(error)
  }
}
