// API Endpoints Configuration
// All paths are relative - the base URL is handled by axiosInstance.js

// Authentication API Endpoints
export const AUTH_API = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
};

// Question API Endpoints
export const QUESTION_API = {
  GET_ALL: "/questions",
  GET_BY_ID: (id) => `/questions/${id}`,
  GET_ANSWERS_BY_QUESTION_ID: (questionId) =>
    `/questions/${questionId}/answers`,

  CREATE: "/questions",
  UPDATE: (id) => `/questions/${id}`,
  DELETE: (id) => `/questions/${id}`,
  UPVOTE: (id) => `/questions/${id}/upvote`,
  DOWNVOTE: (id) => `/questions/${id}/downvote`,
  CREATE_ANSWER_FOR_QUESTION: (questionId) =>
    `/questions/${questionId}/answers`,
};

// Answer API Endpoints
export const ANSWER_API = {
  UPDATE: (answerId) => `/answers/${answerId}`,
  DELETE: (answerId) => `/answers/${answerId}`,
  UPVOTE: (answerId) => `/answers/${answerId}/upvote`,
  DOWNVOTE: (answerId) => `/answers/${answerId}/downvote`,
};

// Tag API Endpoints
export const TAG_API = {
  GET_ALL: "/tags",
  GET_QUESTIONS_BY_TAG: (tagId) => `/tags/${tagId}/questions`,
};

// User API Endpoints
export const USER_API = {
  STATS: (userId) => `/auth/stats/${userId}`,
};
