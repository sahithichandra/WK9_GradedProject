import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  improveQuestion,
  summarizeAnswers,
} from '../../../src/controllers/aiController.js';
import * as aiService from '../../../src/services/aiService.js';

// Mock the AI service
vi.mock('../../../src/services/aiService.js');

describe('aiController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      params: {},
      body: {},
      user: { id: 'user123', isAdmin: false },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('improveQuestion', () => {
    const suggestion = {
      title: 'Improved title',
      description: 'Improved description',
      tags: ['javascript'],
    };

    // Success case
    it('should return the suggestion with 200 status', async () => {
      // Arrange
      req.body = { title: 'old', description: 'old desc', tags: 'js' };
      aiService.improveQuestionService = vi.fn().mockResolvedValue(suggestion);

      // Act
      await improveQuestion(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Question improvements generated successfully',
        data: suggestion,
      });
    });

    // The controller must pass the draft through untouched
    it('should delegate the request body to the service', async () => {
      req.body = { title: 'old', description: 'old desc', tags: 'js' };
      aiService.improveQuestionService = vi.fn().mockResolvedValue(suggestion);

      await improveQuestion(req, res);

      expect(aiService.improveQuestionService).toHaveBeenCalledWith({
        title: 'old',
        description: 'old desc',
        tags: 'js',
      });
    });

    // Failure case - errors bubble to the error handler
    it('should propagate service errors', async () => {
      req.body = { title: 'old', description: 'old desc', tags: 'js' };
      const error = Object.assign(new Error('AI request failed'), { statusCode: 502 });
      aiService.improveQuestionService = vi.fn().mockRejectedValue(error);

      await expect(improveQuestion(req, res)).rejects.toThrow('AI request failed');
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('summarizeAnswers', () => {
    const summary = { summary: 'A concise summary.', answerCount: 4 };

    // Success case
    it('should return the summary with 200 status', async () => {
      // Arrange
      req.params.questionId = 'question123';
      aiService.summarizeAnswersService = vi.fn().mockResolvedValue(summary);

      // Act
      await summarizeAnswers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Answers summarized successfully',
        data: summary,
      });
    });

    // The controller must read the id from the route params
    it('should pass the questionId from params to the service', async () => {
      req.params.questionId = 'question123';
      aiService.summarizeAnswersService = vi.fn().mockResolvedValue(summary);

      await summarizeAnswers(req, res);

      expect(aiService.summarizeAnswersService).toHaveBeenCalledWith('question123');
    });

    // Failure case - errors bubble to the error handler
    it('should propagate service errors', async () => {
      req.params.questionId = 'question123';
      const error = Object.assign(new Error('Question not found'), { statusCode: 404 });
      aiService.summarizeAnswersService = vi.fn().mockRejectedValue(error);

      await expect(summarizeAnswers(req, res)).rejects.toThrow('Question not found');
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
