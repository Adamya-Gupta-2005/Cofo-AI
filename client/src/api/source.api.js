import { axiosInstance } from './axiosInstance.js';

export const sourceApi = {
  createSource: async (formDataOrJson, isMultipart = false) => {
    const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await axiosInstance.post('/api/v1/sources', formDataOrJson, { headers });
    return res.data;
  },
  getSourceById: async (id) => {
    const res = await axiosInstance.get(`/api/v1/sources/${id}`);
    return res.data;
  },
  getSources: async (page = 1, limit = 20) => {
    const res = await axiosInstance.get(`/api/v1/sources?page=${page}&limit=${limit}`);
    return res.data;
  },
  analyzeSource: async (id) => {
    const res = await axiosInstance.post(`/api/v1/sources/${id}/analyze`);
    return res.data;
  },
};
