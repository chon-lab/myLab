import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api-client'
import { publishApiErrorToast } from '@/lib/api-error-toasts'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: publishApiErrorToast }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressGlobalErrorToast) return
      publishApiErrorToast(error)
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
})
