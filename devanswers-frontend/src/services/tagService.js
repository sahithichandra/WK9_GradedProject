import axiosInstance from '../api/axiosInstance.js';
import { TAG_API } from '../config/config.js';

export const getAllTags = async () => {
  const res = await axiosInstance.get(TAG_API.GET_ALL);
  return res.data.data || res.data || [];
};

export const getQuestionsByTag = async (tagId) => {
  const res = await axiosInstance.get(TAG_API.GET_QUESTIONS_BY_TAG(tagId));
  return res.data.data || res.data || [];
};
