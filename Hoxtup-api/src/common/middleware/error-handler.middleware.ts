import type { ErrorRequestHandler } from 'express'
import { AppError } from '../errors/base.error.js'
import { logger } from '../utils/logger.js'
import fs from 'fs'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      type: err.type,
      title: err.title,
      status: err.status,
      detail: err.detail,
      ...(err.errors && { errors: err.errors }),
    })
    return
  }

  if (err.status === 400 || err.status === 404 || err.status === 405 || err.status === 415) {
    fs.appendFileSync('error.log', `\n--- REQUEST ERROR [${new Date().toISOString()}] (Status: ${err.status}) ---\n${err.message}\n${JSON.stringify(err.errors, null, 2)}\n`)
    res.status(err.status).json({
      type: `https://api.hoxtup.com/errors/${err.status}`,
      title: err.message ?? 'Request Error',
      status: err.status,
      detail: err.message ?? 'The request could not be processed',
      ...(err.errors && { errors: err.errors }),
    })
    return
  }

  fs.appendFileSync('error.log', `\n--- ERROR [${new Date().toISOString()}] ---\n${err.stack || err.message}\n`)
  process.stdout.write(`\n--- ERROR START ---\n${err.stack || err.message}\n--- ERROR END ---\n`)
  logger.error({ err }, 'Unhandled error')

  res.status(500).json({
    type: 'https://api.hoxtup.com/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
  })
}
