import { describe, it, expect } from 'vitest';
import store from '../../../src/store';

describe('Redux Store Configuration', () => {
  it('should have all required reducers configured', () => {
    const state = store.getState();

    expect(state).toHaveProperty('user');
    expect(state).toHaveProperty('question');
    expect(state).toHaveProperty('theme');
  });

  it('should initialize user state correctly', () => {
    const state = store.getState();

    expect(state.user).toHaveProperty('userInfo');
  });

  it('should initialize question state correctly', () => {
    const state = store.getState();

    expect(state.question).toHaveProperty('questions');
    expect(state.question).toHaveProperty('currentQuestion');
    expect(state.question).toHaveProperty('loading');
    expect(state.question).toHaveProperty('error');
    expect(Array.isArray(state.question.questions)).toBe(true);
  });

  it('should initialize theme state correctly', () => {
    const state = store.getState();

    expect(state.theme).toHaveProperty('isDarkMode');
    expect(typeof state.theme.isDarkMode).toBe('boolean');
  });
});
