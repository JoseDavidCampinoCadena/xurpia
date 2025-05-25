import axios from './axios';

export interface User {
  id: number;
  email: string;
  name: string;
  description?: string;
  profileImage?: string;
  cvUrl?: string;
  gender?: string;
  interest?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  description?: string;
}

export const usersApi = {
  findByEmail: async (email: string): Promise<User> => {
    const { data } = await axios.get(`/users/search?email=${email}`);
    return data;
  },

  getAll: async (): Promise<User[]> => {
    const { data } = await axios.get('/users');
    return data;
  },

  updateUser: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await axios.patch(`/users/${id}`, payload);
    return data;
  },
  updateUserProfile: async (id: number, formData: FormData): Promise<User> => {
    const { data } = await axios.patch(`/users/${id}/profile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  changePassword: async (id: number, payload: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> => {
    const { data } = await axios.patch(`/users/${id}/password`, payload);
    return data;
  },
};