import { describe, it, expect } from 'vitest';
import { createAppError } from '../../../src/utils/createAppError.js';

describe('createAppError utility', () => {
  // Success case - create error with custom message and status code
  it('should create error with custom message and status code', () => {
    // Act
    const error = createAppError('Custom error message', 400);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Custom error message');
    expect(error.statusCode).toBe(400);
  });

  // Default case - create error with default status code 500
  it('should default to 500 status code if not provided', () => {
    // Act
    const error = createAppError('Server error');

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Server error');
    expect(error.statusCode).toBe(500);
  });

  // Client errors (4xx)
  it('should create 400 Bad Request error', () => {
    // Act
    const error = createAppError('Bad request', 400);

    // Assert
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
  });

  it('should create 401 Unauthorized error', () => {
    // Act
    const error = createAppError('Unauthorized', 401);

    // Assert
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('should create 403 Forbidden error', () => {
    // Act
    const error = createAppError('Forbidden', 403);

    // Assert
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Forbidden');
  });

  it('should create 404 Not Found error', () => {
    // Act
    const error = createAppError('Not found', 404);

    // Assert
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not found');
  });

  it('should create 409 Conflict error', () => {
    // Act
    const error = createAppError('Conflict', 409);

    // Assert
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Conflict');
  });

  // Server errors (5xx)
  it('should create 500 Internal Server Error', () => {
    // Act
    const error = createAppError('Internal server error', 500);

    // Assert
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Internal server error');
  });

  it('should create 503 Service Unavailable error', () => {
    // Act
    const error = createAppError('Service unavailable', 503);

    // Assert
    expect(error.statusCode).toBe(503);
    expect(error.message).toBe('Service unavailable');
  });

  // Edge cases
  it('should create error with empty message', () => {
    // Act
    const error = createAppError('', 400);

    // Assert
    expect(error.message).toBe('');
    expect(error.statusCode).toBe(400);
  });

  it('should preserve error stack trace', () => {
    // Act
    const error = createAppError('Test error', 500);

    // Assert
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('Test error');
  });

  it('should be throwable', () => {
    // Act & Assert
    expect(() => {
      throw createAppError('Throwable error', 500);
    }).toThrow('Throwable error');
  });

  it('should be catchable with try-catch', () => {
    // Arrange
    let caughtError;

    // Act
    try {
      throw createAppError('Catchable error', 404);
    } catch (error) {
      caughtError = error;
    }

    // Assert
    expect(caughtError).toBeInstanceOf(Error);
    expect(caughtError.message).toBe('Catchable error');
    expect(caughtError.statusCode).toBe(404);
  });

  // Type validation
  it('should have standard Error properties', () => {
    // Act
    const error = createAppError('Test', 400);

    // Assert
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('stack');
    expect(error).toHaveProperty('statusCode');
    expect(error.name).toBe('Error');
  });

  // Multiple instances
  it('should create independent error instances', () => {
    // Act
    const error1 = createAppError('Error 1', 400);
    const error2 = createAppError('Error 2', 404);

    // Assert
    expect(error1.message).toBe('Error 1');
    expect(error2.message).toBe('Error 2');
    expect(error1.statusCode).toBe(400);
    expect(error2.statusCode).toBe(404);
    expect(error1).not.toBe(error2);
  });

  // Integration with async/await
  it('should work with async/await error handling', async () => {
    // Arrange
    const asyncFunction = async () => {
      throw createAppError('Async error', 500);
    };

    // Act & Assert
    await expect(asyncFunction()).rejects.toThrow('Async error');
    await expect(asyncFunction()).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  // Chaining and properties
  it('should allow adding additional properties', () => {
    // Act
    const error = createAppError('Custom error', 400);
    error.code = 'VALIDATION_ERROR';
    error.field = 'email';

    // Assert
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.field).toBe('email');
  });

  // Multiple instances
  it('should create independent error instances', () => {
    // Act
    const error1 = createAppError('Error 1', 400);
    const error2 = createAppError('Error 2', 404);

    // Assert
    expect(error1.message).toBe('Error 1');
    expect(error2.message).toBe('Error 2');
    expect(error1.statusCode).toBe(400);
    expect(error2.statusCode).toBe(404);
    expect(error1).not.toBe(error2);
  });

  // Common use cases
  it('should create user not found error (404)', () => {
    // Act
    const error = createAppError('User not found', 404);

    // Assert
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create validation error (400)', () => {
    // Act
    const error = createAppError('Validation failed', 400);

    // Assert
    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(400);
  });

  it('should create duplicate resource error (409)', () => {
    // Act
    const error = createAppError('Resource already exists', 409);

    // Assert
    expect(error.message).toBe('Resource already exists');
    expect(error.statusCode).toBe(409);
  });

  it('should create database error (500)', () => {
    // Act
    const error = createAppError('Database connection failed', 500);

    // Assert
    expect(error.message).toBe('Database connection failed');
    expect(error.statusCode).toBe(500);
  });
});
