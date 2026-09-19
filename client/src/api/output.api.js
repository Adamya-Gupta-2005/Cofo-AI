import { axiosInstance } from './axiosInstance.js';

export const outputApi = {
  getOutputById: async (id) => {
    const res = await axiosInstance.get(`/api/v1/outputs/${id}`);
    return res.data;
  },
  updateOutput: async (id, payload) => {
    const res = await axiosInstance.patch(`/api/v1/outputs/${id}`, payload);
    return res.data;
  },
  regenerateOutput: async (id) => {
    const res = await axiosInstance.post(`/api/v1/outputs/${id}/regenerate`);
    return res.data;
  },
  approveOutput: async (id) => {
    const res = await axiosInstance.post(`/api/v1/outputs/${id}/approve`);
    return res.data;
  },
  exportOutput: async (id, format = 'txt') => {
    const res = await axiosInstance.get(`/api/v1/outputs/${id}/export?format=${format}`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
