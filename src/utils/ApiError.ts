export class ApiError extends Error {
  public statusCode: number;
  public errors: unknown[];
  public isOperational: boolean;

  constructor(statusCode: number, message: string, errors: unknown[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}
