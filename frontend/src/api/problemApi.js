import api from './axios';

export const problemApi = {
  getProblems: async (params = {}) => {
    const response = await api.get('/problems', { params });
    return response.data;
  },

  getProblemById: async (id) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  createProblem: async (problemData) => {
    const response = await api.post('/problems', problemData);
    return response.data;
  },

  updateProblem: async (id, problemData) => {
    const response = await api.put(`/problems/${id}`, problemData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/problems/${id}/status`, { status });
    return response.data;
  },

  deleteProblem: async (id) => {
    const response = await api.delete(`/problems/${id}`);
    return response.data;
  },
};
