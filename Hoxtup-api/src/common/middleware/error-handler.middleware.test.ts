import { describe, it, expect, vi } from 'vitest'
import { errorHandler } from './error-handler.middleware.js'
import { AppError } from '../errors/base.error.js'
import { NotFoundError } from '../errors/not-found.error.js'
import type { Request, Response, NextFunction } from 'express'

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  return res
}

const req = {} as Request
const next = vi.fn() as NextFunction

describe('errorHandler', () => {
  it('should handle AppError with RFC 7807 format', () => {
    const res = createMockRes()
    const err = new NotFoundError('User not found')

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      type: 'https://api.hoxtup.com/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: 'User not found',
    })
  })

  it('should handle AppError with validation errors array', () => {
    const res = createMockRes()
    const err = new AppError(
      422,
      'https://api.hoxtup.com/errors/validation',
      'Validation Error',
      'Invalid input',
      [{ field: 'email', message: 'Invalid email format' }],
    )

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 422,
        errors: [{ field: 'email', message: 'Invalid email format' }],
      }),
    )
  })

  it('should handle unknown errors as 500', () => {
    const res = createMockRes()
    const err = new Error('Something broke')

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      type: 'https://api.hoxtup.com/errors/internal',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    })
  })

  it('should handle express-openapi-validator style errors (status on error object)', () => {
    const res = createMockRes()
    const err = Object.assign(new Error('Not Found'), { status: 404 })

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 404 }),
    )
  })
})
