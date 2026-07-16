import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import '../setup.js';
import app from '../../src/app.js';
import Tag from '../../src/models/Tag.js';
import Question from '../../src/models/Question.js';
import Answer from '../../src/models/Answer.js';
import User from '../../src/models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let testUser;

beforeAll(async () => {
  testUser = await User.create({
    name: 'Tag Test User',
    email: `tagtest+${Date.now()}@example.com`,
    password: 'hashedpassword123',
    isAdmin: false,
  });
});

async function createTag(name) {
  const tag = new Tag({ name });
  await tag.save();
  return tag;
}

async function createQuestion(overrides = {}) {
  const defaultData = {
    title: 'Test Question',
    description: 'Test Description',
    tags: [],
    author: testUser._id,
  };
  const question = new Question({ ...defaultData, ...overrides });
  await question.save();
  return question;
}

describe('Tags API', () => {
  beforeEach(async () => {
    await Tag.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
  });

  // -------------------
  // GET /api/tags
  // -------------------
  it('GET /api/tags -> should return all tags with question count', async () => {
    // Arrange
    const tag1 = await createTag('javascript');
    const tag2 = await createTag('nodejs');
    await createQuestion({ tags: [tag1._id] });
    await createQuestion({ tags: [tag1._id] });
    await createQuestion({ tags: [tag2._id] });

    // Act
    const response = await request(app).get('/api/tags');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Tags fetched successfully');
    expect(response.body.data).toHaveLength(2);

    const jsTag = response.body.data.find(t => t.name === 'javascript');
    const nodeTag = response.body.data.find(t => t.name === 'nodejs');
    expect(jsTag.questionCount).toBe(2);
    expect(nodeTag.questionCount).toBe(1);
  });

  it('GET /api/tags -> should return empty array when no tags exist', async () => {
    // Act
    const response = await request(app).get('/api/tags');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(0);
  });

  it('GET /api/tags -> should return tag with zero question count when tag has no questions', async () => {
    // Arrange
    await createTag('unused-tag');

    // Act
    const response = await request(app).get('/api/tags');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].questionCount).toBe(0);
  });

  // -------------------
  // GET /api/tags/:tagId/questions
  // -------------------
  it('GET /api/tags/:tagId/questions -> should return questions for a valid tag with populated fields', async () => {
    // Arrange
    const tag = await createTag('react');
    await createQuestion({ tags: [tag._id], title: 'React question' });

    // Act
    const response = await request(app).get(`/api/tags/${tag._id}/questions`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Questions fetched successfully');
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('React question');
    expect(response.body.data[0].author).toHaveProperty('name');
    expect(response.body.data[0].tags).toBeDefined();
  });

  it('GET /api/tags/:tagId/questions -> should include answer count for each question', async () => {
    // Arrange
    const tag = await createTag('testing');
    const question = await createQuestion({ tags: [tag._id] });
    await Answer.create({ questionId: question._id, answerText: 'Answer 1', author: testUser._id });
    await Answer.create({ questionId: question._id, answerText: 'Answer 2', author: testUser._id });

    // Act
    const response = await request(app).get(`/api/tags/${tag._id}/questions`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data[0].answerCount).toBe(2);
  });

  it('GET /api/tags/:tagId/questions -> should return 404 for non-existent tag', async () => {
    // Arrange
    const fakeId = new mongoose.Types.ObjectId();

    // Act
    const response = await request(app).get(`/api/tags/${fakeId}/questions`);

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Tag not found');
  });

  it('GET /api/tags/:tagId/questions -> should return empty data when tag has no questions', async () => {
    // Arrange
    const tag = await createTag('empty-tag');

    // Act
    const response = await request(app).get(`/api/tags/${tag._id}/questions`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(0);
  });

  it('GET /api/tags/:tagId/questions -> should return questions sorted by createdAt descending', async () => {
    // Arrange
    const tag = await createTag('sorting');
    await createQuestion({ tags: [tag._id], title: 'First' });
    await createQuestion({ tags: [tag._id], title: 'Second' });
    await createQuestion({ tags: [tag._id], title: 'Third' });

    // Act
    const response = await request(app).get(`/api/tags/${tag._id}/questions`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data[0].title).toBe('Third');
    expect(response.body.data[2].title).toBe('First');
  });
});
