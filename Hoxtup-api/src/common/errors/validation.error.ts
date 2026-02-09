import { AppError } from './base.error.js'

export class ValidationError extends AppError {
  constructor(
    detail = 'The request body contains invalid data',
    errors?: Array<{ field: string; message: string }>,
  ) {
    super(422, 'https://api.hoxtup.com/errors/validation', 'Validation Error', detail, errors)
  }
}
