import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  upvoteQuestion,
  downvoteQuestion,
} from '../../../src/controllers/questionController.js';
import * as questionService from '../../../src/services/questionService.js';

// Mock the question service
vi.mock('../../../src/services/questionService.js');

describe('questionController', () => {
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

  describe('getAllQuestions', () => {
    // Success case
    it('should return all questions with 200 status', async () => {
      // Arrange
      const mockQuestions = [
        { id: '1', title: 'Question 1' },
        { id: '2', title: 'Question 2' },
      ];

      questionService.getAllQuestionsService = vi.fn().mockResolvedValue(mockQuestions);

      // Act
      await getAllQuestions(req, res);

      // Assert
      expect(questionService.getAllQuestionsService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Questions fetched successfully',
        data: mockQuestions,
      });
    });

    // Failure case - service error
    it('should propagate service errors', async () => {
      // Arrange
      questionService.getAllQuestionsService = vi.fn().mockRejectedValue(
        new Error('Database error')
      );

      // Act & Assert
      await expect(getAllQuestions(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('getQuestionById', () => {
    // Success case
    it('should return a question by ID with 200 status', async () => {
      // Arrange
      const mockQuestion = { id: '1', title: 'Test Question', views: 5 };
      req.params.id = '1';

      questionService.getQuestionByIdService = vi.fn().mockResolvedValue(mockQuestion);

      // Act
      await getQuestionById(req, res);

      // Assert
      expect(questionService.getQuestionByIdService).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Question fetched successfully',
        data: mockQuestion,
      });
    });

    // Error case - question not found
    it('should propagate 404 error for non-existent question', async () => {
      // Arrange
      req.params.id = 'non-existent-id';
      const error = new Error('Question not found');
      error.statusCode = 404;

      questionService.getQuestionByIdService = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(getQuestionById(req, res)).rejects.toThrow('Question not found');
    });
  });

  describe('createQuestion', () => {
    // Success case
    it('should create a new question with 201 status', async () => {
      // Arrange
      const bodyData = {
        title: 'New Question',
        description: 'Description',
        tags: 'javascript, nodejs',
      };
      const mockCreatedQuestion = { id: '1', ...bodyData, author: 'user123' };

      req.body = bodyData;
      questionService.createQuestionService = vi.fn().mockResolvedValue(mockCreatedQuestion);

      // Act
      await createQuestion(req, res);

      // Assert
      expect(questionService.createQuestionService).toHaveBeenCalledWith({
        ...bodyData,
        author: 'user123', // taken from req.user.id, not req.body
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Question created successfully',
        data: mockCreatedQuestion,
      });
    });

    // Failure case - service error
    it('should propagate creation errors', async () => {
      // Arrange
      req.body = { title: 'Incomplete Question' };

      questionService.createQuestionService = vi.fn().mockRejectedValue(
        new Error('Missing required fields')
      );

      // Act & Assert
      await expect(createQuestion(req, res)).rejects.toThrow('Missing required fields');
    });
  });

  describe('updateQuestion', () => {
    // Success case
    it('should update a question with 200 status', async () => {
      // Arrange
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        tags: 'updated, tags',
      };
      const mockUpdatedQuestion = { id: '1', ...updateData };

      req.params.id = '1';
      req.body = updateData;
      questionService.updateQuestionService = vi.fn().mockResolvedValue(mockUpdatedQuestion);

      // Act
      await updateQuestion(req, res);

      // Assert
      expect(questionService.updateQuestionService).toHaveBeenCalledWith(
        '1',
        updateData.title,
        updateData.description,
        updateData.tags,
        req.user
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Question updated successfully',
        data: mockUpdatedQuestion,
      });
    });

    // Error case - question not found
    it('should propagate 404 error for non-existent question', async () => {
      // Arrange
      req.params.id = 'non-existent-id';
      req.body = { title: 'Updated', description: 'Updated', tags: 'test' };

      const error = new Error('Question not found');
      error.statusCode = 404;
      questionService.updateQuestionService = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(updateQuestion(req, res)).rejects.toThrow('Question not found');
    });
  });

  describe('deleteQuestion', () => {
    // Success case - author deletes
    it('should delete a question when user is the author', async () => {
      // Arrange
      const mockDeletedQuestion = { id: '1', title: 'Deleted Question' };
      req.params.id = '1';
      req.user = { id: 'user123', isAdmin: false };

      questionService.deleteQuestionService = vi.fn().mockResolvedValue(mockDeletedQuestion);

      // Act
      await deleteQuestion(req, res);

      // Assert
      expect(questionService.deleteQuestionService).toHaveBeenCalledWith('1', req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Question deleted successfully',
        data: mockDeletedQuestion,
      });
    });

    // Success case - admin deletes
    it('should delete a question when user is an admin', async () => {
      // Arrange
      const mockDeletedQuestion = { id: '1', title: 'Deleted Question' };
      req.params.id = '1';
      req.user = { id: 'admin123', isAdmin: true };

      questionService.deleteQuestionService = vi.fn().mockResolvedValue(mockDeletedQuestion);

      // Act
      await deleteQuestion(req, res);

      // Assert
      expect(questionService.deleteQuestionService).toHaveBeenCalledWith('1', req.user);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    // Error case - not authorized
    it('should propagate 403 authorization error', async () => {
      // Arrange
      req.params.id = '1';
      const error = new Error('Not authorized');
      error.statusCode = 403;

      questionService.deleteQuestionService = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(deleteQuestion(req, res)).rejects.toMatchObject({
        message: 'Not authorized',
        statusCode: 403,
      });
    });

    // Error case - question not found
    it('should propagate 404 error for non-existent question', async () => {
      // Arrange
      req.params.id = 'non-existent-id';
      const error = new Error('Question not found');
      error.statusCode = 404;

      questionService.deleteQuestionService = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(deleteQuestion(req, res)).rejects.toThrow('Question not found');
    });
  });

  describe('upvoteQuestion', () => {
    // Success case
    it('should upvote a question successfully', async () => {
      // Arrange
      const mockDocument = {
        upvotes: ['user123'],
        downvotes: [],
        voteCount: 1,
      };

      req.params.id = '1';
      questionService.upvoteQuestionService = vi.fn().mockResolvedValue(mockDocument);

      // Act
      await upvoteQuestion(req, res);

      // Assert
      expect(questionService.upvoteQuestionService).toHaveBeenCalledWith('1', 'user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Question upvoted successfully',
        data: {
          upvotes: mockDocument.upvotes,
          downvotes: mockDocument.downvotes,
          voteCount: mockDocument.voteCount,
        },
      });
    });

    // Failure case - service error
    it('should propagate upvote errors', async () => {
      // Arrange
      req.params.id = '1';

      questionService.upvoteQuestionService = vi.fn().mockRejectedValue(
        new Error('Failed to upvote')
      );

      // Act & Assert
      await expect(upvoteQuestion(req, res)).rejects.toThrow('Failed to upvote');
    });
  });

  describe('downvoteQuestion', () => {
    // Success case
    it('should downvote a question successfully', async () => {
      // Arrange
      const mockDocument = {
        upvotes: [],
        downvotes: ['user123'],
        voteCount: -1,
      };

      req.params.id = '1';
      questionService.downvoteQuestionService = vi.fn().mockResolvedValue(mockDocument);

      // Act
      await downvoteQuestion(req, res);

      // Assert
      expect(questionService.downvoteQuestionService).toHaveBeenCalledWith('1', 'user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Question downvoted successfully',
        data: {
          upvotes: mockDocument.upvotes,
          downvotes: mockDocument.downvotes,
          voteCount: mockDocument.voteCount,
        },
      });
    });

    // Failure case - service error
    it('should propagate downvote errors', async () => {
      // Arrange
      req.params.id = '1';

      questionService.downvoteQuestionService = vi.fn().mockRejectedValue(
        new Error('Failed to downvote')
      );

      // Act & Assert
      await expect(downvoteQuestion(req, res)).rejects.toThrow('Failed to downvote');
    });
  });
});
