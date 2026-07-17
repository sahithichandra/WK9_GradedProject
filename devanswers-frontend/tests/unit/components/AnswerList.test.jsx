import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AnswerList from '../../../src/components/Answer/AnswerList';
import questionReducer from '../../../src/reducers/questionSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      question: questionReducer,
      user: () => ({
        userInfo: { userId: 'user-1' },
        loading: false,
        error: null,
      }),
    },
  });
};

const mockAnswers = [
  {
    _id: 'a1',
    answerText: 'Use the useState hook for local state.',
    author: { _id: 'user-2', name: 'Alice' },
    voteCount: 5,
    createdAt: '2026-01-15T12:00:00.000Z',
  },
  {
    _id: 'a2',
    answerText: 'You can also try lifting state up.',
    author: { _id: 'user-3', name: 'Bob' },
    voteCount: -2,
    createdAt: '2026-01-15T13:00:00.000Z',
  },
];

const renderAnswerList = (answers = mockAnswers) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <AnswerList answers={answers} />
    </Provider>
  );
};

describe('AnswerList Component', () => {
  it('renders all answer texts', () => {
    renderAnswerList();
    expect(screen.getByText('Use the useState hook for local state.')).toBeInTheDocument();
    expect(screen.getByText('You can also try lifting state up.')).toBeInTheDocument();
  });

  it('renders answer authors', () => {
    renderAnswerList();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders answer vote counts', () => {
    renderAnswerList();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('-2')).toBeInTheDocument();
  });

  it('renders the answers count heading', () => {
    renderAnswerList();
    expect(screen.getByText('2 Answers')).toBeInTheDocument();
  });

  it('shows singular "Answer" for one answer', () => {
    renderAnswerList([mockAnswers[0]]);
    expect(screen.getByText('1 Answer')).toBeInTheDocument();
  });

  it('renders upvote and downvote buttons for each answer', () => {
    renderAnswerList();
    const buttons = screen.getAllByRole('button');
    // At least 2 upvote + 2 downvote = 4 buttons
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('renders "Answered by" label for each answer', () => {
    renderAnswerList();
    const answeredByTexts = screen.getAllByText(/Answered by/i);
    expect(answeredByTexts).toHaveLength(2);
  });

  it('renders empty state when no answers provided', () => {
    renderAnswerList([]);
    expect(screen.getByText(/No answers yet/i)).toBeInTheDocument();
  });

  it('shows "0 Answers" heading when answers array is empty', () => {
    renderAnswerList([]);
    expect(screen.getByText('0 Answers')).toBeInTheDocument();
  });
});
