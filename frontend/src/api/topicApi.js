import api from './axios';

export const topicApi = {
  getTopics: async () => {
    const response = await api.get('/topics');
    return response.data;
  },

  getProblemsByTopic: async (topic) => {
    const response = await api.get(`/topics/${encodeURIComponent(topic)}/problems`);
    return response.data;
  },
};
