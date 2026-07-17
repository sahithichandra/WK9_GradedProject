import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../../../src/components/Header/Header';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createMockStore = ({ userInfo = null, isDarkMode = false } = {}) => {
  return configureStore({
    reducer: {
      user: () => ({ userInfo, loading: false, error: null }),
      theme: () => ({ isDarkMode }),
    },
  });
};

const renderHeader = (storeOptions = {}) => {
  const store = createMockStore(storeOptions);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    </Provider>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the logo text', () => {
    renderHeader();
    expect(screen.getByText('DevAnswers')).toBeInTheDocument();
  });

  it('shows Login and Sign Up buttons when not authenticated', () => {
    renderHeader();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('navigates to /login when Login button is clicked', async () => {
    renderHeader();
    await userEvent.click(screen.getByText('Login'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to /register when Sign Up button is clicked', async () => {
    renderHeader();
    await userEvent.click(screen.getByText('Sign Up'));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('shows Logout button when authenticated', () => {
    renderHeader({ userInfo: { name: 'Alice', userId: 'u1' } });
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows user name when authenticated', () => {
    renderHeader({ userInfo: { name: 'Alice', userId: 'u1' } });
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders the theme toggle button', () => {
    const { container } = renderHeader();
    const themeBtn = container.querySelector('.header-theme-btn');
    expect(themeBtn).toBeInTheDocument();
  });

  it('navigates to / when logo is clicked', async () => {
    renderHeader();
    await userEvent.click(screen.getByText('DevAnswers'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to /profile when profile button is clicked', async () => {
    renderHeader({ userInfo: { name: 'Alice', userId: 'u1' } });
    await userEvent.click(screen.getByText('Alice'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
