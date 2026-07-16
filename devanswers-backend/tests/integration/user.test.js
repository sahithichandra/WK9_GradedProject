import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import '../setup.js';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Helper function
async function createUser(userData = {}) {
  const defaultData = {
    name: 'Test User',
    email: `user-${Date.now()}@example.com`,
    password: await bcrypt.hash('password123', 10),
    isAdmin: false,
  };
  const user = new User({ ...defaultData, ...userData });
  await user.save();
  return user;
}

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // -------------------
  // POST /api/auth/register
  // -------------------
  it('POST /api/auth/register -> should register a new user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      isAdmin: false,
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User registered successfully');

    // Verify user was saved to database
    const savedUser = await User.findOne({ email: userData.email });
    expect(savedUser).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.isAdmin).toBe(false);

    // Verify password is hashed
    expect(savedUser.password).not.toBe(userData.password);
    const isMatch = await bcrypt.compare(userData.password, savedUser.password);
    expect(isMatch).toBe(true);
  });

  it('POST /api/auth/register -> should register an admin user', async () => {
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpass123',
      isAdmin: true,
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(adminData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const savedUser = await User.findOne({ email: adminData.email });
    expect(savedUser.isAdmin).toBe(true);
  });

  it('POST /api/auth/register -> should return 409 when user already exists', async () => {
    const email = 'existing@example.com';
    await createUser({ email });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: email,
        password: 'password123',
        isAdmin: false,
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User already exists');
  });

  it('POST /api/auth/register -> should handle missing required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        // Missing email and password
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/register -> should default to non-admin when isAdmin is not provided', async () => {
    const userData = {
      name: 'Regular User',
      email: 'regular@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(201);

    const savedUser = await User.findOne({ email: userData.email });
    expect(savedUser.isAdmin).toBe(false);
  });

  // -------------------
  // POST /api/auth/login
  // -------------------
  it('POST /api/auth/login -> should login user with valid credentials', async () => {
    const password = 'password123';
    const user = await createUser({
      email: 'user@example.com',
      password: await bcrypt.hash(password, 10),
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: password,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login Successful');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('userId');
    expect(response.body.data).toHaveProperty('name');
    expect(response.body.data.userId).toBe(user._id.toString());

    // Verify token is valid
    const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(user._id.toString());
  });

  it('POST /api/auth/login -> should include user id and isAdmin in token payload', async () => {
    const password = 'adminpass';
    const admin = await createUser({
      email: 'admin@example.com',
      password: await bcrypt.hash(password, 10),
      isAdmin: true,
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: password,
      });

    expect(response.status).toBe(200);

    const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(admin._id.toString());
    expect(decoded.isAdmin).toBe(true);
  });

  it('POST /api/auth/login -> should return 400 for non-existent user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('POST /api/auth/login -> should return 400 for incorrect password', async () => {
    await createUser({
      email: 'user@example.com',
      password: await bcrypt.hash('correctpassword', 10),
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('POST /api/auth/login -> should not reveal whether email or password is incorrect', async () => {
    await createUser({
      email: 'user@example.com',
      password: await bcrypt.hash('password123', 10),
    });

    const response1 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'password123',
      });

    const response2 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'wrongpassword',
      });

    // Both should return same error message
    expect(response1.body.message).toBe(response2.body.message);
  });

  it('POST /api/auth/login -> should handle missing email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'password123',
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/login -> should handle missing password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/login -> should generate valid JWT token', async () => {
    const password = 'password123';
    await createUser({
      email: 'user@example.com',
      password: await bcrypt.hash(password, 10),
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: password,
      });

    expect(response.status).toBe(200);

    const token = response.body.data.token;
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // Should not throw when verifying
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).not.toThrow();
  });
});
