export class TsarrError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'TsarrError';
  }
}

export class ApiKeyError extends TsarrError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 'API_KEY_ERROR', 401);
    this.name = 'ApiKeyError';
  }
}

export class ConnectionError extends TsarrError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONNECTION_ERROR', undefined, details);
    this.name = 'ConnectionError';
  }
}

export class ValidationError extends TsarrError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', undefined, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends TsarrError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}
