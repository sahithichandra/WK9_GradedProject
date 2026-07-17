import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import questionReducer, {
  fetchQuestions,
  fetchQuestionById,
  postQuestion,
  voteQuestion,
} from '../../src/reducers/questionSlice';

/**
 * Integration Tests: Question Flow with Redux + MSW
 * Verifies that question-related Redux actions work correctly with MSW-intercepted API calls.
 * No component rendering — pure Redux + API integration.
 */

const createTestStore = () => {
  return configureStore({
    reducer: {
      question: questionReducer,
      user: () => ({
        userInfo: { userId: 'user-1', token: 'mock-jwt-token-alice', name: 'Alice Johnson' },
        loading: false,
        error: null,
      }),
    },
  });
};

describe('Question Flow Integration Tests (Redux + MSW)', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Fetch Questions', () => {
    it('should fetch all questions successfully', async () => {
      const result = await store.dispatch(fetchQuestions());

      expect(fetchQuestions.fulfilled.match(result)).toBe(true);

      const state = store.getState().question;
      expect(state.loading).toBe(false);
      expect(Array.isArray(state.questions)).toBe(true);
      expect(state.questions.length).toBeGreaterThan(0);
      expect(state.error).toBeNull();
    });

    it('should have correct question data structure', async () => {
      await store.dispatch(fetchQuestions());

      const state = store.getState().question;
      const question = state.questions[0];

      expect(question).toHaveProperty('_id');
      expect(question).toHaveProperty('title');
      expect(question).toHaveProperty('description');
      expect(question).toHaveProperty('voteCount');
      expect(question).toHaveProperty('tags');
      expect(question).toHaveProperty('author');
    });

    it('should contain expected questions from mock data', async () => {
      await store.dispatch(fetchQuestions());

      const state = store.getState().question;
      const titles = state.questions.map((q) => q.title);

      expect(titles).toContain('How do I manage state in React?');
      expect(titles).toContain('What is the virtual DOM?');
    });
  });

  describe('Fetch Question By ID', () => {
    it('should fetch a specific question successfully', async () => {
      const result = await store.dispatch(fetchQuestionById('question-1'));

      expect(fetchQuestionById.fulfilled.match(result)).toBe(true);

      const state = store.getState().question;
      expect(state.loading).toBe(false);
      expect(state.currentQuestion).toBeDefined();
      expect(state.currentQuestion._id).toBe('question-1');
      expect(state.error).toBeNull();
    });

    it('should handle question not found', async () => {
      const result = await store.dispatch(fetchQuestionById('question-999'));

      expect(fetchQuestionById.rejected.match(result)).toBe(true);

      const state = store.getState().question;
      expect(state.error).toBeDefined();
    });
  });

  describe('Post Question', () => {
    it('should create a new question successfully', async () => {
      const newQuestionData = {
        title: 'How does async/await work in JavaScript?',
        description: 'I want to understand Promise-based async code.',
        tags: 'javascript',
      };

      const result = await store.dispatch(postQuestion(newQuestionData));

      expect(postQuestion.fulfilled.match(result)).toBe(true);

      const state = store.getState().question;
      const createdQuestion = state.questions.find(
        (q) => q.title === 'How does async/await work in JavaScript?'
      );
      expect(createdQuestion).toBeDefined();
      expect(state.currentQuestion.title).toBe('How does async/await work in JavaScript?');
      expect(state.loading).toBe(false);
    });

    it('should add new question to questions list', async () => {
      await store.dispatch(fetchQuestions());
      const initialCount = store.getState().question.questions.length;

      await store.dispatch(
        postQuestion({
          title: 'New Integration Test Question',
          description: 'Testing the post question thunk',
          tags: 'test',
        })
      );

      const state = store.getState().question;
      expect(state.questions.length).toBe(initialCount + 1);
    });
  });

  describe('Vote on Question', () => {
    beforeEach(async () => {
      await store.dispatch(fetchQuestions());
    });

    it('should upvote a question and update vote count in state', async () => {
      const state = store.getState().question;
      const question = state.questions[0];
      const initialVoteCount = question.voteCount;

      const result = await store.dispatch(
        voteQuestion({ question, voteType: 'upvote' })
      );

      expect(voteQuestion.fulfilled.match(result)).toBe(true);

      const updatedState = store.getState().question;
      const updatedQuestion = updatedState.questions.find((q) => q._id === question._id);
      expect(updatedQuestion.voteCount).toBe(initialVoteCount + 1);
    });

    it('should downvote a question and update vote count in state', async () => {
      const state = store.getState().question;
      const question = state.questions[0];
      const initialVoteCount = question.voteCount;

      const result = await store.dispatch(
        voteQuestion({ question, voteType: 'downvote' })
      );

      expect(voteQuestion.fulfilled.match(result)).toBe(true);

      const updatedState = store.getState().question;
      const updatedQuestion = updatedState.questions.find((q) => q._id === question._id);
      expect(updatedQuestion.voteCount).toBe(initialVoteCount - 1);
    });
  });
});
