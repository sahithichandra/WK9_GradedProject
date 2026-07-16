import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userReducer, { loginUser, registerUser, logoutUser } from '../../src/reducers/userSlice';

/**
 * Integration Tests: Auth Flow with Redux + MSW
 * Verifies that Redux auth actions work correctly with MSW-intercepted API calls.
 * No component rendering — pure Redux + API integration.
 */

const createTestStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
  });
};

describe('Auth Flow Integration Tests (Redux + MSW)', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
    localStorage.clear();
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      expect(store.getState().user.userInfo).toBeNull();

      const result = await store.dispatch(
        loginUser({ email: 'alice@example.com', password: 'password123' })
      );

      expect(loginUser.fulfilled.match(result)).toBe(true);

      const state = store.getState().user;
      expect(state.userInfo).toBeTruthy();
      expect(state.userInfo.token).toBe('mock-jwt-token-alice');
      expect(state.userInfo.userId).toBe('user-1');
      expect(state.userInfo.name).toBe('Alice Johnson');
      expect(state.login.status).toBe('fulfilled');
      expect(state.login.error).toBeNull();

      expect(localStorage.getItem('userInfo')).toBeTruthy();
    });

    it('should handle login failure with invalid credentials', async () => {
      const result = await store.dispatch(
        loginUser({ email: 'wrong@example.com', password: 'wrongpass' })
      );

      expect(loginUser.rejected.match(result)).toBe(true);

      const state = store.getState().user;
      expect(state.userInfo).toBeNull();
      expect(state.login.error).toBeDefined();
      expect(state.login.status).toBe('rejected');
    });

    it('should set loading state during login', async () => {
      const promise = store.dispatch(
        loginUser({ email: 'alice@example.com', password: 'password123' })
      );

      expect(store.getState().user.login).toHaveProperty('status');

      await promise;

      expect(store.getState().user.login.status).toBe('fulfilled');
    });
  });

  describe('Register Flow', () => {
    it('should successfully register a new user', async () => {
      const result = await store.dispatch(
        registerUser({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
        })
      );

      expect(registerUser.fulfilled.match(result)).toBe(true);

      const state = store.getState().user;
      expect(state.registration.status).toBe('fulfilled');
      expect(state.registration.error).toBeNull();
    });

    it('should handle registration failure with existing email', async () => {
      const result = await store.dispatch(
        registerUser({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        })
      );

      expect(registerUser.rejected.match(result)).toBe(true);

      const state = store.getState().user;
      expect(state.registration.error).toBeDefined();
      expect(state.registration.status).toBe('rejected');
    });
  });

  describe('Logout Flow', () => {
    it('should clear auth state and localStorage on logout', async () => {
      await store.dispatch(
        loginUser({ email: 'alice@example.com', password: 'password123' })
      );

      expect(store.getState().user.userInfo).toBeTruthy();
      expect(localStorage.getItem('userInfo')).toBeTruthy();

      store.dispatch(logoutUser());

      const state = store.getState().user;
      expect(state.userInfo).toBeNull();
      expect(localStorage.getItem('userInfo')).toBeNull();
    });
  });
});
