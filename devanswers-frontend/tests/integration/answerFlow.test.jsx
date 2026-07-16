import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import questionReducer, {
  fetchQuestionById,
  postAnswer,
  voteAnswer,
} from '../../src/reducers/questionSlice';

/**
 * Integration Tests: Answer Flow with Redux + MSW
 * Verifies that answer-related Redux actions work correctly with MSW-intercepted API calls.
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

describe('Answer Flow Integration Tests (Redux + MSW)', () => {
  let store;

  beforeEach(async () => {
    store = createTestStore();
    // Load question-1 which has existing mock answers
    await store.dispatch(fetchQuestionById('question-1'));
  });

  describe('Post Answer', () => {
    it('should add a new answer to currentQuestion', async () => {
      const initialAnswerCount =
        store.getState().question.currentQuestion.answers.length;

      const result = await store.dispatch(
        postAnswer({
          questionId: 'question-1',
          answerText: 'Use the Context API for global state management.',
        })
      );

      expect(postAnswer.fulfilled.match(result)).toBe(true);

      const state = store.getState().question;
      expect(state.currentQuestion.answers.length).toBe(initialAnswerCount + 1);
      expect(state.loading).toBe(false);
    });

    it('should persist the correct answer text', async () => {
      const answerText = 'You should use Redux Toolkit for complex state.';

      await store.dispatch(
        postAnswer({ questionId: 'question-1', answerText })
      );

      const state = store.getState().question;
      const lastAnswer =
        state.currentQuestion.answers[state.currentQuestion.answers.length - 1];
      expect(lastAnswer.answerText).toBe(answerText);
    });

    it('should handle multiple answers being added', async () => {
      const initialCount =
        store.getState().question.currentQuestion.answers.length;

      await store.dispatch(
        postAnswer({ questionId: 'question-1', answerText: 'First new answer' })
      );
      await store.dispatch(
        postAnswer({ questionId: 'question-1', answerText: 'Second new answer' })
      );

      const state = store.getState().question;
      expect(state.currentQuestion.answers.length).toBe(initialCount + 2);
    });
  });

  describe('Vote on Answer', () => {
    it('should upvote an answer and update vote count in state', async () => {
      const answer = store.getState().question.currentQuestion.answers[0];
      const initialVoteCount = answer.voteCount;

      const result = await store.dispatch(
        voteAnswer({ answer, voteType: 'upvote' })
      );

      expect(voteAnswer.fulfilled.match(result)).toBe(true);

      const updatedAnswers = store.getState().question.currentQuestion.answers;
      const updatedAnswer = updatedAnswers.find((a) => a._id === answer._id);
      expect(updatedAnswer.voteCount).toBe(initialVoteCount + 1);
    });

    it('should downvote an answer and update vote count in state', async () => {
      const answer = store.getState().question.currentQuestion.answers[0];
      const initialVoteCount = answer.voteCount;

      const result = await store.dispatch(
        voteAnswer({ answer, voteType: 'downvote' })
      );

      expect(voteAnswer.fulfilled.match(result)).toBe(true);

      const updatedAnswers = store.getState().question.currentQuestion.answers;
      const updatedAnswer = updatedAnswers.find((a) => a._id === answer._id);
      expect(updatedAnswer.voteCount).toBe(initialVoteCount - 1);
    });
  });
});
