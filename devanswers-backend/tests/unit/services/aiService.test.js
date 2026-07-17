import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the Gemini SDK so no real API call (or API key) is ever needed.
const mockCreate = vi.fn();
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({
    interactions: { create: mockCreate },
  })),
}));

import {
  improveQuestionService,
  summarizeAnswersService,
  MIN_ANSWERS_FOR_SUMMARY,
} from '../../../src/services/aiService.js';
import Question from '../../../src/models/Question.js';
import Answer from '../../../src/models/Answer.js';

vi.mock('../../../src/models/Question.js');
vi.mock('../../../src/models/Answer.js');

const ORIGINAL_KEY = process.env.GEMINI_API_KEY;

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = ORIGINAL_KEY;
  });

  describe('improveQuestionService', () => {
    const draft = {
      title: 'js loop broke',
      description: 'my loop dont work',
      tags: 'js',
    };

    const validSuggestion = {
      title: 'Why does my for loop log the wrong value?',
      description: 'A clearer description.',
      tags: ['javascript', 'loops'],
    };

    // Success case
    it('should return improved title, description and tags', async () => {
      // Arrange
      mockCreate.mockResolvedValue({ output_text: JSON.stringify(validSuggestion) });

      // Act
      const result = await improveQuestionService(draft);

      // Assert
      expect(result).toEqual(validSuggestion);
    });

    // Spec: exactly one Gemini call per user action
    it('should make exactly one Gemini API call', async () => {
      mockCreate.mockResolvedValue({ output_text: JSON.stringify(validSuggestion) });

      await improveQuestionService(draft);

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    // The draft content must actually reach the model, as structured JSON
    it('should send the draft to the model and request a JSON schema', async () => {
      mockCreate.mockResolvedValue({ output_text: JSON.stringify(validSuggestion) });

      await improveQuestionService(draft);

      const params = mockCreate.mock.calls[0][0];
      expect(params.model).toBeTruthy();
      expect(params.input).toContain('js loop broke');
      expect(params.input).toContain('my loop dont work');
      expect(params.response_format.mime_type).toBe('application/json');
      expect(params.response_format.schema.required).toEqual([
        'title',
        'description',
        'tags',
      ]);
    });

    // Edge case - tags are normalised to a trimmed array
    it('should trim tags and drop empty ones', async () => {
      mockCreate.mockResolvedValue({
        output_text: JSON.stringify({
          title: 'T',
          description: 'D',
          tags: ['  react  ', '', 'hooks'],
        }),
      });

      const result = await improveQuestionService(draft);

      expect(result.tags).toEqual(['react', 'hooks']);
    });

    // Edge case - a description alone is enough to improve
    it('should accept a draft with only a description', async () => {
      mockCreate.mockResolvedValue({ output_text: JSON.stringify(validSuggestion) });

      await expect(
        improveQuestionService({ title: '', description: 'something', tags: '' }),
      ).resolves.toBeTruthy();
    });

    // Error case - nothing to improve
    it('should throw 400 when title and description are both empty', async () => {
      await expect(
        improveQuestionService({ title: '  ', description: '', tags: 'js' }),
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    // Failure case - malformed model output
    it('should throw 502 when the model returns non-JSON', async () => {
      mockCreate.mockResolvedValue({ output_text: 'not json at all' });

      await expect(improveQuestionService(draft)).rejects.toMatchObject({
        statusCode: 502,
      });
    });

    // Failure case - empty model output
    it('should throw 502 when the model returns an empty response', async () => {
      mockCreate.mockResolvedValue({ output_text: '   ' });

      await expect(improveQuestionService(draft)).rejects.toMatchObject({
        statusCode: 502,
      });
    });

    // Failure case - upstream API error
    it('should throw 502 when the Gemini call fails', async () => {
      mockCreate.mockRejectedValue(new Error('quota exceeded'));

      await expect(improveQuestionService(draft)).rejects.toMatchObject({
        statusCode: 502,
      });
    });

    // Failure case - provider quota exhausted
    it('should map a 429 quota error to 429 with a short retry message', async () => {
      mockCreate.mockRejectedValue(
        new Error(
          '429 You exceeded your current quota, please check your plan and billing details. Please retry in 22.76s.',
        ),
      );

      await expect(improveQuestionService(draft)).rejects.toMatchObject({
        statusCode: 429,
        message: 'The AI service is busy right now. Please try again in about 23 seconds.',
      });
    });

    // Failure case - misconfiguration
    it('should throw 500 when GEMINI_API_KEY is not set', async () => {
      delete process.env.GEMINI_API_KEY;

      await expect(improveQuestionService(draft)).rejects.toMatchObject({
        statusCode: 500,
      });
    });
  });

  describe('summarizeAnswersService', () => {
    const mockQuestion = {
      _id: 'question123',
      title: 'How do I center a div?',
      description: 'I cannot center it.',
    };

    const mockAnswers = [
      { answerText: 'Use flexbox.' },
      { answerText: 'Use grid.' },
      { answerText: 'Use margin auto.' },
    ];

    const arrangeAnswers = (answers) => {
      Question.findById = vi.fn().mockResolvedValue(mockQuestion);
      Answer.find = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue(answers),
      });
    };

    // Success case
    it('should return a plain-text summary and the answer count', async () => {
      // Arrange
      arrangeAnswers(mockAnswers);
      mockCreate.mockResolvedValue({ output_text: 'The answers agree on flexbox.' });

      // Act
      const result = await summarizeAnswersService('question123');

      // Assert
      expect(result).toEqual({
        summary: 'The answers agree on flexbox.',
        answerCount: 3,
      });
    });

    // Spec: exactly one Gemini call per user action
    it('should make exactly one Gemini API call', async () => {
      arrangeAnswers(mockAnswers);
      mockCreate.mockResolvedValue({ output_text: 'A summary.' });

      await summarizeAnswersService('question123');

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    // The question and every answer must reach the model in that single call
    it('should send the question text and all answer texts', async () => {
      arrangeAnswers(mockAnswers);
      mockCreate.mockResolvedValue({ output_text: 'A summary.' });

      await summarizeAnswersService('question123');

      const params = mockCreate.mock.calls[0][0];
      expect(params.input).toContain('How do I center a div?');
      expect(params.input).toContain('Use flexbox.');
      expect(params.input).toContain('Use grid.');
      expect(params.input).toContain('Use margin auto.');
      // Plain text, so no JSON schema is requested.
      expect(params.response_format).toBeUndefined();
    });

    // Edge case - the minimum-answers rule is enforced server-side
    it(`should throw 400 when there are fewer than ${MIN_ANSWERS_FOR_SUMMARY} answers`, async () => {
      arrangeAnswers(mockAnswers.slice(0, 2));

      await expect(summarizeAnswersService('question123')).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    // Error case - question does not exist
    it('should throw 404 when the question is not found', async () => {
      Question.findById = vi.fn().mockResolvedValue(null);

      await expect(summarizeAnswersService('nope')).rejects.toMatchObject({
        message: 'Question not found',
        statusCode: 404,
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });

    // Failure case - upstream API error
    it('should throw 502 when the Gemini call fails', async () => {
      arrangeAnswers(mockAnswers);
      mockCreate.mockRejectedValue(new Error('upstream down'));

      await expect(summarizeAnswersService('question123')).rejects.toMatchObject({
        statusCode: 502,
      });
    });
  });
});
