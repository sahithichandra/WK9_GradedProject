import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAnswersByQuestionId,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  upvoteAnswer,
  downvoteAnswer,
} from '../../../src/controllers/answerController.js';
import * as answerService from '../../../src/services/answerService.js';

// Mock the answer service
vi.mock('../../../src/services/answerService.js');

describe('answerController', () => {
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

  describe('getAnswersByQuestionId', () => {
    // Success case
    it('should return all answers for a question with 200 status', async () => {
      // Arrange
      const mockAnswers = [
        { id: '1', answerText: 'Answer 1', author: { name: 'User 1' } },
        { id: '2', answerText: 'Answer 2', author: { name: 'User 2' } },
      ];

      req.params.questionId = 'question123';
      answerService.getAnswersByQuestionIdService = vi.fn().mockResolvedValue(mockAnswers);

      // Act
      await getAnswersByQuestionId(req, res);

      // Assert
      expect(answerService.getAnswersByQuestionIdService).toHaveBeenCalledWith('question123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Answers fetched successfully',
        data: mockAnswers,
      });
    });

    // Failure case - service error
    it('should propagate service errors', async () => {
      // Arrange
      req.params.questionId = 'question123';
      answerService.getAnswersByQuestionIdService = vi.fn().mockRejectedValue(
        new Error('No answers found')
      );

      // Act & Assert
      await expect(getAnswersByQuestionId(req, res)).rejects.toThrow('No answers found');
    });
  });

  describe('createAnswer', () => {
    // Success case
    it('should create a new answer with 201 status', async () => {
      // Arrange
      const mockCreatedAnswer = {
        id: '1',
        questionId: 'question123',
        answerText: 'This is my answer',
        author: { name: 'Test User' },
      };

      req.params.questionId = 'question123';
      req.body = { answerText: 'This is my answer' };
      answerService.createAnswerService = vi.fn().mockResolvedValue(mockCreatedAnswer);

      // Act
      await createAnswer(req, res);

      // Assert
      expect(answerService.createAnswerService).toHaveBeenCalledWith({
        questionId: 'question123',
        answerText: 'This is my answer',
        author: 'user123', // taken from req.user.id, not req.body
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Answer created successfully',
        data: mockCreatedAnswer,
      });
    });

    // Failure case - missing required fields
    it('should propagate creation errors', async () => {
      // Arrange
      req.params.questionId = 'question123';
      req.body = { answerText: 'Answer without author' };

      answerService.createAnswerService = vi.fn().mockRejectedValue(
        new Error('Missing required fields')
      );

      // Act & Assert
      await expect(createAnswer(req, res)).rejects.toThrow('Missing required fields');
    });
  });

  describe('updateAnswer', () => {
    // Success case
    it('should update an answer with 200 status', async () => {
      // Arrange
      const updateData = { answerText: 'Updated answer text' };
      const mockUpdatedAnswer = {
        id: 'answer123',
        ...updateData,
      };

      req.params.answerId = 'answer123';
      req.body = updateData;
      answerService.updateAnswerService = vi.fn().mockResolvedValue(mockUpdatedAnswer);

      // Act
      await updateAnswer(req, res);

      // Assert
      expect(answerService.updateAnswerService).toHaveBeenCalledWith(
        'answer123',
        updateData.answerText,
        req.user
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Answer updated successfully',
        data: mockUpdatedAnswer,
      });
    });

    // Error case - answer not found
    it('should propagate 404 error for non-existent answer', async () => {
      // Arrange
      req.params.answerId = 'non-existent-id';
      req.body = { answerText: 'Updated text' };

      const error = new Error('Answer not found');
      error.statusCode = 404;
      answerService.updateAnswerService = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(updateAnswer(req, res)).rejects.toThrow('Answer not found');
    });
  });

  describe('deleteAnswer', () => {
    // Success case
    it('should delete an answer with 200 status', async () => {
      // Arrange
      req.params.answerId = 'answer123';
      answerService.deleteAnswerService = vi.fn().mockResolvedValue();

      // Act
      await deleteAnswer(req, res);

      // Assert
      expect(answerService.deleteAnswerService).toHaveBeenCalledWith('answer123', req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Answer deleted successfully',
      });
    });

    // Error case - answer not found
    it('should propagate 404 error for non-existent answer', async () => {
      // Arrange
      req.params.answerId = 'non-existent-id';

      const error = new Error('Answer not found');
      error.statusCode = 404;
      answerService.deleteAnswerService = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(deleteAnswer(req, res)).rejects.toThrow('Answer not found');
    });
  });

  describe('upvoteAnswer', () => {
    // Success case
    it('should upvote an answer successfully', async () => {
      // Arrange
      const mockDocument = {
        _id: 'answer123',
        upvotes: ['user123'],
        downvotes: [],
        voteCount: 1,
      };

      req.params.answerId = 'answer123';
      answerService.upvoteAnswerService = vi.fn().mockResolvedValue(mockDocument);

      // Act
      await upvoteAnswer(req, res);

      // Assert
      expect(answerService.upvoteAnswerService).toHaveBeenCalledWith('answer123', 'user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Answer upvoted successfully',
        data: {
          _id: mockDocument._id,
          upvotes: mockDocument.upvotes,
          downvotes: mockDocument.downvotes,
          voteCount: mockDocument.voteCount,
        },
      });
    });

    // Failure case - service error
    it('should propagate upvote errors', async () => {
      // Arrange
      req.params.answerId = 'answer123';

      answerService.upvoteAnswerService = vi.fn().mockRejectedValue(
        new Error('Failed to upvote')
      );

      // Act & Assert
      await expect(upvoteAnswer(req, res)).rejects.toThrow('Failed to upvote');
    });
  });

  describe('downvoteAnswer', () => {
    // Success case
    it('should downvote an answer successfully', async () => {
      // Arrange
      const mockDocument = {
        _id: 'answer123',
        upvotes: [],
        downvotes: ['user123'],
        voteCount: -1,
      };

      req.params.answerId = 'answer123';
      answerService.downvoteAnswerService = vi.fn().mockResolvedValue(mockDocument);

      // Act
      await downvoteAnswer(req, res);

      // Assert
      expect(answerService.downvoteAnswerService).toHaveBeenCalledWith('answer123', 'user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Answer downvoted successfully',
        data: {
          _id: mockDocument._id,
          upvotes: mockDocument.upvotes,
          downvotes: mockDocument.downvotes,
          voteCount: mockDocument.voteCount,
        },
      });
    });

    // Failure case - service error
    it('should propagate downvote errors', async () => {
      // Arrange
      req.params.answerId = 'answer123';

      answerService.downvoteAnswerService = vi.fn().mockRejectedValue(
        new Error('Failed to downvote')
      );

      // Act & Assert
      await expect(downvoteAnswer(req, res)).rejects.toThrow('Failed to downvote');
    });
  });
});
