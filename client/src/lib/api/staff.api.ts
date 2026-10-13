import { api } from './client';
import type { DashboardStats, User } from '../../types';

export const staffApi = {
  agents: async (): Promise<User[]> => {
    const { data } = await api.get<{ data: User[] }>('/users', { params: { role: 'agent' } });
    return data.data;
  },

  stats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/dashboard/stats');
    return data;
  },
};
