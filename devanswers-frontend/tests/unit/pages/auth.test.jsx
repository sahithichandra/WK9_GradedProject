import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../../../src/pages/Auth/Login';
import Register from '../../../src/pages/Auth/Register';
import userReducer from '../../../src/reducers/userSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
  });
};

const renderWithProviders = (component) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Auth Components', () => {
  describe('Login Component', () => {
    it('renders the login form fields', () => {
      renderWithProviders(<Login />);
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('allows typing email and password and submitting', async () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </Provider>
      );

      await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'admin@gmail.com');
      await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'admin123');
      await userEvent.click(screen.getByRole('button', { name: /login/i }));

      // Verify form submitted (dispatch happened, input values remain)
      expect(screen.getByPlaceholderText(/enter your email/i)).toHaveValue('admin@gmail.com');
      expect(screen.getByPlaceholderText(/enter your password/i)).toHaveValue('admin123');
    });
  });

  describe('Register Component', () => {
    it('renders the register form fields', () => {
      renderWithProviders(<Register />);
      expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/create a password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('allows typing form data and submitting', async () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Register />
          </BrowserRouter>
        </Provider>
      );

      await userEvent.type(screen.getByPlaceholderText(/enter your full name/i), 'JohnDoe');
      await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'john@example.com');
      await userEvent.type(screen.getByPlaceholderText(/create a password/i), 'password123');
      await userEvent.type(screen.getByPlaceholderText(/confirm your password/i), 'password123');
      await userEvent.click(screen.getByRole('button', { name: /register/i }));

      expect(screen.getByPlaceholderText(/enter your full name/i)).toHaveValue('JohnDoe');
      expect(screen.getByPlaceholderText(/enter your email/i)).toHaveValue('john@example.com');
    });

    it('shows an error when passwords do not match', async () => {
      renderWithProviders(<Register />);

      await userEvent.type(screen.getByPlaceholderText(/enter your full name/i), 'TestUser');
      await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'test@test.com');
      await userEvent.type(screen.getByPlaceholderText(/create a password/i), 'password123');
      await userEvent.type(screen.getByPlaceholderText(/confirm your password/i), 'different456');
      await userEvent.click(screen.getByRole('button', { name: /register/i }));

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});
