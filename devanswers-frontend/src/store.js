import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice";
import questionReducer from "./reducers/questionSlice";
import themeReducer from "./reducers/themeSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    question: questionReducer,
    theme: themeReducer,
  },
});

export default store;