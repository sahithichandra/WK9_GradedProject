import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  upvoteQuestion,
  downvoteQuestion,
  createAnswerForQuestion,
} from "../services/questionService.js";
import { upvoteAnswer, downvoteAnswer } from "../services/answerService.js";

const initialState = {
  questions: [],
  currentQuestion: null,
  loading: false,
  error: null,
};

export const fetchQuestions = createAsyncThunk(
  "question/fetchQuestions",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllQuestions();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch questions",
      );
    }
  },
);

export const fetchQuestionById = createAsyncThunk(
  "question/fetchQuestionById",
  async (id, { rejectWithValue }) => {
    try {
      return await getQuestionById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch question",
      );
    }
  },
);

export const postQuestion = createAsyncThunk(
  "question/postQuestion",
  async ({ title, description, tags }, { getState, rejectWithValue }) => {
    try {
      const userInfo = getState().user.userInfo;
      return await createQuestion(
        {
          title,
          description,
          tags,
          author: userInfo ? userInfo.userId : "unknown",
        },
        userInfo ? userInfo.token : "",
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to post question",
      );
    }
  },
);

export const voteQuestion = createAsyncThunk(
  "question/voteQuestion",
  async ({ question, voteType }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user.userInfo || {};
      const voteMethod =
        voteType === "upvote" ? upvoteQuestion : downvoteQuestion;
      return await voteMethod(question._id, token);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Vote failed",
      );
    }
  },
);

export const voteAnswer = createAsyncThunk(
  "question/voteAnswer",
  async ({ answer, voteType }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user.userInfo || {};
      const voteMethod = voteType === "upvote" ? upvoteAnswer : downvoteAnswer;
      return await voteMethod(answer._id, token);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Vote failed",
      );
    }
  },
);

export const postAnswer = createAsyncThunk(
  "question/postAnswer",
  async ({ questionId, answerText }, { getState, rejectWithValue }) => {
    try {
      const userInfo = getState().user.userInfo;
      return await createAnswerForQuestion(
        questionId,
        answerText,
        // userInfo ? userInfo.userId : "unknown",
        userInfo ? userInfo.token : "",
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to post answer",
      );
    }
  },
);

const questionSlice = createSlice({
  name: "question",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(postQuestion.pending, (state) => {
        state.loading = true;
      })
      .addCase(postQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.push(action.payload);
        state.currentQuestion = action.payload;
      })
      .addCase(postQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(voteQuestion.pending, (state) => {
        state.error = null;
      })
      .addCase(voteQuestion.fulfilled, (state, action) => {
        if (state.currentQuestion) {
          state.currentQuestion.upvotes = action.payload.upvotes;
          state.currentQuestion.downvotes = action.payload.downvotes;
          state.currentQuestion.voteCount = action.payload.voteCount;
        }
        const questionIndex = state.questions.findIndex(
          (q) => q._id === action.meta.arg.question._id,
        );
        if (questionIndex !== -1) {
          state.questions[questionIndex].upvotes = action.payload.upvotes;
          state.questions[questionIndex].downvotes = action.payload.downvotes;
          state.questions[questionIndex].voteCount = action.payload.voteCount;
        }
      })
      .addCase(voteQuestion.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(voteAnswer.pending, (state) => {
        state.error = null;
      })
      .addCase(voteAnswer.fulfilled, (state, action) => {
        const answerId = action.payload._id;
        if (state.currentQuestion) {
          const answerIndex = state.currentQuestion.answers.findIndex(
            (ans) => ans._id === answerId,
          );
          if (answerIndex !== -1) {
            state.currentQuestion.answers[answerIndex].upvotes =
              action.payload.upvotes;
            state.currentQuestion.answers[answerIndex].downvotes =
              action.payload.downvotes;
            state.currentQuestion.answers[answerIndex].voteCount =
              action.payload.voteCount;
          }
        }
      })
      .addCase(voteAnswer.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(postAnswer.pending, (state) => {
        state.loading = true;
      })
      .addCase(postAnswer.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentQuestion) {
          state.currentQuestion.answers.push(action.payload);
        }
      })
      .addCase(postAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default questionSlice.reducer;
