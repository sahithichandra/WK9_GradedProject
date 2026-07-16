import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import '../setup.js';
import app from '../../src/app.js';
import Question from '../../src/models/Question.js';
import Answer from '../../src/models/Answer.js';
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

async function createTag(name = `tag-${Date.now()}`) {
  const tag = new Tag({ name });
  await tag.save();
  return tag;
}

async function createQuestion(questionData = {}) {
  const user = questionData.author || mockUser._id;
  const tag = await createTag();

  const defaultData = {
    title: 'Test Question',
    description: 'Test Description',
    tags: [tag._id],
    author: user,
  };

  const question = new Question({ ...defaultData, ...questionData });
  await question.save();
  return question;
}

async function createAnswer(answerData = {}) {
  const author = answerData.author || mockUser._id;
  const question = answerData.question || await createQuestion();

  const defaultData = {
    questionId: question._id,
    answerText: 'This is a test answer',
    author,
  };

  const answer = new Answer({ ...defaultData, ...answerData });
  await answer.save();
  return answer;
}

describe('Answers API', () => {
  // Reset database before each test (keep users)
  beforeEach(async () => {
    await Answer.deleteMany({});
    await Question.deleteMany({});
    await Tag.deleteMany({});
  });

  // -------------------
  // GET /api/answers/question/:questionId
  // -------------------
  it('GET /api/answers/question/:questionId -> should return all answers for a question with populated author', async () => {
    const question = await createQuestion();
    await createAnswer({ question: question, answerText: 'Answer 1' });
    await createAnswer({ question: question, answerText: 'Answer 2' });

    const response = await request(app)
      .get(`/api/answers/question/${question._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty('answerText');
    expect(response.body.data[0].author).toHaveProperty('name');
  });

  it('GET /api/answers/question/:questionId -> should return 404 when no answers exist for a question', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .get(`/api/answers/question/${question._id}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No answers found for this question');
  });

  it('GET /api/answers/question/:questionId -> should only return answers for the specified question', async () => {
    const question1 = await createQuestion();
    const question2 = await createQuestion();

    await createAnswer({ question: question1, answerText: 'Answer for Q1' });
    await createAnswer({ question: question2, answerText: 'Answer for Q2' });

    const response = await request(app)
      .get(`/api/answers/question/${question1._id}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].answerText).toBe('Answer for Q1');
  });

  // -------------------
  // POST /api/answers/question/:questionId
  // -------------------
  it('POST /api/answers/question/:questionId -> should create a new answer with valid data', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .post(`/api/answers/question/${question._id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ answerText: 'This is my answer to the question' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Answer created successfully');
    expect(response.body.data.answerText).toBe('This is my answer to the question');
    expect(response.body.data.author).toHaveProperty('name');

    const savedAnswer = await Answer.findById(response.body.data._id);
    expect(savedAnswer).toBeDefined();
    expect(savedAnswer.questionId.toString()).toBe(question._id.toString());
  });

  it('POST /api/answers/question/:questionId -> should set the author from the authenticated user (JWT), not from body', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .post(`/api/answers/question/${question._id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        answerText: 'JWT author test answer',
        author: new mongoose.Types.ObjectId(), // this should be ignored
      });

    expect(response.status).toBe(201);
    const savedAnswer = await Answer.findById(response.body.data._id);
    expect(savedAnswer.author.toString()).toBe(mockUser._id.toString());
  });

  it('POST /api/answers/question/:questionId -> should return 401 without authentication token', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .post(`/api/answers/question/${question._id}`)
      .send({ answerText: 'Test answer', author: new mongoose.Types.ObjectId() });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/answers/question/:questionId -> should return 401 with invalid authentication token', async () => {
    const question = await createQuestion();

    const response = await request(app)
      .post(`/api/answers/question/${question._id}`)
      .set('Authorization', 'Bearer invalid-token')
      .send({ answerText: 'Test answer', author: new mongoose.Types.ObjectId() });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // -------------------
  // PUT /api/answers/:answerId
  // -------------------
  it('PUT /api/answers/:answerId -> should update an answer with valid data', async () => {
    const answer = await createAnswer({ author: mockUser._id });

    const updateData = {
      answerText: 'Updated answer text',
    };

    const response = await request(app)
      .put(`/api/answers/${answer._id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Answer updated successfully');
    expect(response.body.data.answerText).toBe(updateData.answerText);

    const updatedAnswer = await Answer.findById(answer._id);
    expect(updatedAnswer.answerText).toBe(updateData.answerText);
  });

  it('PUT /api/answers/:answerId -> should return 404 for non-existent answer ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .put(`/api/answers/${fakeId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ answerText: 'Updated text' });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Answer not found');
  });

  it('PUT /api/answers/:answerId -> should return 401 without authentication', async () => {
    const answer = await createAnswer();

    const response = await request(app)
      .put(`/api/answers/${answer._id}`)
      .send({ answerText: 'Updated text' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('PUT /api/answers/:answerId -> should return 403 when user is not the author or admin', async () => {
    const otherEmail = `other+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Other', email: otherEmail, password: 'password123', isAdmin: false });
    const otherLogin = await request(app).post('/api/auth/login').send({ email: otherEmail, password: 'password123' });
    const otherToken = otherLogin.body.data.token;

    const answer = await createAnswer({ author: mockUser._id });

    const response = await request(app)
      .put(`/api/answers/${answer._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ answerText: 'Hacked answer text' });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Not authorized to update this answer');
  });

  it('PUT /api/answers/:answerId -> should allow an admin to update any answer', async () => {
    const adminEmail = `admin+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Admin', email: adminEmail, password: 'password123', isAdmin: true });
    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'password123' });
    const adminToken = adminLogin.body.data.token;

    const answer = await createAnswer({ author: mockUser._id });

    const response = await request(app)
      .put(`/api/answers/${answer._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ answerText: 'Admin updated this answer' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.answerText).toBe('Admin updated this answer');
  });

  // -------------------
  // DELETE /api/answers/:answerId
  // -------------------
  it('DELETE /api/answers/:answerId -> should delete an answer successfully', async () => {
    const answer = await createAnswer({ author: mockUser._id });

    const response = await request(app)
      .delete(`/api/answers/${answer._id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Answer deleted successfully');

    const deletedAnswer = await Answer.findById(answer._id);
    expect(deletedAnswer).toBeNull();
  });

  it('DELETE /api/answers/:answerId -> should return 404 for non-existent answer ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/answers/${fakeId}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Answer not found');
  });

  it('DELETE /api/answers/:answerId -> should return 401 without authentication', async () => {
    const answer = await createAnswer();

    const response = await request(app)
      .delete(`/api/answers/${answer._id}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('DELETE /api/answers/:answerId -> should return 403 when user is not the author or admin', async () => {
    const otherEmail = `other+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Other', email: otherEmail, password: 'password123', isAdmin: false });
    const otherLogin = await request(app).post('/api/auth/login').send({ email: otherEmail, password: 'password123' });
    const otherToken = otherLogin.body.data.token;

    const answer = await createAnswer({ author: mockUser._id });

    const response = await request(app)
      .delete(`/api/answers/${answer._id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Not authorized to delete this answer');

    const stillExists = await Answer.findById(answer._id);
    expect(stillExists).not.toBeNull();
  });

  it('DELETE /api/answers/:answerId -> should allow an admin to delete any answer', async () => {
    const adminEmail = `admin+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ name: 'Admin', email: adminEmail, password: 'password123', isAdmin: true });
    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'password123' });
    const adminToken = adminLogin.body.data.token;

    const answer = await createAnswer({ author: mockUser._id });

    const response = await request(app)
      .delete(`/api/answers/${answer._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Answer deleted successfully');

    const deletedAnswer = await Answer.findById(answer._id);
    expect(deletedAnswer).toBeNull();
  });

  // -------------------
  // POST /api/answers/:answerId/upvote
  // -------------------
  it('POST /api/answers/:answerId/upvote -> should upvote an answer successfully', async () => {
    const answer = await createAnswer();

    const response = await request(app)
      .post(`/api/answers/${answer._id}/upvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Answer upvoted successfully');
    expect(response.body.data.upvotes).toHaveLength(1);
    expect(response.body.data.voteCount).toBe(1);

    const updatedAnswer = await Answer.findById(answer._id);
    expect(updatedAnswer.upvotes).toHaveLength(1);
    expect(updatedAnswer.voteCount).toBe(1);
  });

  it('POST /api/answers/:answerId/upvote -> should not duplicate upvote if user already upvoted', async () => {
    const answer = await createAnswer();

    await request(app)
      .post(`/api/answers/${answer._id}/upvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    const response = await request(app)
      .post(`/api/answers/${answer._id}/upvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.data.upvotes).toHaveLength(1);
    expect(response.body.data.voteCount).toBe(1);
  });

  it('POST /api/answers/:answerId/upvote -> should switch from downvote to upvote', async () => {
    const answer = await createAnswer();

    await request(app)
      .post(`/api/answers/${answer._id}/downvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    const response = await request(app)
      .post(`/api/answers/${answer._id}/upvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.data.upvotes).toHaveLength(1);
    expect(response.body.data.downvotes).toHaveLength(0);
    expect(response.body.data.voteCount).toBe(1);
  });

  it('POST /api/answers/:answerId/upvote -> should return 401 without authentication', async () => {
    const answer = await createAnswer();

    const response = await request(app)
      .post(`/api/answers/${answer._id}/upvote`)
      .send({ userId: new mongoose.Types.ObjectId() });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // -------------------
  // POST /api/answers/:answerId/downvote
  // -------------------
  it('POST /api/answers/:answerId/downvote -> should downvote an answer successfully', async () => {
    const answer = await createAnswer();

    const response = await request(app)
      .post(`/api/answers/${answer._id}/downvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Answer downvoted successfully');
    expect(response.body.data.downvotes).toHaveLength(1);
    expect(response.body.data.voteCount).toBe(-1);

    const updatedAnswer = await Answer.findById(answer._id);
    expect(updatedAnswer.downvotes).toHaveLength(1);
    expect(updatedAnswer.voteCount).toBe(-1);
  });

  it('POST /api/answers/:answerId/downvote -> should not duplicate downvote if user already downvoted', async () => {
    const answer = await createAnswer();

    await request(app)
      .post(`/api/answers/${answer._id}/downvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    const response = await request(app)
      .post(`/api/answers/${answer._id}/downvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.data.downvotes).toHaveLength(1);
    expect(response.body.data.voteCount).toBe(-1);
  });

  it('POST /api/answers/:answerId/downvote -> should switch from upvote to downvote', async () => {
    const answer = await createAnswer();

    await request(app)
      .post(`/api/answers/${answer._id}/upvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    const response = await request(app)
      .post(`/api/answers/${answer._id}/downvote`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ userId: mockUser._id });

    expect(response.status).toBe(200);
    expect(response.body.data.upvotes).toHaveLength(0);
    expect(response.body.data.downvotes).toHaveLength(1);
    expect(response.body.data.voteCount).toBe(-1);
  });

  it('POST /api/answers/:answerId/downvote -> should return 401 without authentication', async () => {
    const answer = await createAnswer();

    const response = await request(app)
      .post(`/api/answers/${answer._id}/downvote`)
      .send({ userId: new mongoose.Types.ObjectId() });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
