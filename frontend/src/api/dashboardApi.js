import api from './axios';

export const dashboardApi = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getTopicProgress: async () => {
    const response = await api.get('/dashboard/topic-progress');
    return response.data;
  },

  getDifficultyDistribution: async () => {
    const response = await api.get('/dashboard/difficulty-distribution');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  },
};
