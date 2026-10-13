import axios from 'axios';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, getErrorMessage } from './api/client';
import { authKeys } from './hooks/useAuth';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { inlineError?: boolean };
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // A first load shows its error in the page; only a failed refresh of data already on screen gets a toast.
    onError: (error, query) => {
      if (query.state.data !== undefined) toast.error(getErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    // meta.inlineError: the screen shows the error next to the field or button.
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (!mutation.meta?.inlineError) toast.error(getErrorMessage(error));
    },
  }),
  defaultOptions: {
    queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: false },
  },
});

// Any 401 means the cookie is missing or expired: ProtectedRoute then sends you to /login.
api.interceptors.response.use(undefined, (error) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    queryClient.setQueryData(authKeys.me, null);
  }
  return Promise.reject(error);
});
