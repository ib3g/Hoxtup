import { describe, it, expect, vi } from 'vitest'
import { getHealth } from './health.controller.js'
import type { Request, Response } from 'express'

describe('getHealth', () => {
  it('should return status ok with 200', () => {
    const req = {} as Request
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response

    getHealth(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' })
  })
})
