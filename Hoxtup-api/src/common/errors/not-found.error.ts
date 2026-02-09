import { AppError } from './base.error.js'

export class NotFoundError extends AppError {
  constructor(detail = 'The requested resource was not found') {
    super(404, 'https://api.hoxtup.com/errors/not-found', 'Not Found', detail)
  }
}
