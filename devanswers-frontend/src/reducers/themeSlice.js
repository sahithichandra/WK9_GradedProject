import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDarkMode: localStorage.getItem('darkMode')
    ? JSON.parse(localStorage.getItem('darkMode'))
    : false,
};

const applyTheme = (isDarkMode) => {
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  if (isDarkMode) {
    document.body.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  } else {
    document.body.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-bs-theme', 'light');
  }
};

// Apply persisted theme on initial load
applyTheme(initialState.isDarkMode);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      applyTheme(state.isDarkMode);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
