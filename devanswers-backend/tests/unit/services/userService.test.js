import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { register, login } from '../../../src/services/userService.js';
import User from '../../../src/models/User.js';

// Mock the User model
vi.mock('../../../src/models/User.js');

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION = '1d';
  });

  describe('register', () => {
    // Success case
    it('should register a new user successfully', async () => {
      // Arrange
      const mockUserObj = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        isAdmin: false,
      };
      User.findOne = vi.fn().mockResolvedValue(null);
      User.create = vi.fn().mockResolvedValue({
        ...mockUserObj,
        toObject: vi.fn().mockReturnValue(mockUserObj),
      });

      // Act
      const result = await register('John Doe', 'john@example.com', 'password123', false);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(User.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: expect.any(String),
        isAdmin: false,
      });
      expect(result).toHaveProperty('_id', 'user123');
      expect(result.email).toBe('john@example.com');
      expect(result).not.toHaveProperty('password');
    });

    // Security case - password not in returned object
    it('should not include password in the returned user object', async () => {
      // Arrange
      const mockUserObj = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        isAdmin: false,
      };
      User.findOne = vi.fn().mockResolvedValue(null);
      User.create = vi.fn().mockResolvedValue({
        ...mockUserObj,
        toObject: vi.fn().mockReturnValue(mockUserObj),
      });

      // Act
      const result = await register('John Doe', 'john@example.com', 'password123', false);

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('email', 'john@example.com');
    });

    // Success case - admin user
    it('should register an admin user', async () => {
      // Arrange
      const mockAdminObj = { _id: 'admin123', name: 'Admin User', email: 'admin@example.com', isAdmin: true };
      User.findOne = vi.fn().mockResolvedValue(null);
      User.create = vi.fn().mockResolvedValue({
        ...mockAdminObj,
        toObject: vi.fn().mockReturnValue(mockAdminObj),
      });

      // Act
      const result = await register('Admin User', 'admin@example.com', 'adminpass', true);

      // Assert
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: true })
      );
      expect(result.isAdmin).toBe(true);
    });

    // Edge case - password hashing
    it('should hash the password before saving', async () => {
      // Arrange
      User.findOne = vi.fn().mockResolvedValue(null);
      User.create = vi.fn().mockImplementation(async (data) => {
        // Verify password is hashed (not plain text)
        const isPlainPassword = data.password === 'plainPassword';
        expect(isPlainPassword).toBe(false);
        const obj = { _id: 'user123', ...data };
        return { ...obj, toObject: vi.fn().mockReturnValue(obj) };
      });

      // Act
      await register('John Doe', 'john@example.com', 'plainPassword', false);

      // Assert
      expect(User.create).toHaveBeenCalled();
    });

    // Client error - duplicate user
    it('should throw 409 error if user already exists', async () => {
      // Arrange
      User.findOne = vi.fn().mockResolvedValue({ email: 'existing@example.com' });

      // Act & Assert
      await expect(
        register('John Doe', 'existing@example.com', 'password123', false)
      ).rejects.toThrow('User already exists');
      await expect(
        register('John Doe', 'existing@example.com', 'password123', false)
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(User.create).not.toHaveBeenCalled();
    });

    // Failure case - database error
    it('should propagate database errors', async () => {
      // Arrange
      User.findOne = vi.fn().mockResolvedValue(null);
      User.create = vi.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        register('John Doe', 'john@example.com', 'password123', false)
      ).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    // Success case
    it('should login user and return token with userId', async () => {
      // Arrange
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        isAdmin: false,
      };

      User.findOne = vi.fn().mockResolvedValue(mockUser);

      // Act
      const result = await login('john@example.com', 'password123');

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('userId', mockUser._id);
      expect(result).toHaveProperty('name', mockUser.name);

      // Verify JWT token
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user123');
    });

    // Edge case - token includes isAdmin
    it('should include isAdmin in token payload', async () => {
      // Arrange
      const mockUser = {
        _id: 'admin123',
        email: 'admin@example.com',
        password: await bcrypt.hash('adminpass', 10),
        isAdmin: true,
      };

      User.findOne = vi.fn().mockResolvedValue(mockUser);

      // Act
      const result = await login('admin@example.com', 'adminpass');

      // Assert
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
      expect(decoded.isAdmin).toBe(true);
    });

    // Client error - user not found
    it('should throw 400 error if user not found', async () => {
      // Arrange
      User.findOne = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
      await expect(
        login('nonexistent@example.com', 'password123')
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    // Client error - wrong password
    it('should throw 400 error for incorrect password', async () => {
      // Arrange
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        password: await bcrypt.hash('correctPassword', 10),
      };

      User.findOne = vi.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        login('john@example.com', 'wrongPassword')
      ).rejects.toThrow('Invalid email or password');
      await expect(
        login('john@example.com', 'wrongPassword')
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    // Edge case - token expiration
    it('should set token with configured expiration', async () => {
      // Arrange
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        isAdmin: false,
      };

      User.findOne = vi.fn().mockResolvedValue(mockUser);

      // Act
      const result = await login('john@example.com', 'password123');

      // Assert
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBe(86400); // 1 day in seconds
    });

    // Failure case - database error
    it('should propagate database errors during login', async () => {
      // Arrange
      User.findOne = vi.fn().mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(
        login('john@example.com', 'password123')
      ).rejects.toThrow('Database connection failed');
    });
  });
});
