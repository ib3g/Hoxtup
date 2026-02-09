import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../common/middleware/auth.middleware.js'
import type { TenantRequest } from '../../common/middleware/tenant.middleware.js'
import * as inventoryService from './inventory.service.js'
import * as assetService from './asset.service.js'
import * as financialService from './financial.service.js'

type InvRequest = AuthenticatedRequest & TenantRequest

export async function listItems(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const items = await inventoryService.listItems(
      req.tenantId,
      req.params.propertyId as string,
      req.user.id,
      req.user.role,
    )
    res.json({ items, total: items.length })
  } catch (error) {
    next(error)
  }
}

export async function createItem(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const item = await inventoryService.createItem(req.tenantId, req.user.id, req.user.role, req.body)
    if (!item) {
      res.status(404).json({ type: 'not-found', title: 'Propriété introuvable ou accès refusé', status: 404 })
      return
    }
    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
}

export async function updateItem(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const item = await inventoryService.updateItem(req.params.id as string, req.tenantId, req.body)
    if (!item) {
      res.status(404).json({ type: 'not-found', title: 'Article introuvable', status: 404 })
      return
    }
    res.json(item)
  } catch (error) {
    next(error)
  }
}

export async function recordMovement(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const result = await inventoryService.recordMovement(
      req.params.id as string,
      req.tenantId,
      req.user.id,
      req.body,
    )
    if (!result) {
      res.status(404).json({ type: 'not-found', title: 'Article introuvable', status: 404 })
      return
    }
    if ('error' in result) {
      res.status(422).json({ type: 'insufficient-stock', title: 'Stock insuffisant', status: 422 })
      return
    }
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

export async function getMovements(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const movements = await inventoryService.getMovements(req.params.id as string, req.tenantId)
    if (!movements) {
      res.status(404).json({ type: 'not-found', title: 'Article introuvable', status: 404 })
      return
    }
    res.json({ movements, total: movements.length })
  } catch (error) {
    next(error)
  }
}

export async function getInventorySummary(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const summary = await inventoryService.getInventorySummary(req.tenantId, req.params.propertyId as string)
    res.json(summary)
  } catch (error) {
    next(error)
  }
}

export async function listAssets(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const includeDeleted = String(req.query.includeDeleted) === 'true'
    const assets = await assetService.listAssets(
      req.tenantId,
      req.params.propertyId as string,
      req.user.id,
      req.user.role,
      includeDeleted,
    )
    res.json({ assets, total: assets.length })
  } catch (error) {
    next(error)
  }
}

export async function createAsset(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.createAsset(req.tenantId, req.user.id, req.user.role, {
      ...req.body,
      purchaseDate: new Date(req.body.purchaseDate),
    })
    if (!asset) {
      res.status(404).json({ type: 'not-found', title: 'Propriété introuvable ou accès refusé', status: 404 })
      return
    }
    res.status(201).json(asset)
  } catch (error) {
    next(error)
  }
}

export async function updateAsset(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.updateAsset(req.params.id as string, req.tenantId, req.body)
    if (!asset) {
      res.status(404).json({ type: 'not-found', title: 'Actif introuvable', status: 404 })
      return
    }
    res.json(asset)
  } catch (error) {
    next(error)
  }
}

export async function deleteAsset(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.softDeleteAsset(req.params.id as string, req.tenantId)
    if (!asset) {
      res.status(404).json({ type: 'not-found', title: 'Actif introuvable', status: 404 })
      return
    }
    res.json({ id: asset.id, deleted: true })
  } catch (error) {
    next(error)
  }
}

export async function addRevenue(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const revenue = await financialService.addRevenue(req.tenantId, req.user.id, req.user.role, {
      ...req.body,
      date: new Date(req.body.date),
      propertyId: req.params.propertyId as string,
    })
    if (!revenue) {
      res.status(404).json({ type: 'not-found', title: 'Propriété introuvable ou accès refusé', status: 404 })
      return
    }
    res.status(201).json(revenue)
  } catch (error) {
    next(error)
  }
}

export async function listRevenue(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const start = req.query.start ? new Date(req.query.start as string) : undefined
    const end = req.query.end ? new Date(req.query.end as string) : undefined
    const revenues = await financialService.listRevenue(
      req.tenantId,
      req.params.propertyId as string,
      req.user.id,
      req.user.role,
      start,
      end,
    )
    res.json({ revenues, total: revenues.length })
  } catch (error) {
    next(error)
  }
}

export async function getPropertyFinancials(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const start = new Date(req.query.start as string)
    const end = new Date(req.query.end as string)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ type: 'validation-error', title: 'Dates invalides', status: 400 })
      return
    }
    const financials = await financialService.getPropertyFinancials(
      req.tenantId,
      req.params.propertyId as string,
      req.user.id,
      req.user.role,
      start,
      end,
    )
    if (!financials) {
      res.status(403).json({ type: 'forbidden', title: 'Accès refusé', status: 403 })
      return
    }
    res.json(financials)
  } catch (error) {
    next(error)
  }
}

export async function getOrgFinancialSummary(req: InvRequest, res: Response, next: NextFunction) {
  try {
    const start = new Date(req.query.start as string)
    const end = new Date(req.query.end as string)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ type: 'validation-error', title: 'Dates invalides', status: 400 })
      return
    }
    const summary = await financialService.getOrgFinancialSummary(
      req.tenantId,
      req.user.id,
      req.user.role,
      start,
      end,
    )
    res.json(summary)
  } catch (error) {
    next(error)
  }
}
