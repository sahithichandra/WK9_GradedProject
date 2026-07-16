import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import VoteButtons from '../../../src/components/Shared/VoteButtons';

const createMockStore = ({ userInfo = { userId: 'user-1' } } = {}) => {
  return configureStore({
    reducer: {
      user: () => ({
        userInfo,
        loading: false,
        error: null,
      }),
    },
  });
};

const renderVoteButtons = (props = {}, storeOptions = {}) => {
  const defaultProps = {
    voteCount: 5,
    authorId: 'user-2',
    onVote: vi.fn(),
    ...props,
  };
  const store = createMockStore(storeOptions);
  return render(
    <Provider store={store}>
      <VoteButtons {...defaultProps} />
    </Provider>
  );
};

describe('VoteButtons Component', () => {
  it('renders upvote and downvote buttons', () => {
    renderVoteButtons();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('displays the vote count', () => {
    renderVoteButtons({ voteCount: 10 });
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays negative vote count', () => {
    renderVoteButtons({ voteCount: -3 });
    expect(screen.getByText('-3')).toBeInTheDocument();
  });

  it('displays zero when voteCount is null', () => {
    renderVoteButtons({ voteCount: null });
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('calls onVote with "upvote" when upvote button is clicked', async () => {
    const mockOnVote = vi.fn();
    renderVoteButtons({ onVote: mockOnVote });

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);
    expect(mockOnVote).toHaveBeenCalledWith('upvote');
  });

  it('calls onVote with "downvote" when downvote button is clicked', async () => {
    const mockOnVote = vi.fn();
    renderVoteButtons({ onVote: mockOnVote });

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[1]);
    expect(mockOnVote).toHaveBeenCalledWith('downvote');
  });

  it('shows alert when unauthenticated user clicks upvote', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const mockOnVote = vi.fn();
    renderVoteButtons({ onVote: mockOnVote }, { userInfo: null });

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);

    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/logged in/i));
    expect(mockOnVote).not.toHaveBeenCalled();
  });

  it('shows alert when user tries to vote on own post', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const mockOnVote = vi.fn();
    renderVoteButtons(
      { onVote: mockOnVote, authorId: 'user-1' },
      { userInfo: { userId: 'user-1' } }
    );

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);

    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/cannot/i));
    expect(mockOnVote).not.toHaveBeenCalled();
  });
});
