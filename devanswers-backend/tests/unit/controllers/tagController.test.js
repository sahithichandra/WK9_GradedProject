import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAllTags, getQuestionsByTag } from '../../../src/controllers/tagController.js';
import Tag from '../../../src/models/Tag.js';
import Question from '../../../src/models/Question.js';
import Answer from '../../../src/models/Answer.js';

// Mock the models
vi.mock('../../../src/models/Tag.js');
vi.mock('../../../src/models/Question.js');
vi.mock('../../../src/models/Answer.js');

describe('tagController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      params: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getAllTags', () => {
    // Success case
    it('should return all tags with question count', async () => {
      // Arrange
      const mockTags = [
        { _id: 'tag1', name: 'javascript', toObject: vi.fn().mockReturnValue({ _id: 'tag1', name: 'javascript' }) },
        { _id: 'tag2', name: 'nodejs', toObject: vi.fn().mockReturnValue({ _id: 'tag2', name: 'nodejs' }) },
      ];

      Tag.find = vi.fn().mockResolvedValue(mockTags);
      Question.countDocuments = vi.fn().mockResolvedValue(3);

      // Act
      await getAllTags(req, res);

      // Assert
      expect(Tag.find).toHaveBeenCalledWith({});
      expect(Question.countDocuments).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tags fetched successfully',
        data: expect.arrayContaining([
          expect.objectContaining({ questionCount: 3 }),
        ]),
      });
    });

    // Edge case - no tags exist
    it('should return empty array when no tags exist', async () => {
      // Arrange
      Tag.find = vi.fn().mockResolvedValue([]);

      // Act
      await getAllTags(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tags fetched successfully',
        data: [],
      });
    });

    // Failure case - database error
    it('should propagate database errors', async () => {
      // Arrange
      Tag.find = vi.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(getAllTags(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('getQuestionsByTag', () => {
    // Success case
    it('should return questions for a valid tag with answer count', async () => {
      // Arrange
      req.params.tagId = 'tag123';

      const mockTag = { _id: 'tag123', name: 'javascript' };
      const mockQuestions = [
        {
          _id: 'q1',
          title: 'Question 1',
          toObject: vi.fn().mockReturnValue({ _id: 'q1', title: 'Question 1' }),
        },
        {
          _id: 'q2',
          title: 'Question 2',
          toObject: vi.fn().mockReturnValue({ _id: 'q2', title: 'Question 2' }),
        },
      ];

      Tag.findById = vi.fn().mockResolvedValue(mockTag);
      Question.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            sort: vi.fn().mockResolvedValue(mockQuestions),
          }),
        }),
      });
      Answer.countDocuments = vi.fn().mockResolvedValue(2);

      // Act
      await getQuestionsByTag(req, res);

      // Assert
      expect(Tag.findById).toHaveBeenCalledWith('tag123');
      expect(Question.find).toHaveBeenCalledWith({ tags: 'tag123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Questions fetched successfully',
        data: expect.arrayContaining([
          expect.objectContaining({ answerCount: 2 }),
        ]),
      });
    });

    // Error case - tag not found
    it('should throw 404 error when tag is not found', async () => {
      // Arrange
      req.params.tagId = 'nonexistent';

      Tag.findById = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(getQuestionsByTag(req, res)).rejects.toThrow('Tag not found');
      await expect(getQuestionsByTag(req, res)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    // Edge case - tag exists but has no questions
    it('should return empty data when tag has no questions', async () => {
      // Arrange
      req.params.tagId = 'tag123';

      Tag.findById = vi.fn().mockResolvedValue({ _id: 'tag123', name: 'unused-tag' });
      Question.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            sort: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Act
      await getQuestionsByTag(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Questions fetched successfully',
        data: [],
      });
    });

    // Failure case - database error
    it('should propagate database errors', async () => {
      // Arrange
      req.params.tagId = 'tag123';

      Tag.findById = vi.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(getQuestionsByTag(req, res)).rejects.toThrow('Database error');
    });
  });
});
