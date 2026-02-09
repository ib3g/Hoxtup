import { AppError } from './base.error.js'

export class BadRequestError extends AppError {
  constructor(detail: string) {
    super(400, 'bad-request', 'Bad Request', detail)
  }
}
