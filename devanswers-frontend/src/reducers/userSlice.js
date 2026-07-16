import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { login, register } from '../services/authService.js';

const initialState = {
  userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
  login: {
    status: 'idle', // 'idle' | 'pending' | 'fulfilled' | 'rejected'
    error: null,
  },
  registration: {
    status: 'idle', // 'idle' | 'pending' | 'fulfilled' | 'rejected'
    error: null,
  },
};

// Async thunk: login — localStorage side effects kept out of reducers
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await login({ email, password });
      const { token, userId, name } = data;
      localStorage.setItem('userInfo', JSON.stringify({ token, userId, name }));
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid email or password',
      );
    }
  }
);

// Async thunk: register
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      return await register({ name, email, password, isAdmin: false });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed',
      );
    }
  }
);

// Thunk: logout — clears localStorage then resets Redux state
export const logoutUser = () => (dispatch) => {
  localStorage.removeItem('userInfo');
  dispatch(userSlice.actions.logout());
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      state.login = { status: 'idle', error: null };
      state.registration = { status: 'idle', error: null };
    },
    clearAuthState: (state) => {
      state.login.error = null;
      state.login.status = 'idle';
      state.registration.error = null;
      state.registration.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.login.status = 'pending';
        state.login.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, userId, name } = action.payload;
        state.userInfo = { token, userId, name };
        state.login.status = 'fulfilled';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.login.status = 'rejected';
        state.login.error = action.payload || action.error.message;
      })

      // register
      .addCase(registerUser.pending, (state) => {
        state.registration.status = 'pending';
        state.registration.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.registration.status = 'fulfilled';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registration.status = 'rejected';
        state.registration.error = action.payload || action.error.message;
      });
  },
});

export const { clearAuthState, logout } = userSlice.actions;

export const selectIsAuthenticated = (state) => !!state.user.userInfo;

export default userSlice.reducer;