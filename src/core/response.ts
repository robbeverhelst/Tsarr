import { TsArrError, ValidationError } from './errors.js';

export interface ApiResponse<T> {
  data?: T;
  error?: TsArrError;
  success: boolean;
}

export async function handleApiResponse<T>(
  promise: Promise<{ data?: T; error?: any; response?: Response }>
): Promise<ApiResponse<T>> {
  try {
    const result = await promise;

    if (result.error) {
      const error = parseApiError(result.error, result.response);
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: parseApiError(error),
    };
  }
}

function parseApiError(error: any, response?: Response): TsArrError {
  // Handle different error types
  if (error instanceof TsArrError) {
    return error;
  }

  // Parse response status codes
  if (response) {
    const statusCode = response.status;
    const statusText = response.statusText;

    if (statusCode === 401) {
      return new TsArrError('Unauthorized - check your API key', 'UNAUTHORIZED', 401);
    }

    if (statusCode === 404) {
      return new TsArrError('Resource not found', 'NOT_FOUND', 404);
    }

    if (statusCode >= 500) {
      return new TsArrError(`Server error: ${statusText}`, 'SERVER_ERROR', statusCode);
    }

    if (statusCode >= 400) {
      return new TsArrError(`Client error: ${statusText}`, 'CLIENT_ERROR', statusCode);
    }
  }

  // Handle network errors
  if (error?.message?.includes('fetch')) {
    return new TsArrError('Network error - unable to connect to server', 'NETWORK_ERROR');
  }

  // Default error
  return new TsArrError(
    error?.message || 'Unknown error occurred',
    'UNKNOWN_ERROR',
    undefined,
    error
  );
}

export function validateResponse<T>(data: T, schema?: any): T {
  if (!data) {
    throw new ValidationError('No data returned from API');
  }

  // Basic runtime validation
  if (typeof data === 'object' && data !== null) {
    // Validate arrays
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (item === null || item === undefined) {
          throw new ValidationError(`Invalid null/undefined item at index ${index}`);
        }
      });
    }

    // Validate required fields for common resource types
    if ('id' in data && typeof (data as any).id !== 'number') {
      throw new ValidationError('Resource ID must be a number');
    }
  }

  return data;
}
