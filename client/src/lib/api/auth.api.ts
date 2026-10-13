import axios from 'axios';
import { api } from './client';
import type { User } from '../../types';
import type { LoginInput } from '../schemas/auth.schema';

export const authApi = {
  login: async (body: LoginInput): Promise<User> => {
    const { data } = await api.post<User>('/auth/login', body);
    return data;
  },

  // Logged out is a normal answer here, not an error.
  me: async (): Promise<User | null> => {
    try {
      const { data } = await api.get<User>('/auth/me');
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return null;
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
