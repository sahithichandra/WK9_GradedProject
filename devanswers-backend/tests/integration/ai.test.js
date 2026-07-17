import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import request from 'supertest';

// Mock the Gemini SDK before the app is imported so no real API call is made.
const mockCreate = vi.fn();
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({
    interactions: { create: mockCreate },
  })),
}));

import '../setup.js';
import app from '../../src/app.js';
import Question from '../../src/models/Question.js';
import Answer from '../../src/models/Answer.js';
import dotenv from 'dotenv';
dotenv.config();

let jwtToken;
let mockUser;

beforeAll(async () => {
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key';
  ({ mockUser, jwtToken } = await createUserAndLogin());
});

async function createUserAndLogin() {
  const email = `aiuser+${Date.now()}@example.com`;
  const password = 'password123';

  const userRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'AI Test User', email, password, isAdmin: false });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return {
    mockUser: userRes.body.data,
    jwtToken: loginRes.body.data.token,
  };
}

async function createQuestionWithAnswers(answerCount) {
  const question = new Question({
    title: 'How do I center a div?',
    description: 'I cannot get it centered.',
    author: mockUser._id ?? mockUser.userId,
  });
  await question.save();

  for (let i = 0; i < answerCount; i++) {
    await new Answer({
      questionId: question._id,
      answerText: `Answer number ${i + 1}`,
      author: mockUser._id ?? mockUser.userId,
    }).save();
  }

  return question;
}

describe('AI API', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await Question.deleteMany({});
    await Answer.deleteMany({});
  });

  describe('POST /api/ai/improve-question', () => {
    const draft = { title: 'js broke', description: 'it dont work', tags: 'js' };

    const validSuggestion = {
      title: 'Why does my loop fail?',
      description: 'A clearer description.',
      tags: ['javascript', 'loops'],
    };

    it('should return improved fields for an authenticated user', async () => {
      mockCreate.mockResolvedValue({ output_text: JSON.stringify(validSuggestion) });

      const response = await request(app)
        .post('/api/ai/improve-question')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(draft);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(validSuggestion);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    // Spec: the AI features require authentication
    it('should return 401 without an authentication token', async () => {
      const response = await request(app)
        .post('/api/ai/improve-question')
        .send(draft);

      expect(response.status).toBe(401);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return 401 with an invalid authentication token', async () => {
      const response = await request(app)
        .post('/api/ai/improve-question')
        .set('Authorization', 'Bearer not-a-real-token')
        .send(draft);

      expect(response.status).toBe(401);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return 400 when title and description are both empty', async () => {
      const response = await request(app)
        .post('/api/ai/improve-question')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ title: '', description: '', tags: 'js' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return 502 when the model returns malformed JSON', async () => {
      mockCreate.mockResolvedValue({ output_text: 'not json' });

      const response = await request(app)
        .post('/api/ai/improve-question')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(draft);

      expect(response.status).toBe(502);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai/questions/:questionId/summary', () => {
    it('should return a summary for a question with 3 or more answers', async () => {
      const question = await createQuestionWithAnswers(3);
      mockCreate.mockResolvedValue({ output_text: 'The answers agree on flexbox.' });

      const response = await request(app)
        .post(`/api/ai/questions/${question._id}/summary`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBe('The answers agree on flexbox.');
      expect(response.body.data.answerCount).toBe(3);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    // Spec: the AI features require authentication
    it('should return 401 without an authentication token', async () => {
      const question = await createQuestionWithAnswers(3);

      const response = await request(app).post(
        `/api/ai/questions/${question._id}/summary`,
      );

      expect(response.status).toBe(401);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    // Spec: fewer than 3 answers cannot be summarized
    it('should return 400 for a question with fewer than 3 answers', async () => {
      const question = await createQuestionWithAnswers(2);

      const response = await request(app)
        .post(`/api/ai/questions/${question._id}/summary`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return 404 for a question that does not exist', async () => {
      const response = await request(app)
        .post('/api/ai/questions/000000000000000000000000/summary')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(404);
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });
});
