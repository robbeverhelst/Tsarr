import { describe, expect, it } from 'bun:test';
import {
  TsArrError,
  ApiKeyError,
  ConnectionError,
  ValidationError,
  NotFoundError,
} from '../src/core/errors.js';

describe('Error Classes', () => {
  describe('TsArrError', () => {
    it('should create basic error', () => {
      const error = new TsArrError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TsArrError);
      expect(error.name).toBe('TsArrError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBeUndefined();
      expect(error.statusCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should create error with all fields', () => {
      const details = { extra: 'info' };
      const error = new TsArrError('Test error', 'TEST_CODE', 500, details);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual(details);
    });

    it('should have proper error prototype chain', () => {
      const error = new TsArrError('Test');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof TsArrError).toBe(true);
      expect(error.stack).toBeDefined();
    });
  });

  describe('ApiKeyError', () => {
    it('should create with default message', () => {
      const error = new ApiKeyError();

      expect(error).toBeInstanceOf(TsArrError);
      expect(error.name).toBe('ApiKeyError');
      expect(error.message).toBe('Invalid or missing API key');
      expect(error.code).toBe('API_KEY_ERROR');
      expect(error.statusCode).toBe(401);
    });

    it('should create with custom message', () => {
      const error = new ApiKeyError('Custom API key error');

      expect(error.message).toBe('Custom API key error');
      expect(error.code).toBe('API_KEY_ERROR');
      expect(error.statusCode).toBe(401);
    });

    it('should inherit from TsArrError', () => {
      const error = new ApiKeyError();

      expect(error instanceof TsArrError).toBe(true);
      expect(error instanceof ApiKeyError).toBe(true);
    });
  });

  describe('ConnectionError', () => {
    it('should create with message', () => {
      const error = new ConnectionError('Failed to connect to server');

      expect(error).toBeInstanceOf(TsArrError);
      expect(error.name).toBe('ConnectionError');
      expect(error.message).toBe('Failed to connect to server');
      expect(error.code).toBe('CONNECTION_ERROR');
      expect(error.statusCode).toBeUndefined();
    });

    it('should create with details', () => {
      const details = { errno: 'ECONNREFUSED', port: 7878 };
      const error = new ConnectionError('Connection refused', details);

      expect(error.message).toBe('Connection refused');
      expect(error.details).toEqual(details);
    });

    it('should inherit from TsArrError', () => {
      const error = new ConnectionError('Test');

      expect(error instanceof TsArrError).toBe(true);
      expect(error instanceof ConnectionError).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create with message', () => {
      const error = new ValidationError('Invalid input data');

      expect(error).toBeInstanceOf(TsArrError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input data');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBeUndefined();
    });

    it('should create with validation details', () => {
      const details = { field: 'title', issue: 'required' };
      const error = new ValidationError('Title is required', details);

      expect(error.message).toBe('Title is required');
      expect(error.details).toEqual(details);
    });

    it('should inherit from TsArrError', () => {
      const error = new ValidationError('Test');

      expect(error instanceof TsArrError).toBe(true);
      expect(error instanceof ValidationError).toBe(true);
    });
  });

  describe('NotFoundError', () => {
    it('should create with resource name', () => {
      const error = new NotFoundError('Movie with ID 123');

      expect(error).toBeInstanceOf(TsArrError);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Resource not found: Movie with ID 123');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });

    it('should inherit from TsArrError', () => {
      const error = new NotFoundError('Test Resource');

      expect(error instanceof TsArrError).toBe(true);
      expect(error instanceof NotFoundError).toBe(true);
    });
  });

  describe('Error Properties', () => {
    it('should have correct TsArrError properties', () => {
      const error = new TsArrError('Test error', 'TEST_CODE', 500, { extra: 'data' });

      expect(error.message).toBe('Test error');
      expect(error.name).toBe('TsArrError');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ extra: 'data' });
    });

    it('should have correct ApiKeyError properties', () => {
      const error = new ApiKeyError();

      expect(error.message).toBe('Invalid or missing API key');
      expect(error.name).toBe('ApiKeyError');
      expect(error.code).toBe('API_KEY_ERROR');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('Error Matching', () => {
    it('should match error types using instanceof', () => {
      const tsArrError = new TsArrError('Test');
      const apiKeyError = new ApiKeyError();
      const connectionError = new ConnectionError('Test');
      const validationError = new ValidationError('Test');
      const notFoundError = new NotFoundError('Test');

      // TsArrError is base class for all
      expect(tsArrError instanceof TsArrError).toBe(true);
      expect(apiKeyError instanceof TsArrError).toBe(true);
      expect(connectionError instanceof TsArrError).toBe(true);
      expect(validationError instanceof TsArrError).toBe(true);
      expect(notFoundError instanceof TsArrError).toBe(true);

      // Specific type checking
      expect(apiKeyError instanceof ApiKeyError).toBe(true);
      expect(connectionError instanceof ConnectionError).toBe(true);
      expect(validationError instanceof ValidationError).toBe(true);
      expect(notFoundError instanceof NotFoundError).toBe(true);

      // Cross-type checking should be false
      expect(apiKeyError instanceof ConnectionError).toBe(false);
      expect(connectionError instanceof ApiKeyError).toBe(false);
    });

    it('should match error codes', () => {
      const errors = [
        new TsArrError('Test', 'CUSTOM_CODE'),
        new ApiKeyError(),
        new ConnectionError('Test'),
        new ValidationError('Test'),
        new NotFoundError('Test'),
      ];

      expect(errors[0].code).toBe('CUSTOM_CODE');
      expect(errors[1].code).toBe('API_KEY_ERROR');
      expect(errors[2].code).toBe('CONNECTION_ERROR');
      expect(errors[3].code).toBe('VALIDATION_ERROR');
      expect(errors[4].code).toBe('NOT_FOUND');
    });

    it('should match status codes', () => {
      const apiKeyError = new ApiKeyError();
      const notFoundError = new NotFoundError('Test');
      const connectionError = new ConnectionError('Test');

      expect(apiKeyError.statusCode).toBe(401);
      expect(notFoundError.statusCode).toBe(404);
      expect(connectionError.statusCode).toBeUndefined();
    });
  });
});
