import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { improveQuestion, summarizeAnswers } from '../../src/services/aiService';

/**
 * Integration Tests: AI Flow with MSW
 * Exercises the real aiService through axios so the HTTP contract itself is
 * covered — endpoint URL, Authorization header, request body and the
 * `res.data.data` unwrapping. The component tests mock this service away, so a
 * wrong URL or a missing token would otherwise go unnoticed.
 */

const BASE_URL = 'http://localhost:3000/api';
const TOKEN = 'mock-jwt-token';

let lastRequest;

const captureImprove = () =>
  http.post(`${BASE_URL}/ai/improve-question`, async ({ request }) => {
    lastRequest = {
      auth: request.headers.get('Authorization'),
      body: await request.json(),
    };
    return HttpResponse.json({
      data: {
        title: 'Improved title',
        description: 'Improved description',
        tags: ['javascript', 'loops'],
      },
    });
  });

const captureSummary = () =>
  http.post(`${BASE_URL}/ai/questions/:questionId/summary`, ({ request, params }) => {
    lastRequest = {
      auth: request.headers.get('Authorization'),
      questionId: params.questionId,
    };
    return HttpResponse.json({
      data: { summary: 'The answers agree on flexbox.', answerCount: 4 },
    });
  });

describe('AI Flow Integration Tests (aiService + MSW)', () => {
  beforeEach(() => {
    lastRequest = undefined;
  });

  describe('Question Quality Improver', () => {
    it('should call the improve endpoint and unwrap the suggestion', async () => {
      server.use(captureImprove());

      const result = await improveQuestion(
        { title: 'js broke', description: 'it dont work', tags: 'js' },
        TOKEN,
      );

      // Proves res.data.data is unwrapped, not res.data.
      expect(result).toEqual({
        title: 'Improved title',
        description: 'Improved description',
        tags: ['javascript', 'loops'],
      });
    });

    it('should send the draft and a bearer token to the correct URL', async () => {
      server.use(captureImprove());

      await improveQuestion(
        { title: 'js broke', description: 'it dont work', tags: 'js' },
        TOKEN,
      );

      // Reaching the handler at all proves the URL matches the backend route.
      expect(lastRequest.auth).toBe(`Bearer ${TOKEN}`);
      expect(lastRequest.body).toEqual({
        title: 'js broke',
        description: 'it dont work',
        tags: 'js',
      });
    });

    it('should surface the server error message on failure', async () => {
      server.use(
        http.post(`${BASE_URL}/ai/improve-question`, () =>
          HttpResponse.json(
            { success: false, message: 'AI request failed' },
            { status: 502 },
          ),
        ),
      );

      await expect(
        improveQuestion({ title: 't', description: 'd', tags: '' }, TOKEN),
      ).rejects.toMatchObject({
        response: { status: 502, data: { message: 'AI request failed' } },
      });
    });
  });

  describe('Answer TL;DR Summarizer', () => {
    it('should call the summary endpoint and unwrap the summary', async () => {
      server.use(captureSummary());

      const result = await summarizeAnswers('question-1', TOKEN);

      expect(result).toEqual({
        summary: 'The answers agree on flexbox.',
        answerCount: 4,
      });
    });

    it('should send a bearer token and the questionId in the URL', async () => {
      server.use(captureSummary());

      await summarizeAnswers('question-1', TOKEN);

      expect(lastRequest.auth).toBe(`Bearer ${TOKEN}`);
      expect(lastRequest.questionId).toBe('question-1');
    });

    it('should surface a 401 when the user is not authenticated', async () => {
      server.use(
        http.post(`${BASE_URL}/ai/questions/:questionId/summary`, () =>
          HttpResponse.json(
            { success: false, message: 'No token provided, authorization denied.' },
            { status: 401 },
          ),
        ),
      );

      await expect(summarizeAnswers('question-1', undefined)).rejects.toMatchObject({
        response: { status: 401 },
      });
    });
  });
});
