import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('../../../src/services/aiService.js', () => ({
  improveQuestion: vi.fn(),
  summarizeAnswers: vi.fn(),
}));

vi.mock('../../../src/services/questionService.js', () => ({
  getAllQuestions: vi.fn(),
  getQuestionById: vi.fn(),
  getAnswersByQuestionId: vi.fn(),
  createQuestion: vi.fn(),
  upvoteQuestion: vi.fn(),
  downvoteQuestion: vi.fn(),
  createAnswerForQuestion: vi.fn(),
}));

import { improveQuestion, summarizeAnswers } from '../../../src/services/aiService.js';
import { createQuestion, getQuestionById } from '../../../src/services/questionService.js';
import PostQuestion from '../../../src/pages/Question/PostQuestion';
import QuestionDetail from '../../../src/pages/Question/QuestionDetail';
import AnswerSummary from '../../../src/components/Answer/AnswerSummary';

const makeStore = (userInfo) =>
  configureStore({
    reducer: {
      question: () => ({ questions: [], currentQuestion: null, loading: false, error: null }),
      user: () => ({ userInfo, loading: false, error: null }),
    },
  });

const renderWith = (ui, userInfo = { userId: 'u1', token: 'tok' }) =>
  render(
    <Provider store={makeStore(userInfo)}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>,
  );

beforeEach(() => vi.clearAllMocks());

describe('Feature 1: Question Quality Improver', () => {
  const fillAndImprove = async (user) => {
    await user.type(screen.getByPlaceholderText(/what's your programming question/i), 'old title');
    await user.type(screen.getByPlaceholderText(/provide more details/i), 'old description');
    await user.type(screen.getByPlaceholderText(/e\.g\., javascript/i), 'old-tag');
    await user.click(screen.getByRole('button', { name: /improve with ai/i }));
  };

  it('shows all three suggestions inline after one AI call', async () => {
    improveQuestion.mockResolvedValue({
      title: 'NEW TITLE',
      description: 'NEW DESCRIPTION',
      tags: ['react', 'hooks'],
    });
    const user = userEvent.setup();
    renderWith(<PostQuestion />);
    await fillAndImprove(user);

    expect(improveQuestion).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('NEW TITLE')).toBeInTheDocument();
    expect(screen.getByText('NEW DESCRIPTION')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('hooks')).toBeInTheDocument();
  });

  it('accepting the title replaces the field and removes only that suggestion', async () => {
    improveQuestion.mockResolvedValue({
      title: 'NEW TITLE',
      description: 'NEW DESCRIPTION',
      tags: ['react'],
    });
    const user = userEvent.setup();
    renderWith(<PostQuestion />);
    await fillAndImprove(user);
    await screen.findByText('NEW TITLE');

    const titleGroup = screen.getByRole('group', { name: /suggested title/i });
    await user.click(within(titleGroup).getByRole('button', { name: /accept/i }));

    expect(screen.getByPlaceholderText(/what's your programming question/i)).toHaveValue('NEW TITLE');
    expect(screen.queryByRole('group', { name: /suggested title/i })).not.toBeInTheDocument();
    // Other suggestions survive independently.
    expect(screen.getByRole('group', { name: /suggested description/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /suggested tags/i })).toBeInTheDocument();
  });

  it('rejecting the description dismisses it without changing the field', async () => {
    improveQuestion.mockResolvedValue({
      title: 'NEW TITLE',
      description: 'NEW DESCRIPTION',
      tags: ['react'],
    });
    const user = userEvent.setup();
    renderWith(<PostQuestion />);
    await fillAndImprove(user);
    await screen.findByText('NEW DESCRIPTION');

    const descGroup = screen.getByRole('group', { name: /suggested description/i });
    await user.click(within(descGroup).getByRole('button', { name: /reject/i }));

    expect(screen.getByPlaceholderText(/provide more details/i)).toHaveValue('old description');
    expect(screen.queryByRole('group', { name: /suggested description/i })).not.toBeInTheDocument();
  });

  it('accepting tags joins them into the comma-separated field', async () => {
    improveQuestion.mockResolvedValue({
      title: 'NEW TITLE',
      description: 'NEW DESCRIPTION',
      tags: ['react', 'hooks'],
    });
    const user = userEvent.setup();
    renderWith(<PostQuestion />);
    await fillAndImprove(user);
    await screen.findByText('react');

    const tagGroup = screen.getByRole('group', { name: /suggested tags/i });
    await user.click(within(tagGroup).getByRole('button', { name: /accept/i }));

    expect(screen.getByPlaceholderText(/e\.g\., javascript/i)).toHaveValue('react, hooks');
  });

  it('refuses to call the AI when the user is not logged in', async () => {
    const user = userEvent.setup();
    renderWith(<PostQuestion />, null);
    await fillAndImprove(user);

    expect(improveQuestion).not.toHaveBeenCalled();
    expect(await screen.findByText(/must be logged in/i)).toBeInTheDocument();
  });

  it('does not submit the form when improving', async () => {
    improveQuestion.mockResolvedValue({ title: 'T', description: 'D', tags: ['t'] });
    const user = userEvent.setup();
    renderWith(<PostQuestion />);
    await fillAndImprove(user);
    // Still on the form; no navigation/alert triggered.
    expect(screen.getByRole('button', { name: /post question/i })).toBeInTheDocument();
    expect(createQuestion).not.toHaveBeenCalled();
  });

  // Spec: "The form can be submitted normally at any point regardless of
  // whether suggestions have been acted on."
  it('submits normally while suggestions are still pending', async () => {
    vi.stubGlobal('alert', vi.fn());
    improveQuestion.mockResolvedValue({
      title: 'NEW TITLE',
      description: 'NEW DESCRIPTION',
      tags: ['react'],
    });
    createQuestion.mockResolvedValue({ _id: 'q1' });

    const user = userEvent.setup();
    renderWith(<PostQuestion />);
    await fillAndImprove(user);
    await screen.findByText('NEW TITLE');

    // All three suggestions are on screen and untouched.
    expect(screen.getByRole('group', { name: /suggested title/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /post question/i }));

    // Posts the user's own text, not the unaccepted suggestions.
    expect(createQuestion).toHaveBeenCalledTimes(1);
    expect(createQuestion.mock.calls[0][0]).toMatchObject({
      title: 'old title',
      description: 'old description',
      tags: 'old-tag',
    });
    vi.unstubAllGlobals();
  });

  it('submits normally after suggestions are accepted', async () => {
    vi.stubGlobal('alert', vi.fn());
    improveQuestion.mockResolvedValue({
      title: 'NEW TITLE',
      description: 'NEW DESCRIPTION',
      tags: ['react', 'hooks'],
    });
    createQuestion.mockResolvedValue({ _id: 'q1' });

    const user = userEvent.setup();
    renderWith(<PostQuestion />);
    await fillAndImprove(user);
    await screen.findByText('NEW TITLE');

    for (const name of [/suggested title/i, /suggested description/i, /suggested tags/i]) {
      const group = screen.getByRole('group', { name });
      await user.click(within(group).getByRole('button', { name: /accept/i }));
    }

    await user.click(screen.getByRole('button', { name: /post question/i }));

    expect(createQuestion.mock.calls[0][0]).toMatchObject({
      title: 'NEW TITLE',
      description: 'NEW DESCRIPTION',
      tags: 'react, hooks',
    });
    vi.unstubAllGlobals();
  });
});

describe('Feature 2: Answer TL;DR Summarizer', () => {
  const answers = (n) => Array.from({ length: n }, (_, i) => ({ _id: String(i), answerText: `a${i}` }));

  it('hides the button when there are fewer than 3 answers', () => {
    renderWith(<AnswerSummary questionId="q1" answers={answers(2)} />);
    expect(screen.queryByRole('button', { name: /summarize answers/i })).not.toBeInTheDocument();
  });

  it('hides the button when the user is not logged in', () => {
    renderWith(<AnswerSummary questionId="q1" answers={answers(5)} />, null);
    expect(screen.queryByRole('button', { name: /summarize answers/i })).not.toBeInTheDocument();
  });

  it('shows the button with 3+ answers when logged in', () => {
    renderWith(<AnswerSummary questionId="q1" answers={answers(3)} />);
    expect(screen.getByRole('button', { name: /summarize answers/i })).toBeInTheDocument();
  });

  it('summarizes in one call, then dismissing restores the button', async () => {
    summarizeAnswers.mockResolvedValue({ summary: 'THE TLDR', answerCount: 3 });
    const user = userEvent.setup();
    renderWith(<AnswerSummary questionId="q1" answers={answers(3)} />);

    await user.click(screen.getByRole('button', { name: /summarize answers/i }));

    expect(await screen.findByText('THE TLDR')).toBeInTheDocument();
    expect(summarizeAnswers).toHaveBeenCalledTimes(1);
    // Button is replaced by the banner.
    expect(screen.queryByRole('button', { name: /summarize answers/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByText('THE TLDR')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /summarize answers/i })).toBeInTheDocument();
  });
});

// Spec: "The summary is displayed in a dismissible banner above the answer list."
describe('Feature 2: banner placement on the question detail page', () => {
  const question = {
    _id: 'q1',
    title: 'A question',
    description: 'Some description',
    createdAt: new Date().toISOString(),
    voteCount: 0,
    views: 1,
    author: { _id: 'a1', name: 'Asker' },
    tags: [],
    answers: [1, 2, 3].map((n) => ({
      _id: `ans${n}`,
      answerText: `answer text ${n}`,
      voteCount: 0,
      createdAt: new Date().toISOString(),
      author: { _id: `u${n}`, name: `User ${n}` },
    })),
  };

  const renderDetail = () => {
    const store = configureStore({
      reducer: {
        question: () => ({ questions: [], currentQuestion: question, loading: false, error: null }),
        user: () => ({ userInfo: { userId: 'u1', token: 'tok' }, loading: false, error: null }),
        theme: () => ({ isDarkMode: false }),
      },
    });

    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/question/q1']}>
          <Routes>
            <Route path="/question/:id" element={<QuestionDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  };

  it('renders the summary banner above the answer list', async () => {
    getQuestionById.mockResolvedValue(question);
    summarizeAnswers.mockResolvedValue({ summary: 'THE TLDR', answerCount: 3 });

    const user = userEvent.setup();
    renderDetail();

    await user.click(await screen.findByRole('button', { name: /summarize answers/i }));

    const banner = await screen.findByText('THE TLDR');
    const answerListHeading = screen.getByText(/^3 Answers$/);

    // The answer list heading must come AFTER the banner in document order.
    expect(
      banner.compareDocumentPosition(answerListHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
