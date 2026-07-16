import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import QuestionFilterBar from '../../../src/components/Question/QuestionFilterBar';

describe('QuestionFilterBar Component', () => {
  const defaultProps = {
    searchQuery: '',
    onSearch: vi.fn(),
    sortBy: 'newest',
    onSort: vi.fn(),
  };

  const renderFilterBar = (props = {}) => {
    return render(<QuestionFilterBar {...defaultProps} {...props} />);
  };

  it('renders the search input', () => {
    renderFilterBar();
    expect(screen.getByPlaceholderText(/search questions/i)).toBeInTheDocument();
  });

  it('renders the sort button with current sort label', () => {
    renderFilterBar({ sortBy: 'newest' });
    expect(screen.getByText('Newest')).toBeInTheDocument();
  });

  it('displays "Most Votes" label when sortBy is votes', () => {
    renderFilterBar({ sortBy: 'votes' });
    expect(screen.getByText('Most Votes')).toBeInTheDocument();
  });

  it('displays "Most Answers" label when sortBy is answers', () => {
    renderFilterBar({ sortBy: 'answers' });
    expect(screen.getByText('Most Answers')).toBeInTheDocument();
  });

  it('calls onSearch when typing in the search input', async () => {
    const mockOnSearch = vi.fn();
    renderFilterBar({ onSearch: mockOnSearch });

    await userEvent.type(screen.getByPlaceholderText(/search questions/i), 'react');
    expect(mockOnSearch).toHaveBeenCalled();
  });

  it('calls onSort when a sort option is clicked', async () => {
    const mockOnSort = vi.fn();
    renderFilterBar({ onSort: mockOnSort });

    // Open the dropdown
    const toggleButton = screen.getByRole('button', { name: '' });
    await userEvent.click(toggleButton);

    // Click "Most Votes" option
    await userEvent.click(screen.getByText('Most Votes'));
    expect(mockOnSort).toHaveBeenCalledWith('votes');
  });

  it('shows the search query value in the input', () => {
    renderFilterBar({ searchQuery: 'react hooks' });
    expect(screen.getByPlaceholderText(/search questions/i)).toHaveValue('react hooks');
  });
});
