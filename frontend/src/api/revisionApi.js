import api from './axios';

export const revisionApi = {
  getRevisionCenter: async () => {
    const response = await api.get('/revisions');
    return response.data;
  },

  getDueRevisions: async () => {
    const response = await api.get('/revisions/due');
    return response.data;
  },

  completeRevision: async (id, data = {}) => {
    const response = await api.post(`/revisions/${id}/complete`, data);
    return response.data;
  },

  scheduleRevision: async (problemId, data) => {
    const response = await api.post(`/problems/${problemId}/revisions/schedule`, data);
    return response.data;
  },

  getProblemRevisions: async (problemId) => {
    const response = await api.get(`/problems/${problemId}/revisions`);
    return response.data;
  },
};
