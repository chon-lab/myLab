import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { researchGroupsService } from '@/services/research-groups/research-groups.service'
import type { UpdateResearchGroupRequest } from '@/types/research-groups/research-group.types'

export const researchGroupsKeys = {
  all: ['research-groups'] as const,
  lists: () => [...researchGroupsKeys.all, 'list'] as const,
  details: () => [...researchGroupsKeys.all, 'detail'] as const,
  detail: (id: string) => [...researchGroupsKeys.details(), id] as const,
}

export const researchGroupsQueryOptions = queryOptions({
  queryKey: researchGroupsKeys.lists(),
  queryFn: () => researchGroupsService.list(),
})

export const researchGroupQueryOptions = (id: string) =>
  queryOptions({
    queryKey: researchGroupsKeys.detail(id),
    queryFn: () => researchGroupsService.get(id),
  })

export function useResearchGroupsQuery() {
  return useQuery(researchGroupsQueryOptions)
}

export function useResearchGroupQuery(id: string) {
  return useQuery(researchGroupQueryOptions(id))
}

export function useUpdateResearchGroupMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateResearchGroupRequest) => researchGroupsService.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: researchGroupsKeys.all }),
  })
}
