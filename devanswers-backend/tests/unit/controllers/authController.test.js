import { describe, it, expect, beforeEach, vi } from 'vitest';
import { register, login } from '../../../src/controllers/authController.js';
import * as userService from '../../../src/services/userService.js';

// Mock the user service
vi.mock('../../../src/services/userService.js');

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('register', () => {
    // Success case
    it('should register user successfully', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        isAdmin: false,
      };

      const mockUser = { id: '1', ...req.body };
      userService.register = vi.fn().mockResolvedValue(mockUser);

      // Act
      await register(req, res);

      // Assert
      expect(userService.register).toHaveBeenCalledWith(
        req.body.name,
        req.body.email,
        req.body.password,
        req.body.isAdmin
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: mockUser,
      });
    });

    // Success case - admin user
    it('should register an admin user', async () => {
      // Arrange
      req.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpass',
        isAdmin: true,
      };

      userService.register = vi.fn().mockResolvedValue({ id: '2', ...req.body });

      // Act
      await register(req, res);

      // Assert
      expect(userService.register).toHaveBeenCalledWith(
        req.body.name,
        req.body.email,
        req.body.password,
        true
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    // Error case - user already exists
    it('should propagate service errors', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        isAdmin: false,
      };

      const error = new Error('User already exists');
      error.statusCode = 409;
      userService.register = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(register(req, res)).rejects.toThrow('User already exists');
    });

    // Failure case - database error
    it('should handle database errors', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        isAdmin: false,
      };

      userService.register = vi.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(register(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    // Success case
    it('should login user successfully', async () => {
      // Arrange
      req.body = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockLoginData = {
        token: 'jwt-token-12345',
        userId: 'user123',
        name: 'John Doe',
      };

      userService.login = vi.fn().mockResolvedValue(mockLoginData);

      // Act
      await login(req, res);

      // Assert
      expect(userService.login).toHaveBeenCalledWith(
        req.body.email,
        req.body.password
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login Successful',
        data: {
          token: mockLoginData.token,
          userId: mockLoginData.userId,
          name: mockLoginData.name,
        },
      });
    });

    // Client error - invalid credentials
    it('should propagate invalid credentials error', async () => {
      // Arrange
      req.body = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid email or password');
      error.statusCode = 400;
      userService.login = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(login(req, res)).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 400,
      });
    });

    // Client error - user not found
    it('should propagate user not found error', async () => {
      // Arrange
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const error = new Error('Invalid email or password');
      error.statusCode = 400;
      userService.login = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(login(req, res)).rejects.toThrow('Invalid email or password');
    });

    // Failure case - database error
    it('should handle database errors', async () => {
      // Arrange
      req.body = {
        email: 'john@example.com',
        password: 'password123',
      };

      userService.login = vi.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(login(req, res)).rejects.toThrow('Database error');
    });
  });
});
