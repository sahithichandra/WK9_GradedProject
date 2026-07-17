import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../../../src/reducers/userSlice.js';
import Header from '../../../src/components/Header/Header';

const renderLoggedIn = () => {
  localStorage.setItem(
    'userInfo',
    JSON.stringify({ token: 'tok', userId: 'u1', name: 'Bob' }),
  );

  const store = configureStore({
    reducer: {
      user: userReducer,
      theme: () => ({ isDarkMode: false }),
      question: () => ({ questions: [], currentQuestion: null, loading: false, error: null }),
    },
    // userSlice reads localStorage at module load, which happens before this
    // test runs, so seed the logged-in session explicitly.
    preloadedState: {
      user: {
        userInfo: { token: 'tok', userId: 'u1', name: 'Bob' },
        login: { status: 'idle', error: null },
        registration: { status: 'idle', error: null },
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<><Header /><div>HOME PAGE</div></>} />
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return store;
};

describe('logout', () => {
  it('lands on the login page and clears the session', async () => {
    const user = userEvent.setup();
    const store = renderLoggedIn();

    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();

    await user.click(screen.getByText('Logout'));

    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('HOME PAGE')).not.toBeInTheDocument();
    expect(store.getState().user.userInfo).toBeNull();
    expect(localStorage.getItem('userInfo')).toBeNull();
  });
});
