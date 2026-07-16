import axiosInstance from '../api/axiosInstance.js';
import { AUTH_API } from '../config/config.js';

export const login = async (credentials) => {
  const res = await axiosInstance.post(AUTH_API.LOGIN, credentials);
  return res.data.data;
};

export const register = async (formData) => {
  const res = await axiosInstance.post(AUTH_API.REGISTER, formData);
  return res.data.data;
};
 