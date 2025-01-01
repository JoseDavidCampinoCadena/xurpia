import axios from './axios';
import { User } from '../types/api.types';

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  name: string;
}

export const authApi = {
  login: (data: LoginData) => {
    return axios.post<AuthResponse>('/auth/login', data);
  },

  register: (data: RegisterData) => {
    return axios.post<AuthResponse>('/auth/register', data);
  },
}; 