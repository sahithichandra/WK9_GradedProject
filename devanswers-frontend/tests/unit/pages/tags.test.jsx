import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Tags from '../../../src/pages/Tags/Tags';

// No vi.mock — tagService uses axios, which is intercepted by MSW (same approach as MLS).

const renderTags = () => {
  return render(
    <BrowserRouter>
      <Tags />
    </BrowserRouter>
  );
};

describe('Tags Page', () => {
  it('shows loading state initially', () => {
    renderTags();
    expect(screen.getByText('Loading tags...')).toBeInTheDocument();
  });

  it('renders tag names after loading', async () => {
    renderTags();

    await screen.findByText('javascript');

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('css')).toBeInTheDocument();
  });

  it('renders the total tags count', async () => {
    renderTags();

    await screen.findByText('javascript');

    // Tags count is rendered as <strong>3</strong> tags across child elements
    const countEl = document.querySelector('.tags-count');
    expect(countEl).toHaveTextContent('3 tags');
  });

  it('filters tags by search query', async () => {
    renderTags();

    await screen.findByText('javascript');

    await userEvent.type(screen.getByPlaceholderText(/search tags/i), 'java');

    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.queryByText('react')).not.toBeInTheDocument();
    expect(screen.queryByText('css')).not.toBeInTheDocument();
  });

  it('shows No tags found when search has no matches', async () => {
    renderTags();

    await screen.findByText('javascript');

    await userEvent.type(screen.getByPlaceholderText(/search tags/i), 'xyz-no-match');

    expect(screen.getByText(/no tags found/i)).toBeInTheDocument();
  });

  it('renders question count for each tag', async () => {
    renderTags();

    await screen.findByText('javascript');

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
