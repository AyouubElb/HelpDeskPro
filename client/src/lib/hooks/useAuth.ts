import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { authApi } from '../api/auth.api';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useMe() {
  return useQuery({ queryKey: authKeys.me, queryFn: authApi.me, staleTime: Infinity });
}

/** Only for screens behind ProtectedRoute, where the user is always loaded. */
export function useCurrentUser() {
  const { data: user } = useMe();
  if (!user) throw new Error('useCurrentUser used outside ProtectedRoute');
  return user;
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.login,
    meta: { inlineError: true },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
      navigate('/', { replace: true });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(authKeys.me, null);
      navigate('/login', { replace: true });
    },
  });
}
