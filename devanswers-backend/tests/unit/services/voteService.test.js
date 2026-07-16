import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleVote } from '../../../src/services/voteService.js';

// Helper to create mock arrays with a Mongoose-like .pull() method.
// Mongoose arrays expose .pull() to remove elements by value;
// plain JS arrays do not, so we add it manually for testing.
function createMockArray(...items) {
  const arr = [...items];
  arr.pull = function (val) {
    const idx = this.indexOf(val);
    if (idx > -1) this.splice(idx, 1);
  };
  return arr;
}

describe('voteService', () => {
  let MockModel;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleVote - upvote', () => {
    // Success case - first upvote
    it('should add an upvote to a document', async () => {
      // Arrange
      const mockDocument = {
        _id: 'doc123',
        upvotes: createMockArray(),
        downvotes: createMockArray(),
        voteCount: 0,
        save: vi.fn().mockResolvedValue(true),
      };

      MockModel = { findById: vi.fn().mockResolvedValue(mockDocument) };

      // Act
      const result = await handleVote(MockModel, 'doc123', 'user123', 'upvote');

      // Assert
      expect(MockModel.findById).toHaveBeenCalledWith('doc123');
      expect(mockDocument.upvotes).toContain('user123');
      expect(mockDocument.voteCount).toBe(1);
      expect(mockDocument.save).toHaveBeenCalled();
    });

    // Edge case - user already upvoted
    it('should not duplicate upvote if user already upvoted', async () => {
      // Arrange
      const mockDocument = {
        _id: 'doc123',
        upvotes: createMockArray('user123'),
        downvotes: createMockArray(),
        voteCount: 1,
        save: vi.fn().mockResolvedValue(true),
      };

      MockModel = { findById: vi.fn().mockResolvedValue(mockDocument) };

      // Act
      const result = await handleVote(MockModel, 'doc123', 'user123', 'upvote');

      // Assert
      expect(mockDocument.save).not.toHaveBeenCalled();
      expect(result.voteCount).toBe(1);
    });

    // Edge case - switching from downvote to upvote
    it('should switch from downvote to upvote', async () => {
      // Arrange
      const mockDocument = {
        _id: 'doc123',
        upvotes: createMockArray(),
        downvotes: createMockArray('user123'),
        voteCount: -1,
        save: vi.fn().mockResolvedValue(true),
      };

      MockModel = { findById: vi.fn().mockResolvedValue(mockDocument) };

      // Act
      const result = await handleVote(MockModel, 'doc123', 'user123', 'upvote');

      // Assert
      expect(mockDocument.upvotes).toContain('user123');
      expect(mockDocument.downvotes).not.toContain('user123');
      expect(mockDocument.voteCount).toBe(1);
    });
  });

  describe('handleVote - downvote', () => {
    // Success case - first downvote
    it('should add a downvote to a document', async () => {
      // Arrange
      const mockDocument = {
        _id: 'doc123',
        upvotes: createMockArray(),
        downvotes: createMockArray(),
        voteCount: 0,
        save: vi.fn().mockResolvedValue(true),
      };

      MockModel = { findById: vi.fn().mockResolvedValue(mockDocument) };

      // Act
      const result = await handleVote(MockModel, 'doc123', 'user123', 'downvote');

      // Assert
      expect(mockDocument.downvotes).toContain('user123');
      expect(mockDocument.voteCount).toBe(-1);
      expect(mockDocument.save).toHaveBeenCalled();
    });

    // Edge case - user already downvoted
    it('should not duplicate downvote if user already downvoted', async () => {
      // Arrange
      const mockDocument = {
        _id: 'doc123',
        upvotes: createMockArray(),
        downvotes: createMockArray('user123'),
        voteCount: -1,
        save: vi.fn().mockResolvedValue(true),
      };

      MockModel = { findById: vi.fn().mockResolvedValue(mockDocument) };

      // Act
      const result = await handleVote(MockModel, 'doc123', 'user123', 'downvote');

      // Assert
      expect(mockDocument.save).not.toHaveBeenCalled();
      expect(result.voteCount).toBe(-1);
    });

    // Edge case - switching from upvote to downvote
    it('should switch from upvote to downvote', async () => {
      // Arrange
      const mockDocument = {
        _id: 'doc123',
        upvotes: createMockArray('user123'),
        downvotes: createMockArray(),
        voteCount: 1,
        save: vi.fn().mockResolvedValue(true),
      };

      MockModel = { findById: vi.fn().mockResolvedValue(mockDocument) };

      // Act
      const result = await handleVote(MockModel, 'doc123', 'user123', 'downvote');

      // Assert
      expect(mockDocument.downvotes).toContain('user123');
      expect(mockDocument.upvotes).not.toContain('user123');
      expect(mockDocument.voteCount).toBe(-1);
    });
  });

  describe('handleVote - edge cases', () => {
    // Error case - document not found
    it('should throw error if document not found', async () => {
      // Arrange
      MockModel = { findById: vi.fn().mockResolvedValue(null) };

      // Act & Assert
      await expect(
        handleVote(MockModel, 'nonexistent', 'user123', 'upvote')
      ).rejects.toThrow('Document not found');
    });

    // Edge case - multiple users voting
    it('should handle multiple users voting', async () => {
      // Arrange
      const mockDocument = {
        _id: 'doc123',
        upvotes: createMockArray('user1'),
        downvotes: createMockArray(),
        voteCount: 1,
        save: vi.fn().mockResolvedValue(true),
      };

      MockModel = { findById: vi.fn().mockResolvedValue(mockDocument) };

      // Act
      await handleVote(MockModel, 'doc123', 'user2', 'upvote');

      // Assert
      expect(mockDocument.upvotes).toContain('user1');
      expect(mockDocument.upvotes).toContain('user2');
      expect(mockDocument.voteCount).toBe(2);
    });

    // Failure case - database error
    it('should propagate database errors', async () => {
      // Arrange
      MockModel = { findById: vi.fn().mockRejectedValue(new Error('Database error')) };

      // Act & Assert
      await expect(
        handleVote(MockModel, 'doc123', 'user123', 'upvote')
      ).rejects.toThrow('Database error');
    });

    // Edge case - vote count calculation with mixed votes
    it('should calculate vote count correctly with mixed votes', async () => {
      // Arrange
      const mockDocument = {
        _id: 'doc123',
        upvotes: createMockArray('user1', 'user2'),
        downvotes: createMockArray(),
        voteCount: 2,
        save: vi.fn().mockResolvedValue(true),
      };

      MockModel = { findById: vi.fn().mockResolvedValue(mockDocument) };

      // Act
      await handleVote(MockModel, 'doc123', 'user3', 'downvote');

      // Assert
      expect(mockDocument.upvotes).toHaveLength(2);
      expect(mockDocument.downvotes).toHaveLength(1);
      expect(mockDocument.voteCount).toBe(1); // 2 upvotes - 1 downvote
    });
  });
});
