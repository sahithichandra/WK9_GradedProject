import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as tagService from '../../src/services/tagService';

describe('Tag Flow Integration Tests (tagService + MSW)', () => {
  describe('Fetch All Tags', () => {
    it('should fetch all tags successfully', async () => {
      const tags = await tagService.getAllTags();

      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
    });

    it('should have correct tag data structure', async () => {
      const tags = await tagService.getAllTags();
      const tag = tags[0];

      expect(tag).toHaveProperty('_id');
      expect(tag).toHaveProperty('name');
      expect(tag).toHaveProperty('questionCount');
    });

    it('should return expected tags from mock data', async () => {
      const tags = await tagService.getAllTags();
      const tagNames = tags.map((t) => t.name);

      expect(tagNames).toContain('javascript');
      expect(tagNames).toContain('react');
      expect(tagNames).toContain('css');
    });

    it('should return numeric questionCount for each tag', async () => {
      const tags = await tagService.getAllTags();

      tags.forEach((tag) => {
        expect(typeof tag.questionCount).toBe('number');
        expect(tag.questionCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Fetch Questions By Tag', () => {
    it('should fetch questions for a valid tag', async () => {
      const questions = await tagService.getQuestionsByTag('tag-1');

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should return questions that include the requested tag', async () => {
      const questions = await tagService.getQuestionsByTag('tag-2');

      questions.forEach((q) => {
        const tagIds = q.tags.map((t) => t._id);
        expect(tagIds).toContain('tag-2');
      });
    });

    it('should return an empty array for a tag with no questions', async () => {
      const questions = await tagService.getQuestionsByTag('tag-non-existent');

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(0);
    });
  });
});
