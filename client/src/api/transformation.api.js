import { axiosInstance } from './axiosInstance.js';

export const transformationApi = {
  createTransformation: async (payload) => {
    const res = await axiosInstance.post('/api/v1/transformations', payload);
    return res.data;
  },
  getTransformationById: async (id) => {
    const res = await axiosInstance.get(`/api/v1/transformations/${id}`);
    return res.data;
  },
  getTransformations: async (page = 1, limit = 20) => {
    const res = await axiosInstance.get(`/api/v1/transformations?page=${page}&limit=${limit}`);
    return res.data;
  },
  deleteTransformation: async (id) => {
    const res = await axiosInstance.delete(`/api/v1/transformations/${id}`);
    return res.data;
  },
  exportAllZip: async (id) => {
    const res = await axiosInstance.post(`/api/v1/transformations/${id}/export-all`, null, {
      responseType: 'blob',
    });
    return res.data;
  },
};
