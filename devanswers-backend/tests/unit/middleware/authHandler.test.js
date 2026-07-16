import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import authenticate from '../../../src/middleware/authHandler.js';
import User from '../../../src/models/User.js';

// Mock the User model
vi.mock('../../../src/models/User.js');

describe('authHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      header: vi.fn(),
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();

    process.env.JWT_SECRET = 'test-secret';
  });

  // Success case
  it('should authenticate valid token and attach user to request', async () => {
    // Arrange
    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
    };

    const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    req.header.mockReturnValue(`Bearer ${token}`);

    User.findById = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(mockUser),
    });

    // Act
    await authenticate(req, res, next);

    // Assert
    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(User.findById).toHaveBeenCalledWith(mockUser._id);
    expect(req.user).toEqual({ id: mockUser._id, isAdmin: mockUser.isAdmin });
    expect(next).toHaveBeenCalled();
  });

  // Client error - no token provided
  it('should throw 401 error if no token is provided', async () => {
    // Arrange
    req.header.mockReturnValue(undefined);

    // Act & Assert
    await expect(authenticate(req, res, next)).rejects.toThrow(
      'No token provided, authorization denied.'
    );
    await expect(authenticate(req, res, next)).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(next).not.toHaveBeenCalled();
  });

  // Client error - token without Bearer prefix
  it('should throw 401 error if token does not have Bearer prefix', async () => {
    // Arrange
    req.header.mockReturnValue('InvalidTokenFormat');

    // Act & Assert
    await expect(authenticate(req, res, next)).rejects.toThrow('Token is not valid.');
  });

  // Client error - invalid token
  it('should throw 401 error if token is invalid', async () => {
    // Arrange
    req.header.mockReturnValue('Bearer invalid.token.here');

    // Act & Assert
    await expect(authenticate(req, res, next)).rejects.toThrow('Token is not valid.');
    await expect(authenticate(req, res, next)).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(next).not.toHaveBeenCalled();
  });

  // Client error - expired token
  it('should throw 401 error if token is expired', async () => {
    // Arrange
    const expiredToken = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, {
      expiresIn: '-1s', // Already expired
    });

    req.header.mockReturnValue(`Bearer ${expiredToken}`);

    // Act & Assert
    await expect(authenticate(req, res, next)).rejects.toThrow('Token is not valid.');
    expect(next).not.toHaveBeenCalled();
  });

  // Client error - user not found
  it('should throw 401 error if user does not exist', async () => {
    // Arrange
    const token = jwt.sign({ id: 'nonexistent' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    req.header.mockReturnValue(`Bearer ${token}`);

    User.findById = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    // Act & Assert
    await expect(authenticate(req, res, next)).rejects.toThrow('User not found.');
    await expect(authenticate(req, res, next)).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(next).not.toHaveBeenCalled();
  });

  // Edge case - password field should be excluded
  it('should exclude password field from user data', async () => {
    // Arrange
    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
    };

    const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    req.header.mockReturnValue(`Bearer ${token}`);

    const selectSpy = vi.fn().mockResolvedValue(mockUser);
    User.findById = vi.fn().mockReturnValue({
      select: selectSpy,
    });

    // Act
    await authenticate(req, res, next);

    // Assert
    expect(selectSpy).toHaveBeenCalledWith('-password');
  });

  // Edge case - JWT with wrong secret
  it('should reject token signed with different secret', async () => {
    // Arrange
    const token = jwt.sign({ id: 'user123' }, 'wrong-secret-key', {
      expiresIn: '1d',
    });

    req.header.mockReturnValue(`Bearer ${token}`);

    // Act & Assert
    await expect(authenticate(req, res, next)).rejects.toThrow('Token is not valid.');
  });

  // Edge case - empty Bearer token
  it('should handle empty Bearer token', async () => {
    // Arrange
    req.header.mockReturnValue('Bearer ');

    // Act & Assert
    await expect(authenticate(req, res, next)).rejects.toThrow(
      'No token provided, authorization denied.'
    );
  });

  // Edge case - token with extra spaces
  it('should reject token with extra spaces after Bearer', async () => {
    // Arrange
    const mockUser = {
      _id: 'user123',
      name: 'Test User',
    };

    const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    req.header.mockReturnValue(`Bearer  ${token}`); // Extra space

    // Act & Assert
    await expect(authenticate(req, res, next)).rejects.toThrow('Token is not valid.');
  });

  // Failure case - database error
  it('should propagate database errors', async () => {
    // Arrange
    const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    req.header.mockReturnValue(`Bearer ${token}`);

    User.findById = vi.fn().mockReturnValue({
      select: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    });

    // Act & Assert
    await expect(authenticate(req, res, next)).rejects.toThrow('Database connection failed');
    expect(next).not.toHaveBeenCalled();
  });

  // Success case - verify req.user structure
  it('should set req.user with correct structure', async () => {
    // Arrange
    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
    };

    const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    req.header.mockReturnValue(`Bearer ${token}`);

    User.findById = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(mockUser),
    });

    // Act
    await authenticate(req, res, next);

    // Assert
    expect(req.user).toEqual({
      id: mockUser._id,
      isAdmin: mockUser.isAdmin,
    });
    expect(req.user).not.toHaveProperty('name');
    expect(req.user).not.toHaveProperty('email');
  });
});
