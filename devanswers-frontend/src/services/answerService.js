import axiosInstance from "../api/axiosInstance.js";
import { ANSWER_API } from "../config/config.js";

export const upvoteAnswer = async (answerId, token) => {
  const res = await axiosInstance.post(
    ANSWER_API.UPVOTE(answerId),
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data.data;
};

export const downvoteAnswer = async (answerId, token) => {
  const res = await axiosInstance.post(
    ANSWER_API.DOWNVOTE(answerId),
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data.data;
};
