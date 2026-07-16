import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Home from '../../../src/pages/Question/Home';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createMockStore = (questions = [], userInfo = { userId: 'u1' }) => {
  return configureStore({
    reducer: {
      question: () => ({ questions, loading: false, error: null, currentQuestion: null }),
      user: () => ({ userInfo, loading: false, error: null }),
    },
  });
};

const renderHome = (questions = [], userInfo = { userId: 'u1' }) => {
  const store = createMockStore(questions, userInfo);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    </Provider>
  );
};

describe('Home Page', () => {
  const mockQuestions = [
    {
      _id: 'q1',
      title: 'How does useState work in React?',
      description: 'I am confused about state management.',
      voteCount: 5,
      answerCount: 2,
      tags: [{ _id: 't1', name: 'react' }],
      author: { _id: 'u2', name: 'Alice' },
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      _id: 'q2',
      title: 'What is the difference between null and undefined?',
      description: 'I keep getting confused between the two.',
      voteCount: 3,
      answerCount: 1,
      tags: [{ _id: 't2', name: 'javascript' }],
      author: { _id: 'u3', name: 'Bob' },
      createdAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    mockNavigate.mockClear();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders the All Questions heading', () => {
    renderHome(mockQuestions);
    expect(screen.getByText('All Questions')).toBeInTheDocument();
  });

  it('renders question titles from the store', () => {
    renderHome(mockQuestions);
    expect(screen.getByText('How does useState work in React?')).toBeInTheDocument();
    expect(screen.getByText('What is the difference between null and undefined?')).toBeInTheDocument();
  });

  it("renders 'No questions found' if no questions exist", () => {
    renderHome([]);
    expect(screen.getByText(/no questions found/i)).toBeInTheDocument();
  });

  it('renders the Ask Question button', () => {
    renderHome(mockQuestions);
    expect(screen.getByText('Ask Question')).toBeInTheDocument();
  });

  it('shows alert when unauthenticated user clicks Ask Question', async () => {
    renderHome([], null);
    await userEvent.click(screen.getByText('Ask Question').closest('button'));
    expect(window.alert).toHaveBeenCalledWith('Please log in to ask a question.');
  });

  it('navigates to /ask when authenticated user clicks Ask Question', async () => {
    renderHome([], { userId: 'u1' });
    await userEvent.click(screen.getByText('Ask Question').closest('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/ask');
  });
});
