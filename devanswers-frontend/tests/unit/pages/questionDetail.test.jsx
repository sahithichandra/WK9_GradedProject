import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import QuestionDetail from '../../../src/pages/Question/QuestionDetail';

const createMockStore = ({ currentQuestion = null, loading = false, error = null } = {}) => {
  return configureStore({
    reducer: {
      question: () => ({ questions: [], currentQuestion, loading, error }),
      user: () => ({
        userInfo: { userId: 'u1' },
        loading: false,
        error: null,
      }),
    },
  });
};

const renderQuestionDetail = (storeOptions = {}, questionId = 'q1') => {
  const store = createMockStore(storeOptions);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/question/${questionId}`]}>
        <Routes>
          <Route path="/question/:id" element={<QuestionDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('QuestionDetail Page', () => {
  const mockQuestion = {
    _id: 'q1',
    title: 'How do I use the useEffect hook?',
    description: 'I have trouble with the dependency array.',
    voteCount: 8,
    tags: [{ _id: 't1', name: 'react' }, { _id: 't2', name: 'hooks' }],
    author: { _id: 'u2', name: 'Alice' },
    createdAt: '2026-01-15T00:00:00.000Z',
    answers: [],
  };

  it('shows question not found when no current question is loaded', () => {
    renderQuestionDetail();
    expect(screen.getByText(/question not found/i)).toBeInTheDocument();
  });

  it('shows an error message when there is an error', () => {
    renderQuestionDetail({ error: 'Not Found' });
    expect(screen.getByText(/error loading question/i)).toBeInTheDocument();
  });

  it('renders the question title when a question is loaded', () => {
    renderQuestionDetail({ currentQuestion: mockQuestion });
    expect(screen.getByText('How do I use the useEffect hook?')).toBeInTheDocument();
  });

  it('renders the question description when a question is loaded', () => {
    renderQuestionDetail({ currentQuestion: mockQuestion });
    expect(screen.getByText('I have trouble with the dependency array.')).toBeInTheDocument();
  });

  it('renders the answer form when a question is loaded', () => {
    renderQuestionDetail({ currentQuestion: mockQuestion });
    expect(screen.getByPlaceholderText(/write your answer here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post answer/i })).toBeInTheDocument();
  });

  it('renders the answers section heading when a question is loaded', () => {
    renderQuestionDetail({ currentQuestion: mockQuestion });
    expect(screen.getByText('0 Answers')).toBeInTheDocument();
  });

  it('renders question tags when a question is loaded', () => {
    renderQuestionDetail({ currentQuestion: mockQuestion });
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('hooks')).toBeInTheDocument();
  });
});
