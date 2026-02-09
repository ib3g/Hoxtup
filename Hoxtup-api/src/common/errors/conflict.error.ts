import { AppError } from './base.error.js'

export class ConflictError extends AppError {
  constructor(detail = 'The request conflicts with the current state of the resource') {
    super(409, 'https://api.hoxtup.com/errors/conflict', 'Conflict', detail)
  }
}
