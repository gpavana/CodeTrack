import api from './axios';

export const userApi = {
  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/users/me/password', data);
    return response.data;
  },
};
