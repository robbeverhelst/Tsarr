export class TsArrError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'TsArrError';
  }
}

export class ApiKeyError extends TsArrError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 'API_KEY_ERROR', 401);
    this.name = 'ApiKeyError';
  }
}

export class ConnectionError extends TsArrError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONNECTION_ERROR', undefined, details);
    this.name = 'ConnectionError';
  }
}

export class ValidationError extends TsArrError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', undefined, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends TsArrError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}
