import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import errorHandler from '../../../src/middleware/errorHandler.js';

describe('errorHandler middleware', () => {
  let req, res, next;
  let originalNodeEnv;

  beforeEach(() => {
    // Save original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;

    // Mock request, response, and next function
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  // Success case - handle error with statusCode
  it('should return error with provided statusCode', () => {
    // Arrange
    const error = new Error('Custom error message');
    error.statusCode = 400;

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Custom error message',
    });
  });

  // Default case - no statusCode provided
  it('should default to 500 if no statusCode is provided', () => {
    // Arrange
    const error = new Error('Internal error');

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal error',
    });
  });

  // Edge case - invalid statusCode
  it('should default to 500 if statusCode is not an integer', () => {
    // Arrange
    const error = new Error('Invalid status code');
    error.statusCode = 'not-a-number';

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // Client errors (4xx)
  it('should handle 401 Unauthorized error', () => {
    // Arrange
    const error = new Error('Unauthorized');
    error.statusCode = 401;

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unauthorized',
    });
  });

  it('should handle 404 Not Found error', () => {
    // Arrange
    const error = new Error('Resource not found');
    error.statusCode = 404;

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Resource not found',
    });
  });

  // Development mode - should include stack trace
  it('should include stack trace in development mode', () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    const error = new Error('Development error');
    error.statusCode = 500;
    error.stack = 'Error stack trace here';

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Development error',
      stack: 'Error stack trace here',
    });
  });

  // Production mode - should NOT include stack trace
  it('should NOT include stack trace in production mode', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    const error = new Error('Production error');
    error.statusCode = 500;
    error.stack = 'Error stack trace here';

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Production error',
    });
  });

  // Edge case - error without message
  it('should use default message if error message is empty', () => {
    // Arrange
    const error = new Error('');
    error.statusCode = 500;

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal Server Error',
    });
  });

  // Edge case - ensure success is always false
  it('should always set success to false', () => {
    // Arrange
    const error = new Error('Test error');

    // Act
    errorHandler(error, req, res, next);

    // Assert
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.success).toBe(false);
  });

  // Various HTTP status codes
  it('should handle various HTTP status codes correctly', () => {
    const testCases = [
      { code: 400, name: 'Bad Request' },
      { code: 403, name: 'Forbidden' },
      { code: 422, name: 'Unprocessable Entity' },
      { code: 500, name: 'Internal Server Error' },
      { code: 503, name: 'Service Unavailable' },
    ];

    testCases.forEach(({ code, name }) => {
      // Reset mocks
      vi.clearAllMocks();

      // Arrange
      const error = new Error(name);
      error.statusCode = code;

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(code);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: name,
      });
    });
  });

  // Verify next is not called
  it('should not call next() as it is terminal middleware', () => {
    // Arrange
    const error = new Error('Test error');

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
  });

  // Response structure validation
  it('should return response with exact expected structure', () => {
    // Arrange
    process.env.NODE_ENV = 'test';
    const error = new Error('Validation error');
    error.statusCode = 422;

    // Act
    errorHandler(error, req, res, next);

    // Assert
    const response = res.json.mock.calls[0][0];
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('message');
    expect(response).not.toHaveProperty('stack');
    expect(Object.keys(response)).toHaveLength(2);
  });
});
