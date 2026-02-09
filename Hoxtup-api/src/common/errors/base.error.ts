export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly type: string,
    public readonly title: string,
    public readonly detail: string,
    public readonly errors?: Array<{ field: string; message: string }>,
  ) {
    super(detail)
    this.name = this.constructor.name
  }
}
