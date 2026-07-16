import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import '../setup.js';
import app from '../../src/app.js';
import Question from '../../src/models/Question.js';
import Tag from '../../src/models/Tag.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let jwtToken;
let mockUser;

beforeAll(async () => {
  ({ mockUser, jwtToken } = await createUserAndLogin());
});

async function createUserAndLogin() {
  const email = `testuser+${Date.now()}@example.com`;
  const password = "password123";

  const userRes = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Test User",
      email,
      password,
      isAdmin: false,
    });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return {
    mockUser: userRes.body.data,
    jwtToken: loginRes.body.data.token,
  };
}

async function createTag(name = 'javascript') {
  const tag = new Tag({ name });
  await tag.save();
  return tag;
}

async function createQuestion(questionData = {}) {
  const user = questionData.author || mockUser._id;
  const tag = await createTag(`tag-${Date.now()}`);

  const defaultData = {
    title: 'How to use async/await?',
    description: 'I am trying to understand async/await in JavaScript',
    tags: [tag._id],
    author: user,
    upvotes: [],
    downvotes: [],
    voteCount: 0,
    views: 0,
  };

  const question = new Question({ ...defaultData, ...questionData });
  await question.save();
  return question;
}

describe('Questions API', () => {
  // Reset database before each test (keep users)
  beforeEach(async () => {
    await Question.deleteMany({});
    await Tag.deleteMany({});
  });

  // -------------------
  // GET /api/questions (all)
  // -------------------
  it('GET /api/questions -> should return all questions with populated author and tags', async () => {
    await createQuestion({ title: 'Question 1' });
    await createQuestion({ title: 'Question 2' });
    await createQuestion({ title: 'Question 3' });

    const response = await request(app).get('/api/questions');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Questions fetched successfully');
    expect(response.body.data).toHaveLength(3);
    expect(response.body.data[0]).toHaveProperty('title');
    expect(response.body.data[0]).toHaveProperty('author');
    expect(response.body.data[0].author).toHaveProperty('name');
    expect(response.body.data[0]).toHaveProperty('tags');
  });

  it('GET /api/questions -> should return questions sorted by createdAt in descending order', async () => {
    await createQuestion({ title: 'Test Question 1' });
    await createQuestion({ title: 'Test Question 2' });
    await createQuestion({ title: 'Test Question 3' });

    const response = await request(app).get('/api/questions');

    expect(response.status).toBe(200);
    expect(response.body.data[0].title).toBe('Test Question 3');
    expect(response.body.data[2].title).toBe('Test Question 1');
  });
  it('GET /api/questions -> should return 404 when no questions exist', async () => {
    const response = await request(app).get('/api/questions');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No questions found');
  });

  // -------------------
  // GET /api/questions/:id
  // -------------------
  it('GET /api/questions/:id -> should return a question by ID with populated author, tags, and answers', async () => {
    const question = await createQuestion();

    const response = await request(app).get(`/api/questions/${question._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Question fetched successfully');
    expect(response.body.data.title).toBe(question.title);
    expect(response.body.data.author).toHaveProperty('name');
    expect(response.body.data.tags).toBeDefined();
    expect(response.body.data.answers).toBeDefined();
    expect(Array.isArray(response.body.data.answers)).toBe(true);
  });

  it('GET /api/questions/:id -> should increment views count when fetching a question', async () => {
    const question = await createQuestion();
    expect(question.views).toBe(0);

    await request(app).get(`/api/questions/${question._id}`);
    await request(app).get(`/api/questions/${question._id}`);

    const updatedQuestion = await Question.findById(question._id);
    expect(updatedQuestion.views).toBe(2);
  });

  it('GET /api/questions/:id -> should return 404 for non-existent question ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/api/questions/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Question not found');
  });

  it('GET /api/questions/:id -> should return 500 for invalid question ID format', async () => {
    const response = await request(app).get('/api/questions/invalid-id');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  // -------------------
  // POST /api/questions
  // -------------------
  it('POST /api/questions -> should create a new question with valid data', async () => {
    const questionData = {
      title: 'How to test Node.js applications?',
      description: 'I want to learn about testing in Node.js',
      tags: 'nodejs, testing, vitest',
    };

    const response = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(questionData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Question created successfully');
    expect(response.body.data.title).toBe(questionData.title);
    expect(response.body.data.description).toBe(questionData.description);
    expect(response.body.data.author).toBe(mockUser._id.toString());

    const savedQuestion = await Question.findById(response.body.data._id);
    expect(savedQuestion).toBeDefined();
    expect(savedQuestion.tags).toHaveLength(3);
  });

  it('POST /api/questions -> should set the author from the authenticated user (JWT), not from body', async () => {
    const response = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: 'JWT author test question',
        description: 'Verifying author is set from token',
        tags: 'test',
        author: new mongoose.Types.ObjectId(), // this should be ignored
      });

    expect(response.status).toBe(201);
    expect(response.body.data.author).toBe(mockUser._id.toString());
  });

  it('POST /api/questions -> should create or reuse tags when creating a question', async () => {
    const existingTag = await createTag('javascript');

    const questionData = {
      title: 'JavaScript Question',
      description: 'Testing tag creation',
      tags: 'javascript, new-tag',
    };

    const response = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(questionData);

    expect(response.status).toBe(201);
    const savedQuestion = await Question.findById(response.body.data._id).populate('tags');
    expect(savedQuestion.tags).toHaveLength(2);
    expect(savedQuestion.tags.some(tag => tag.name === 'javascript')).toBe(true);
    expect(savedQuestion.tags.some(tag => tag.name === 'new-tag')).toBe(true);
  });

  it('POST /api/questions -> should return 401 without authentication token', async () => {
    const questionData = {
      title: 'Test Question',
      description: 'Test Description',
      tags: 'test',
      author: new mongoose.Types.ObjectId(),
    };

    const response = await request(app)
      .post('/api/questions')
      .send(questionData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No token provided, authorization denied.');
  });

  it('POST /api/questions -> should return 401 with invalid authentication token', async () => {
    const questionData = {
      title: 'Test Question',
      description: 'Test Description',
      tags: 'test',
      author: new mongoose.Types.ObjectId(),
    };

    const response = await request(app)
      .post('/api/questions')
      .set('Authorization', 'Bearer invalid-token')
      .send(questionData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token is not valid.');
  });

  // -------------------
  // PUT /api/questions/:id
  // -------------------
  it('PUT /api/questions/:id -> should update a question with valid data', async () => {
    const question = await createQuestion({ author: mockUser._id });

    const updateData = {
      title: 'Updated Question Title',
      description: 'Updated description',
      tags: 'updated, tags',
    };

    const response = await request(app)
      .put(`/api/questions/${question._id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Question updated successfully');
    expect(response.body.data.title).toBe(updateData.title);
    expect(response.body.data.description).toBe(updateData.description);

    const updatedQuestion = await Question.findById(question._id);
    expect(updatedQuestion.title).toBe(updateData.title);
  });

  it('PUT /api/questions/:id -> should return 404 for non-existent question ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const updateData = {
      title: 'Updated Title',
      description: 'Updated Description',
      tags: 'test',
    };

    const response = await request(app)
      .put(`/api/questions/${fakeId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Question not found');
  });

  it('PUT /api/questions/:id -> should return 401 without authentication', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .put(`/api/questions/${question._id}`)
      .send({ title: 'Updated', description: 'Updated', tags: 'test' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('PUT /api/questions/:id -> should return 403 when user is not the author or admin', async () => {
    const otherEmail = `other+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Other', email: otherEmail, password: 'password123', isAdmin: false });
    const otherLogin = await request(app).post('/api/auth/login').send({ email: otherEmail, password: 'password123' });
    const otherToken = otherLogin.body.data.token;

    const question = await createQuestion({ author: mockUser._id });

    const response = await request(app)
      .put(`/api/questions/${question._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hacked Title', description: 'Hacked', tags: 'hack' });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Not authorized to update this question');
  });

  it('PUT /api/questions/:id -> should allow an admin to update any question', async () => {
    const adminEmail = `admin+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Admin', email: adminEmail, password: 'password123', isAdmin: true });
    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'password123' });
    const adminToken = adminLogin.body.data.token;

    const question = await createQuestion({ author: mockUser._id });

    const response = await request(app)
      .put(`/api/questions/${question._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Admin Updated Title', description: 'Admin Updated', tags: 'admin' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Admin Updated Title');
  });

  // -------------------
  // DELETE /api/questions/:id
  // -------------------
  it('DELETE /api/questions/:id -> should delete a question when user is the author', async () => {
    const question = await createQuestion({ author: mockUser._id });

    const response = await request(app)
      .delete(`/api/questions/${question._id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Question deleted successfully');

    const deletedQuestion = await Question.findById(question._id);
    expect(deletedQuestion).toBeNull();
  });

  it('DELETE /api/questions/:id -> should delete a question when user is an admin', async () => {
    const adminEmail = `admin+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Admin', email: adminEmail, password: 'password123', isAdmin: true });
    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'password123' });
    const adminToken = adminLogin.body.data.token;

    const question = await createQuestion({ author: mockUser._id });

    const response = await request(app)
      .delete(`/api/questions/${question._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedQuestion = await Question.findById(question._id);
    expect(deletedQuestion).toBeNull();
  });

  it('DELETE /api/questions/:id -> should return 403 when user is not the author or admin', async () => {
    const otherEmail = `other+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Other', email: otherEmail, password: 'password123', isAdmin: false });
    const otherLogin = await request(app).post('/api/auth/login').send({ email: otherEmail, password: 'password123' });
    const otherToken = otherLogin.body.data.token;

    const question = await createQuestion({ author: mockUser._id });

    const response = await request(app)
      .delete(`/api/questions/${question._id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Not authorized to delete this question');
  });

  it('DELETE /api/questions/:id -> should return 404 for non-existent question ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/questions/${fakeId}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Question not found');
  });

  it('DELETE /api/questions/:id -> should return 401 without authentication', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .delete(`/api/questions/${question._id}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // -------------------
  // POST /api/questions/:id/upvote
  // -------------------
  it('POST /api/questions/:id/upvote -> should upvote a question successfully', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .post(`/api/questions/${question._id}/upvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Question upvoted successfully');
    expect(response.body.data.upvotes).toHaveLength(1);
    expect(response.body.data.voteCount).toBe(1);

    const updatedQuestion = await Question.findById(question._id);
    expect(updatedQuestion.upvotes).toHaveLength(1);
    expect(updatedQuestion.voteCount).toBe(1);
  });

  it('POST /api/questions/:id/upvote -> should not duplicate upvote if user already upvoted', async () => {
    const question = await createQuestion();

    await request(app)
      .post(`/api/questions/${question._id}/upvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    const response = await request(app)
      .post(`/api/questions/${question._id}/upvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.data.upvotes).toHaveLength(1);
    expect(response.body.data.voteCount).toBe(1);
  });

  it('POST /api/questions/:id/upvote -> should switch from downvote to upvote', async () => {
    const question = await createQuestion();

    await request(app)
      .post(`/api/questions/${question._id}/downvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    const response = await request(app)
      .post(`/api/questions/${question._id}/upvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.data.upvotes).toHaveLength(1);
    expect(response.body.data.downvotes).toHaveLength(0);
    expect(response.body.data.voteCount).toBe(1);
  });

  it('POST /api/questions/:id/upvote -> should return 401 without authentication', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .post(`/api/questions/${question._id}/upvote`)
      .send({ userId: new mongoose.Types.ObjectId() });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // -------------------
  // POST /api/questions/:id/downvote
  // -------------------
  it('POST /api/questions/:id/downvote -> should downvote a question successfully', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .post(`/api/questions/${question._id}/downvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Question downvoted successfully');
    expect(response.body.data.downvotes).toHaveLength(1);
    expect(response.body.data.voteCount).toBe(-1);

    const updatedQuestion = await Question.findById(question._id);
    expect(updatedQuestion.downvotes).toHaveLength(1);
    expect(updatedQuestion.voteCount).toBe(-1);
  });

  it('POST /api/questions/:id/downvote -> should not duplicate downvote if user already downvoted', async () => {
    const question = await createQuestion();

    await request(app)
      .post(`/api/questions/${question._id}/downvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    const response = await request(app)
      .post(`/api/questions/${question._id}/downvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.data.downvotes).toHaveLength(1);
    expect(response.body.data.voteCount).toBe(-1);
  });

  it('POST /api/questions/:id/downvote -> should switch from upvote to downvote', async () => {
    const question = await createQuestion();

    await request(app)
      .post(`/api/questions/${question._id}/upvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    const response = await request(app)
      .post(`/api/questions/${question._id}/downvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.data.upvotes).toHaveLength(0);
    expect(response.body.data.downvotes).toHaveLength(1);
    expect(response.body.data.voteCount).toBe(-1);
  });

  it('POST /api/questions/:id/downvote -> should calculate correct vote count with multiple votes', async () => {
    const ts = Date.now();

    await request(app).post('/api/auth/register').send({ name: 'User 1', email: `u1+${ts}@example.com`, password: 'password123', isAdmin: false });
    const login1 = await request(app).post('/api/auth/login').send({ email: `u1+${ts}@example.com`, password: 'password123' });
    const token1 = login1.body.data.token;
    const userId1 = login1.body.data.userId;

    await request(app).post('/api/auth/register').send({ name: 'User 2', email: `u2+${ts}@example.com`, password: 'password123', isAdmin: false });
    const login2 = await request(app).post('/api/auth/login').send({ email: `u2+${ts}@example.com`, password: 'password123' });
    const token2 = login2.body.data.token;
    const userId2 = login2.body.data.userId;

    await request(app).post('/api/auth/register').send({ name: 'User 3', email: `u3+${ts}@example.com`, password: 'password123', isAdmin: false });
    const login3 = await request(app).post('/api/auth/login').send({ email: `u3+${ts}@example.com`, password: 'password123' });
    const token3 = login3.body.data.token;
    const userId3 = login3.body.data.userId;

    const question = await createQuestion();

    await request(app)
      .post(`/api/questions/${question._id}/upvote`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ userId: userId1 });

    await request(app)
      .post(`/api/questions/${question._id}/upvote`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ userId: userId2 });

    const response = await request(app)
      .post(`/api/questions/${question._id}/downvote`)
      .set('Authorization', `Bearer ${token3}`)
      .send({ userId: userId3 });

    expect(response.status).toBe(200);
    expect(response.body.data.voteCount).toBe(1); // 2 upvotes - 1 downvote
  });

  it('POST /api/questions/:id/downvote -> should return 401 without authentication', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .post(`/api/questions/${question._id}/downvote`)
      .send({ userId: new mongoose.Types.ObjectId() });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
