import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllQuestionsService,
  getQuestionByIdService,
  createQuestionService,
  updateQuestionService,
  deleteQuestionService,
  upvoteQuestionService,
  downvoteQuestionService,
} from '../../../src/services/questionService.js';
import Question from '../../../src/models/Question.js';
import Answer from '../../../src/models/Answer.js';
import Tag from '../../../src/models/Tag.js';
import { handleVote } from '../../../src/services/voteService.js';

// Mock the models and services
// Mock voteService since questionService delegates vote logic to it
vi.mock('../../../src/models/Question.js');
vi.mock('../../../src/models/Answer.js');
vi.mock('../../../src/models/Tag.js');
vi.mock('../../../src/services/voteService.js');

describe('questionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllQuestionsService', () => {
    // Success case
    it('should return all questions with populated fields', async () => {
      // Arrange
      const mockQuestions = [
        {
          _id: 'question1',
          title: 'Question 1',
          author: { _id: 'user1', name: 'User 1' },
          tags: [{ _id: 'tag1', name: 'javascript' }],
        },
      ];

      Question.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            sort: vi.fn().mockResolvedValue(mockQuestions),
          }),
        }),
      });
      Answer.countDocuments = vi.fn().mockResolvedValue(3);

      // Act
      const result = await getAllQuestionsService();

      // Assert
      expect(Question.find).toHaveBeenCalledWith({});
      expect(result).toEqual([{ ...mockQuestions[0], answerCount: 3 }]);
      expect(result).toHaveLength(1);
    });

    // Edge case - sorted by createdAt
    it('should sort questions by createdAt descending', async () => {
      // Arrange
      const sortSpy = vi.fn().mockResolvedValue([{ _id: 'q1' }]);

      Question.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            sort: sortSpy,
          }),
        }),
      });
      Answer.countDocuments = vi.fn().mockResolvedValue(0);

      // Act
      await getAllQuestionsService();

      // Assert
      expect(sortSpy).toHaveBeenCalledWith({ createdAt: -1 });
    });

    // Error case - no questions found
    it('should throw 404 error when no questions exist', async () => {
      // Arrange
      Question.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            sort: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Act & Assert
      await expect(getAllQuestionsService()).rejects.toThrow('No questions found');
      await expect(getAllQuestionsService()).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    // Error case - null result
    it('should throw 404 error when result is null', async () => {
      // Arrange
      Question.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            sort: vi.fn().mockResolvedValue(null),
          }),
        }),
      });

      // Act & Assert
      await expect(getAllQuestionsService()).rejects.toThrow('No questions found');
    });
  });

  describe('getQuestionByIdService', () => {
    // Success case
    it('should return question by id with populated fields and answers', async () => {
      // Arrange
      const mockQuestion = {
        _id: 'question123',
        title: 'Test Question',
        views: 0,
        save: vi.fn().mockResolvedValue(true),
      };

      const mockPopulatedQuestion = {
        _id: 'question123',
        title: 'Test Question',
        author: { _id: 'user1', name: 'User 1' },
        tags: [{ _id: 'tag1', name: 'javascript' }],
        views: 1,
        toObject: vi.fn().mockReturnValue({
          _id: 'question123',
          title: 'Test Question',
          author: { _id: 'user1', name: 'User 1' },
          views: 1,
        }),
      };

      const mockAnswers = [
        { _id: 'answer1', answerText: 'Test Answer' },
      ];

      Question.findById = vi.fn()
        .mockResolvedValueOnce(mockQuestion)
        .mockReturnValueOnce({
          populate: vi.fn().mockReturnValue({
            populate: vi.fn().mockResolvedValue(mockPopulatedQuestion),
          }),
        });

      Answer.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockAnswers),
      });

      // Act
      const result = await getQuestionByIdService('question123');

      // Assert
      expect(Question.findById).toHaveBeenCalledWith('question123');
      expect(mockQuestion.save).toHaveBeenCalled();
      expect(result.answers).toEqual(mockAnswers);
    });

    // Edge case - view increment
    it('should increment views count', async () => {
      // Arrange
      const mockQuestion = {
        _id: 'question123',
        views: 5,
        save: vi.fn().mockResolvedValue(true),
      };

      const mockPopulated = {
        _id: 'question123',
        views: 6,
        toObject: vi.fn().mockReturnValue({ _id: 'question123', views: 6 }),
      };

      Question.findById = vi.fn()
        .mockResolvedValueOnce(mockQuestion)
        .mockReturnValueOnce({
          populate: vi.fn().mockReturnValue({
            populate: vi.fn().mockResolvedValue(mockPopulated),
          }),
        });

      Answer.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue([]),
      });

      // Act
      await getQuestionByIdService('question123');

      // Assert
      expect(mockQuestion.views).toBe(6);
      expect(mockQuestion.save).toHaveBeenCalled();
    });

    // Error case - question not found
    it('should throw 404 error if question not found', async () => {
      // Arrange
      Question.findById = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(getQuestionByIdService('nonexistent')).rejects.toThrow('Question not found');
      await expect(getQuestionByIdService('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    // Error case - question disappears after view increment
    it('should throw 404 error if question not found after view increment', async () => {
      // Arrange
      const mockQuestion = {
        _id: 'question123',
        views: 0,
        save: vi.fn().mockResolvedValue(true),
      };

      Question.findById = vi.fn()
        .mockResolvedValueOnce(mockQuestion)
        .mockReturnValueOnce({
          populate: vi.fn().mockReturnValue({
            populate: vi.fn().mockResolvedValue(null),
          }),
        });

      // Act & Assert
      await expect(getQuestionByIdService('question123')).rejects.toMatchObject({
        message: 'Question not found after view increment',
        statusCode: 404,
      });
    });

    // Failure case - database error
    it('should propagate database errors', async () => {
      // Arrange
      Question.findById = vi.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(getQuestionByIdService('question123')).rejects.toThrow('Database error');
    });
  });

  describe('createQuestionService', () => {
    // Success case
    it('should create and return a new question with tags', async () => {
      // Arrange
      Tag.findOne = vi.fn().mockResolvedValue(null);

      const mockTagInstance = {
        _id: 'tag123',
        save: vi.fn().mockResolvedValue(true),
      };
      Tag.mockImplementation(() => mockTagInstance);

      const mockQuestionInstance = {
        _id: 'question123',
        title: 'New Question',
        description: 'Question description',
        tags: ['tag123', 'tag123'],
        author: 'user123',
        save: vi.fn().mockResolvedValue(true),
      };
      Question.mockImplementation(() => mockQuestionInstance);

      // Act
      const result = await createQuestionService({
        title: 'New Question',
        description: 'Question description',
        tags: 'javascript, nodejs',
        author: 'user123',
      });

      // Assert
      expect(mockQuestionInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockQuestionInstance);
    });

    // Edge case - reuse existing tags
    it('should reuse existing tags', async () => {
      // Arrange
      const existingTag = { _id: 'existingTag123', name: 'javascript' };
      Tag.findOne = vi.fn()
        .mockResolvedValueOnce(existingTag)
        .mockResolvedValueOnce(null);

      const mockNewTag = {
        _id: 'newTag123',
        save: vi.fn().mockResolvedValue(true),
      };
      Tag.mockImplementation(() => mockNewTag);

      const mockQuestion = {
        _id: 'question123',
        tags: ['existingTag123', 'newTag123'],
        save: vi.fn().mockResolvedValue(true),
      };
      Question.mockImplementation(() => mockQuestion);

      // Act
      await createQuestionService({
        title: 'Test',
        description: 'Test',
        tags: 'javascript, new-tag',
        author: 'user123',
      });

      // Assert
      expect(Tag.findOne).toHaveBeenCalledTimes(2);
      expect(mockNewTag.save).toHaveBeenCalled();
    });

    // Edge case - trim whitespace from tags
    it('should handle tags with extra whitespace', async () => {
      // Arrange
      Tag.findOne = vi.fn().mockResolvedValue(null);
      Tag.mockImplementation(() => ({
        _id: 'tag123',
        save: vi.fn().mockResolvedValue(true),
      }));

      Question.mockImplementation(() => ({
        _id: 'q123',
        save: vi.fn().mockResolvedValue(true),
      }));

      // Act
      await createQuestionService({
        title: 'Test',
        description: 'Test',
        tags: '  javascript  ,  nodejs  ',
        author: 'user123',
      });

      // Assert
      expect(Tag.findOne).toHaveBeenCalledWith({ name: 'javascript' });
      expect(Tag.findOne).toHaveBeenCalledWith({ name: 'nodejs' });
    });
  });

  describe('updateQuestionService', () => {
    // Success case
    it('should update and return question', async () => {
      // Arrange
      const loggedInUser = { id: 'user123', isAdmin: false };
      const mockExistingQuestion = {
        _id: 'question123',
        author: { toString: () => 'user123' },
      };
      const mockUpdatedQuestion = {
        _id: 'question123',
        title: 'Updated Title',
        description: 'Updated Description',
        tags: ['tag1', 'tag2'],
      };

      Tag.findOne = vi.fn().mockResolvedValue(null);
      Tag.mockImplementation(() => ({
        _id: 'tag123',
        save: vi.fn().mockResolvedValue(true),
      }));

      Question.findById = vi.fn().mockResolvedValue(mockExistingQuestion);
      Question.findByIdAndUpdate = vi.fn().mockResolvedValue(mockUpdatedQuestion);

      // Act
      const result = await updateQuestionService(
        'question123',
        'Updated Title',
        'Updated Description',
        'tag1, tag2',
        loggedInUser
      );

      // Assert
      expect(Question.findById).toHaveBeenCalledWith('question123');
      expect(Question.findByIdAndUpdate).toHaveBeenCalledWith(
        'question123',
        expect.objectContaining({ title: 'Updated Title', description: 'Updated Description' }),
        { new: true }
      );
      expect(result).toEqual(mockUpdatedQuestion);
    });

    // Error case - question not found
    it('should throw 404 if question not found during update', async () => {
      // Arrange
      const loggedInUser = { id: 'user123', isAdmin: false };
      Tag.findOne = vi.fn().mockResolvedValue(null);
      Tag.mockImplementation(() => ({
        _id: 'tag123',
        save: vi.fn().mockResolvedValue(true),
      }));
      Question.findById = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        updateQuestionService('nonexistent', 'Title', 'Description', 'tag', loggedInUser)
      ).rejects.toThrow('Question not found');
      await expect(
        updateQuestionService('nonexistent', 'Title', 'Description', 'tag', loggedInUser)
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    // Authorization case - not author or admin
    it('should throw 403 if user is not the author or admin', async () => {
      // Arrange
      const loggedInUser = { id: 'otherUser', isAdmin: false };
      const mockQuestion = {
        _id: 'question123',
        author: { toString: () => 'user123' },
      };
      Question.findById = vi.fn().mockResolvedValue(mockQuestion);

      // Act & Assert
      await expect(
        updateQuestionService('question123', 'Hacked', 'Hacked', 'tag', loggedInUser)
      ).rejects.toThrow('Not authorized to update this question');
      await expect(
        updateQuestionService('question123', 'Hacked', 'Hacked', 'tag', loggedInUser)
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('deleteQuestionService', () => {
    // Success case - author deletes
    it('should delete question when user is the author', async () => {
      // Arrange
      const mockQuestion = {
        _id: 'question123',
        author: { toString: () => 'user123' },
        title: 'Test Question',
      };

      Question.findById = vi.fn().mockResolvedValue(mockQuestion);
      Question.findByIdAndDelete = vi.fn().mockResolvedValue(mockQuestion);
      Answer.deleteMany = vi.fn().mockResolvedValue({ deletedCount: 2 });

      const loggedInUser = { id: 'user123', isAdmin: false };

      // Act
      const result = await deleteQuestionService('question123', loggedInUser);

      // Assert
      expect(Question.findByIdAndDelete).toHaveBeenCalledWith('question123');
      expect(Answer.deleteMany).toHaveBeenCalledWith({ questionId: 'question123' });
      expect(result).toEqual(mockQuestion);
    });

    // Success case - admin deletes
    it('should delete question when user is an admin', async () => {
      // Arrange
      const mockQuestion = {
        _id: 'question123',
        author: { toString: () => 'author456' },
      };

      Question.findById = vi.fn().mockResolvedValue(mockQuestion);
      Question.findByIdAndDelete = vi.fn().mockResolvedValue(mockQuestion);
      Answer.deleteMany = vi.fn().mockResolvedValue({});

      const loggedInUser = { id: 'admin789', isAdmin: true };

      // Act
      const result = await deleteQuestionService('question123', loggedInUser);

      // Assert
      expect(Question.findByIdAndDelete).toHaveBeenCalledWith('question123');
      expect(result).toEqual(mockQuestion);
    });

    // Error case - not authorized
    it('should throw 403 error when user is not authorized', async () => {
      // Arrange
      const mockQuestion = {
        _id: 'question123',
        author: { toString: () => 'author456' },
      };

      Question.findById = vi.fn().mockResolvedValue(mockQuestion);

      const loggedInUser = { id: 'otherUser789', isAdmin: false };

      // Act & Assert
      await expect(
        deleteQuestionService('question123', loggedInUser)
      ).rejects.toThrow('Not authorized to delete this question');
      await expect(
        deleteQuestionService('question123', loggedInUser)
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    // Error case - question not found
    it('should throw 404 error for non-existent question', async () => {
      // Arrange
      Question.findById = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        deleteQuestionService('nonexistent', { id: 'user123', isAdmin: false })
      ).rejects.toThrow('Question not found');
      await expect(
        deleteQuestionService('nonexistent', { id: 'user123', isAdmin: false })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    // Edge case - deletes related answers
    it('should delete related answers when deleting a question', async () => {
      // Arrange
      const mockQuestion = {
        _id: 'question123',
        author: { toString: () => 'user123' },
      };

      Question.findById = vi.fn().mockResolvedValue(mockQuestion);
      Question.findByIdAndDelete = vi.fn().mockResolvedValue(mockQuestion);
      Answer.deleteMany = vi.fn().mockResolvedValue({ deletedCount: 3 });

      // Act
      await deleteQuestionService('question123', { id: 'user123', isAdmin: false });

      // Assert
      expect(Answer.deleteMany).toHaveBeenCalledWith({ questionId: 'question123' });
    });
  });

  describe('upvoteQuestionService', () => {
    // Success case
    it('should call handleVote with correct parameters', async () => {
      // Arrange
      const mockDocument = {
        upvotes: ['user123'],
        downvotes: [],
        voteCount: 1,
      };
      handleVote.mockResolvedValue(mockDocument);

      // Act
      const result = await upvoteQuestionService('questionId', 'user123');

      // Assert
      expect(handleVote).toHaveBeenCalledWith(Question, 'questionId', 'user123', 'upvote');
      expect(result).toEqual(mockDocument);
    });

    // Error case - handleVote returns null
    it('should throw error when handleVote returns null', async () => {
      // Arrange
      handleVote.mockResolvedValue(null);

      // Act & Assert
      await expect(
        upvoteQuestionService('questionId', 'user123')
      ).rejects.toThrow('Failed to upvote question');
    });
  });

  describe('downvoteQuestionService', () => {
    // Success case
    it('should call handleVote with correct parameters', async () => {
      // Arrange
      const mockDocument = {
        upvotes: [],
        downvotes: ['user123'],
        voteCount: -1,
      };
      handleVote.mockResolvedValue(mockDocument);

      // Act
      const result = await downvoteQuestionService('questionId', 'user123');

      // Assert
      expect(handleVote).toHaveBeenCalledWith(Question, 'questionId', 'user123', 'downvote');
      expect(result).toEqual(mockDocument);
    });

    // Error case - handleVote returns null
    it('should throw error when handleVote returns null', async () => {
      // Arrange
      handleVote.mockResolvedValue(null);

      // Act & Assert
      await expect(
        downvoteQuestionService('questionId', 'user123')
      ).rejects.toThrow('Failed to downvote question');
    });
  });
});
