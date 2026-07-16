import axiosInstance from "../api/axiosInstance.js";
import { QUESTION_API } from "../config/config.js";

export const getAllQuestions = async () => {
  const res = await axiosInstance.get(QUESTION_API.GET_ALL);
  return res.data.data || [];
};

export const getQuestionById = async (id) => {
  const res = await axiosInstance.get(QUESTION_API.GET_BY_ID(id));
  return res.data.data;
};

export const getAnswersByQuestionId = async (questionId) => {
  const res = await axiosInstance.get(
    QUESTION_API.GET_ANSWERS_BY_QUESTION_ID(questionId),
  );
  return res.data.data || [];
};

export const upvoteQuestion = async (questionId, token) => {
  const res = await axiosInstance.post(
    QUESTION_API.UPVOTE(questionId),
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data.data;
};

export const downvoteQuestion = async (questionId, token) => {
  const res = await axiosInstance.post(
    QUESTION_API.DOWNVOTE(questionId),
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data.data;
};

export const createQuestion = async (questionData, token) => {
  const res = await axiosInstance.post(QUESTION_API.CREATE, questionData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

export const createAnswerForQuestion = async (
  questionId,
  answerText,
  token,
) => {
  const res = await axiosInstance.post(
    QUESTION_API.CREATE_ANSWER_FOR_QUESTION(questionId),
    { answerText },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data.data;
};
