import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import PostQuestion from '../../../src/pages/Question/PostQuestion';

const createMockStore = () => {
  return configureStore({
    reducer: {
      question: () => ({ questions: [], currentQuestion: null, loading: false, error: null }),
      user: () => ({
        userInfo: { userId: 'u1', token: 'tok' },
        loading: false,
        error: null,
      }),
    },
  });
};

const renderPostQuestion = () => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <PostQuestion />
      </BrowserRouter>
    </Provider>
  );
};

describe('PostQuestion Page', () => {
  it('renders the page heading', () => {
    renderPostQuestion();
    expect(screen.getByText('Ask a Question')).toBeInTheDocument();
  });

  it('renders the title input', () => {
    renderPostQuestion();
    expect(screen.getByPlaceholderText(/what's your programming question/i)).toBeInTheDocument();
  });

  it('renders the description textarea', () => {
    renderPostQuestion();
    expect(screen.getByPlaceholderText(/provide more details about your question/i)).toBeInTheDocument();
  });

  it('renders the tags input and submit button', () => {
    renderPostQuestion();
    expect(screen.getByPlaceholderText(/e.g., javascript, react, css/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post question/i })).toBeInTheDocument();
  });

  it('allows typing in the title field', async () => {
    renderPostQuestion();
    const titleInput = screen.getByPlaceholderText(/what's your programming question/i);

    await userEvent.type(titleInput, 'How do I use Redux Toolkit?');
    expect(titleInput).toHaveValue('How do I use Redux Toolkit?');
  });

  it('allows typing in the description field', async () => {
    renderPostQuestion();
    const descriptionInput = screen.getByPlaceholderText(/provide more details about your question/i);

    await userEvent.type(descriptionInput, 'I want to manage state effectively.');
    expect(descriptionInput).toHaveValue('I want to manage state effectively.');
  });

  it('allows typing in the tags field', async () => {
    renderPostQuestion();
    const tagsInput = screen.getByPlaceholderText(/e.g., javascript, react, css/i);

    await userEvent.type(tagsInput, 'javascript, react');
    expect(tagsInput).toHaveValue('javascript, react');
  });
});
