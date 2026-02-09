import { AppError } from './base.error.js'

export class ForbiddenError extends AppError {
  constructor(detail = 'You do not have permission to perform this action') {
    super(403, 'https://api.hoxtup.com/errors/forbidden', 'Forbidden', detail)
  }
}
