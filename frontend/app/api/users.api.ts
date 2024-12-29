import axios from './axios';

export interface User {
  id: number;
  email: string;
  name: string;
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
}; 