import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import type { ScopedRequest } from '../../common/middleware/scope.middleware.js'
import { createPropertySchema, updatePropertySchema } from './properties.validation.js'
import * as propertiesService from './properties.service.js'

type PropertyRequest = AuthenticatedRequest & TenantRequest & ScopedRequest

export async function listProperties(req: PropertyRequest, res: Response, next: NextFunction) {
  try {
    const includeArchived = req.query.includeArchived === 'true'
    const properties = await propertiesService.listProperties(req.tenantId, req.scope.propertyIds, includeArchived)
    res.json({ properties, total: properties.length })
  } catch (error) {
    next(error)
  }
}

export async function getProperty(req: PropertyRequest, res: Response, next: NextFunction) {
  try {
    const property = await propertiesService.getPropertyById(req.params.id as string, req.tenantId)
    if (!property) {
      res.status(404).json({ type: 'not-found', title: 'Property not found', status: 404 })
      return
    }
    res.json(property)
  } catch (error) {
    next(error)
  }
}

export async function createProperty(req: PropertyRequest, res: Response, next: NextFunction) {
  try {
    const input = createPropertySchema.parse(req.body)
    const property = await propertiesService.createProperty(req.tenantId, input)
    res.status(201).json(property)
  } catch (error) {
    next(error)
  }
}

export async function updateProperty(req: PropertyRequest, res: Response, next: NextFunction) {
  try {
    const input = updatePropertySchema.parse(req.body)
    const property = await propertiesService.updateProperty(req.params.id as string, req.tenantId, input)
    if (!property) {
      res.status(404).json({ type: 'not-found', title: 'Property not found', status: 404 })
      return
    }
    res.json(property)
  } catch (error) {
    next(error)
  }
}

export async function archiveProperty(req: PropertyRequest, res: Response, next: NextFunction) {
  try {
    const property = await propertiesService.archiveProperty(req.params.id as string, req.tenantId, req.user.id)
    if (!property) {
      res.status(404).json({ type: 'not-found', title: 'Property not found', status: 404 })
      return
    }
    res.json({ id: property.id, archived: true })
  } catch (error) {
    next(error)
  }
}

export async function reactivateProperty(req: PropertyRequest, res: Response, next: NextFunction) {
  try {
    const property = await propertiesService.reactivateProperty(req.params.id as string, req.tenantId, req.user.id)
    if (!property) {
      res.status(404).json({ type: 'not-found', title: 'Property not found', status: 404 })
      return
    }
    res.json(property)
  } catch (error) {
    next(error)
  }
}
