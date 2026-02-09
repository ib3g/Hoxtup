import { AppError } from './base.error.js'

export class UnauthorizedError extends AppError {
  constructor(detail = 'Authentication required') {
    super(401, 'https://api.hoxtup.com/errors/unauthorized', 'Unauthorized', detail)
  }
}
