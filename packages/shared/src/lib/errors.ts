export class StatusError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'StatusError';
  }
}

export function isStatusError(error: unknown): error is StatusError {
  return error instanceof StatusError;
}
