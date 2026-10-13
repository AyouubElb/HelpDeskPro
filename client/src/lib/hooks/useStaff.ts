import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../api/staff.api';

export const dashboardKeys = {
  stats: ['dashboard', 'stats'] as const,
};

export function useAgents() {
  // Staff accounts come from the seed only: they never change while the app is open.
  return useQuery({ queryKey: ['users', 'agents'], queryFn: staffApi.agents, staleTime: Infinity });
}

export function useDashboardStats() {
  return useQuery({ queryKey: dashboardKeys.stats, queryFn: staffApi.stats });
}
