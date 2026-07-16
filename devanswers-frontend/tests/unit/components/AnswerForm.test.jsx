import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AnswerForm from '../../../src/components/Answer/AnswerForm';
import questionReducer from '../../../src/reducers/questionSlice';

const createMockStore = ({ userInfo = { userId: 'user-1', token: 'tok' } } = {}) => {
  return configureStore({
    reducer: {
      question: questionReducer,
      user: () => ({
        userInfo,
        loading: false,
        error: null,
      }),
    },
  });
};

const renderAnswerForm = (storeOptions = {}) => {
  const store = createMockStore(storeOptions);
  return render(
    <Provider store={store}>
      <AnswerForm questionId="q1" />
    </Provider>
  );
};

describe('AnswerForm Component', () => {
  it('renders the form title', () => {
    renderAnswerForm();
    expect(screen.getByText('Your Answer')).toBeInTheDocument();
  });

  it('renders the answer textarea', () => {
    renderAnswerForm();
    expect(screen.getByPlaceholderText(/write your answer here/i)).toBeInTheDocument();
  });

  it('renders the post answer button', () => {
    renderAnswerForm();
    expect(screen.getByRole('button', { name: /post answer/i })).toBeInTheDocument();
  });

  it('allows typing in the textarea', async () => {
    renderAnswerForm();
    const textarea = screen.getByPlaceholderText(/write your answer here/i);

    await userEvent.type(textarea, 'This is a test answer');
    expect(textarea).toHaveValue('This is a test answer');
  });

  it('clears textarea after form submission', async () => {
    renderAnswerForm();
    const textarea = screen.getByPlaceholderText(/write your answer here/i);

    await userEvent.type(textarea, 'My answer text');
    await userEvent.click(screen.getByRole('button', { name: /post answer/i }));

    expect(textarea).toHaveValue('');
  });

  it('shows alert when unauthenticated user submits', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderAnswerForm({ userInfo: null });
    const textarea = screen.getByPlaceholderText(/write your answer here/i);

    await userEvent.type(textarea, 'My answer');
    await userEvent.click(screen.getByRole('button', { name: /post answer/i }));

    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/logged in/i));
  });

  it('shows alert when submitting empty answer', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderAnswerForm();

    await userEvent.click(screen.getByRole('button', { name: /post answer/i }));

    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/empty/i));
  });

  it('textarea has correct number of rows', () => {
    renderAnswerForm();
    const textarea = screen.getByPlaceholderText(/write your answer here/i);
    expect(textarea).toHaveAttribute('rows', '8');
  });
});
