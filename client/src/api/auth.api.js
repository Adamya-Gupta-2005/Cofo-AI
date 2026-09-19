import { axiosInstance } from './axiosInstance.js';

export const authApi = {
  register: async (data) => {
    const res = await axiosInstance.post('/api/v1/auth/register', data);
    return res.data;
  },
  login: async (data) => {
    const res = await axiosInstance.post('/api/v1/auth/login', data);
    return res.data;
  },
  logout: async () => {
    const res = await axiosInstance.post('/api/v1/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await axiosInstance.get('/api/v1/auth/me');
    return res.data;
  },
};
