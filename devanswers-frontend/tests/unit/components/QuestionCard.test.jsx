import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import QuestionCard from '../../../src/components/Question/QuestionCard';
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

const mockQuestion = {
  _id: 'q1',
  title: 'How do I use React hooks?',
  description: 'I need help understanding useState and useEffect.',
  voteCount: 7,
  answerCount: 3,
  tags: [
    { _id: 't1', name: 'react' },
    { _id: 't2', name: 'hooks' },
  ],
  author: { _id: 'user-2', name: 'Alice' },
  createdAt: '2026-01-10T10:00:00.000Z',
};

const renderQuestionCard = (question = mockQuestion) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <QuestionCard question={question} />
      </BrowserRouter>
    </Provider>
  );
};

describe('QuestionCard Component', () => {
  it('renders the question title', () => {
    renderQuestionCard();
    expect(screen.getByText('How do I use React hooks?')).toBeInTheDocument();
  });

  it('renders the question description', () => {
    renderQuestionCard();
    expect(screen.getByText('I need help understanding useState and useEffect.')).toBeInTheDocument();
  });

  it('renders the author name', () => {
    renderQuestionCard();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders tags as badges', () => {
    renderQuestionCard();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('hooks')).toBeInTheDocument();
  });

  it('renders the vote count', () => {
    renderQuestionCard();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders the answer count', () => {
    renderQuestionCard();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders upvote and downvote buttons', () => {
    renderQuestionCard();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders a link to the question detail page', () => {
    renderQuestionCard();
    const link = screen.getByText('How do I use React hooks?').closest('a');
    expect(link).toHaveAttribute('href', '/question/q1');
  });

  // Edge case: verify component handles null question gracefully
  it('renders nothing when question is null', () => {
    const { container } = renderQuestionCard(null);
    expect(container.innerHTML).toBe('');
  });

  // Edge case: verify component handles missing _id gracefully
  it('renders nothing when question has no _id', () => {
    const { container } = renderQuestionCard({ title: 'No ID' });
    expect(container.innerHTML).toBe('');
  });

  // Edge case: verify fallback text for missing author
  it('shows "Anonymous" when author name is missing', () => {
    renderQuestionCard({ ...mockQuestion, author: null });
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });
});
