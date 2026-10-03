import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Credentials } from '@/types/auth/auth.types'
import { authService } from '@/services/auth/auth.service'

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
}

export const sessionQueryOptions = queryOptions({
  queryKey: authKeys.session(),
  queryFn: () => authService.getSession(),
  staleTime: Infinity,
})

export function useSessionQuery() {
  return useQuery(sessionQueryOptions)
}

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: Credentials) => authService.login(credentials),
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.session(), session)
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session(), null)
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.all[0] })
    },
  })
}
