import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../../src/components/Navbar/Navbar';

const mockLocation = { pathname: '/' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

const renderNavbar = (props = {}) => {
  const defaultProps = {
    onLinkClick: vi.fn(),
    ...props,
  };
  return render(
    <BrowserRouter>
      <Navbar {...defaultProps} />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    mockLocation.pathname = '/';
  });

  it('renders navigation links', () => {
    renderNavbar();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders the sidebar footer text', () => {
    renderNavbar();
    expect(screen.getByText(/© 2026 DevAnswers/i)).toBeInTheDocument();
  });

  it('highlights Home link when on home page', () => {
    mockLocation.pathname = '/';
    renderNavbar();
    const homeLink = screen.getByText('Home').closest('.nav-item-custom');
    expect(homeLink).toHaveClass('active');
  });

  it('highlights Tags link when on tags page', () => {
    mockLocation.pathname = '/tags';
    renderNavbar();
    const tagsLink = screen.getByText('Tags').closest('.nav-item-custom');
    expect(tagsLink).toHaveClass('active');
  });

  it('highlights Profile link when on profile page', () => {
    mockLocation.pathname = '/profile';
    renderNavbar();
    const profileLink = screen.getByText('Profile').closest('.nav-item-custom');
    expect(profileLink).toHaveClass('active');
  });

  it('calls onLinkClick when a navigation link is clicked', async () => {
    const mockOnLinkClick = vi.fn();
    renderNavbar({ onLinkClick: mockOnLinkClick });

    await userEvent.click(screen.getByText('Home'));
    expect(mockOnLinkClick).toHaveBeenCalled();
  });

  it('has correct href for Home link', () => {
    renderNavbar();
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('has correct href for Tags link', () => {
    renderNavbar();
    const tagsLink = screen.getByText('Tags').closest('a');
    expect(tagsLink).toHaveAttribute('href', '/tags');
  });

  it('has correct href for Profile link', () => {
    renderNavbar();
    const profileLink = screen.getByText('Profile').closest('a');
    expect(profileLink).toHaveAttribute('href', '/profile');
  });
});
