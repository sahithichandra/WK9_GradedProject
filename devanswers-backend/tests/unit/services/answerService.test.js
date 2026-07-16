import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAnswersByQuestionIdService,
  createAnswerService,
  updateAnswerService,
  deleteAnswerService,
  upvoteAnswerService,
  downvoteAnswerService,
} from '../../../src/services/answerService.js';
import Answer from '../../../src/models/Answer.js';
import { handleVote } from '../../../src/services/voteService.js';

// Mock the Answer model and voteService
vi.mock('../../../src/models/Answer.js');
vi.mock('../../../src/services/voteService.js');

describe('answerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAnswersByQuestionIdService', () => {
    // Success case
    it('should return all answers for a question with populated author', async () => {
      // Arrange
      const mockAnswers = [
        { _id: 'answer1', answerText: 'Answer 1', author: { name: 'User 1' } },
        { _id: 'answer2', answerText: 'Answer 2', author: { name: 'User 2' } },
      ];

      Answer.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockAnswers),
      });

      // Act
      const result = await getAnswersByQuestionIdService('question123');

      // Assert
      expect(Answer.find).toHaveBeenCalledWith({ questionId: 'question123' });
      expect(result).toEqual(mockAnswers);
      expect(result).toHaveLength(2);
    });

    // Edge case - populate with author name
    it('should populate author field with name only', async () => {
      // Arrange
      const populateSpy = vi.fn().mockResolvedValue([{ _id: 'a1' }]);

      Answer.find = vi.fn().mockReturnValue({
        populate: populateSpy,
      });

      // Act
      await getAnswersByQuestionIdService('question123');

      // Assert
      expect(populateSpy).toHaveBeenCalledWith('author', 'name');
    });

    // Error case - no answers found
    it('should throw 404 error when no answers exist', async () => {
      // Arrange
      Answer.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue([]),
      });

      // Act & Assert
      await expect(
        getAnswersByQuestionIdService('question123')
      ).rejects.toThrow('No answers found for this question');
      await expect(
        getAnswersByQuestionIdService('question123')
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    // Failure case - database error
    it('should propagate database errors', async () => {
      // Arrange
      Answer.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockRejectedValue(new Error('Database error')),
      });

      // Act & Assert
      await expect(
        getAnswersByQuestionIdService('question123')
      ).rejects.toThrow('Database error');
    });
  });

  describe('createAnswerService', () => {
    // Success case
    it('should create and return populated answer', async () => {
      // Arrange
      const answerData = {
        questionId: 'question123',
        answerText: 'This is my answer',
        author: 'user123',
      };

      const mockNewAnswer = {
        _id: 'answer123',
        ...answerData,
        save: vi.fn().mockResolvedValue(true),
      };

      const mockPopulatedAnswer = {
        _id: 'answer123',
        ...answerData,
        author: { _id: 'user123', name: 'Test User' },
      };

      Answer.mockImplementation(() => mockNewAnswer);

      Answer.findById = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockPopulatedAnswer),
      });

      // Act
      const result = await createAnswerService(answerData);

      // Assert
      expect(mockNewAnswer.save).toHaveBeenCalled();
      expect(Answer.findById).toHaveBeenCalledWith('answer123');
      expect(result).toEqual(mockPopulatedAnswer);
      expect(result.author).toHaveProperty('name');
    });

    // Error case - populate fails
    it('should throw 500 error if populated answer is not found', async () => {
      // Arrange
      const mockNewAnswer = {
        _id: 'answer123',
        save: vi.fn().mockResolvedValue(true),
      };

      Answer.mockImplementation(() => mockNewAnswer);

      Answer.findById = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      });

      // Act & Assert
      await expect(
        createAnswerService({ questionId: 'q123', answerText: 'Test', author: 'u123' })
      ).rejects.toThrow('Failed to populate answer after saving');
      await expect(
        createAnswerService({ questionId: 'q123', answerText: 'Test', author: 'u123' })
      ).rejects.toMatchObject({ statusCode: 500 });
    });

    // Failure case - database error during save
    it('should propagate database errors during creation', async () => {
      // Arrange
      const mockNewAnswer = {
        _id: 'answer123',
        save: vi.fn().mockRejectedValue(new Error('Save failed')),
      };

      Answer.mockImplementation(() => mockNewAnswer);

      // Act & Assert
      await expect(
        createAnswerService({ questionId: 'q123', answerText: 'Test', author: 'u123' })
      ).rejects.toThrow('Save failed');
    });
  });

  describe('updateAnswerService', () => {
    // Success case
    it('should update and return answer', async () => {
      // Arrange
      const loggedInUser = { id: 'user123', isAdmin: false };
      const mockAnswer = {
        _id: 'answer123',
        answerText: 'Old text',
        author: { toString: () => 'user123' },
        save: vi.fn().mockResolvedValue(true),
      };
      const mockPopulatedAnswer = {
        _id: 'answer123',
        answerText: 'Updated text',
        author: { _id: 'user123', name: 'Test User' },
      };

      Answer.findById = vi.fn()
        .mockResolvedValueOnce(mockAnswer)
        .mockReturnValueOnce({
          populate: vi.fn().mockResolvedValue(mockPopulatedAnswer),
        });

      // Act
      const result = await updateAnswerService('answer123', 'Updated text', loggedInUser);

      // Assert
      expect(Answer.findById).toHaveBeenCalledWith('answer123');
      expect(mockAnswer.save).toHaveBeenCalled();
      expect(result).toEqual(mockPopulatedAnswer);
    });

    // Error case - answer not found
    it('should throw 404 if answer not found during update', async () => {
      // Arrange
      const loggedInUser = { id: 'user123', isAdmin: false };
      Answer.findById = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        updateAnswerService('nonexistent', 'Updated text', loggedInUser)
      ).rejects.toThrow('Answer not found');
      await expect(
        updateAnswerService('nonexistent', 'Updated text', loggedInUser)
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    // Authorization case - not author or admin
    it('should throw 403 if user is not the author or admin', async () => {
      // Arrange
      const loggedInUser = { id: 'otherUser', isAdmin: false };
      const mockAnswer = {
        _id: 'answer123',
        author: { toString: () => 'user123' },
        answerText: 'Original text',
        save: vi.fn(),
      };
      Answer.findById = vi.fn().mockResolvedValue(mockAnswer);

      // Act & Assert
      await expect(
        updateAnswerService('answer123', 'Hacked text', loggedInUser)
      ).rejects.toThrow('Not authorized to update this answer');
      await expect(
        updateAnswerService('answer123', 'Hacked text', loggedInUser)
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('deleteAnswerService', () => {
    // Success case
    it('should delete answer successfully', async () => {
      // Arrange
      const loggedInUser = { id: 'user123', isAdmin: false };
      const mockAnswer = {
        _id: 'answer123',
        answerText: 'Deleted answer',
        author: { toString: () => 'user123' },
      };

      Answer.findById = vi.fn().mockResolvedValue(mockAnswer);
      Answer.findByIdAndDelete = vi.fn().mockResolvedValue(mockAnswer);

      // Act
      await deleteAnswerService('answer123', loggedInUser);

      // Assert
      expect(Answer.findById).toHaveBeenCalledWith('answer123');
      expect(Answer.findByIdAndDelete).toHaveBeenCalledWith('answer123');
    });

    // Error case - answer not found
    it('should throw 404 if answer not found during delete', async () => {
      // Arrange
      const loggedInUser = { id: 'user123', isAdmin: false };
      Answer.findById = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        deleteAnswerService('nonexistent', loggedInUser)
      ).rejects.toThrow('Answer not found');
      await expect(
        deleteAnswerService('nonexistent', loggedInUser)
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    // Authorization case - not author or admin
    it('should throw 403 if user is not the author or admin', async () => {
      // Arrange
      const loggedInUser = { id: 'otherUser', isAdmin: false };
      const mockAnswer = {
        _id: 'answer123',
        author: { toString: () => 'user123' },
        answerText: 'Original text',
      };
      Answer.findById = vi.fn().mockResolvedValue(mockAnswer);

      // Act & Assert
      await expect(
        deleteAnswerService('answer123', loggedInUser)
      ).rejects.toThrow('Not authorized to delete this answer');
      await expect(
        deleteAnswerService('answer123', loggedInUser)
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('upvoteAnswerService', () => {
    // Success case
    it('should call handleVote with correct parameters', async () => {
      // Arrange
      const mockDocument = {
        _id: 'answer123',
        upvotes: ['user123'],
        downvotes: [],
        voteCount: 1,
      };
      handleVote.mockResolvedValue(mockDocument);

      // Act
      const result = await upvoteAnswerService('answer123', 'user123');

      // Assert
      expect(handleVote).toHaveBeenCalledWith(Answer, 'answer123', 'user123', 'upvote');
      expect(result).toEqual(mockDocument);
    });

    // Error case - handleVote returns null
    it('should throw error when handleVote returns null', async () => {
      // Arrange
      handleVote.mockResolvedValue(null);

      // Act & Assert
      await expect(
        upvoteAnswerService('answer123', 'user123')
      ).rejects.toThrow('Failed to upvote answer');
    });
  });

  describe('downvoteAnswerService', () => {
    // Success case
    it('should call handleVote with correct parameters', async () => {
      // Arrange
      const mockDocument = {
        _id: 'answer123',
        upvotes: [],
        downvotes: ['user123'],
        voteCount: -1,
      };
      handleVote.mockResolvedValue(mockDocument);

      // Act
      const result = await downvoteAnswerService('answer123', 'user123');

      // Assert
      expect(handleVote).toHaveBeenCalledWith(Answer, 'answer123', 'user123', 'downvote');
      expect(result).toEqual(mockDocument);
    });

    // Error case - handleVote returns null
    it('should throw error when handleVote returns null', async () => {
      // Arrange
      handleVote.mockResolvedValue(null);

      // Act & Assert
      await expect(
        downvoteAnswerService('answer123', 'user123')
      ).rejects.toThrow('Failed to downvote answer');
    });
  });
});
