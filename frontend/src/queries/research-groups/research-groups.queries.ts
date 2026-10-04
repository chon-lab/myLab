import { queryOptions, useQuery } from '@tanstack/react-query'

import { researchGroupsService } from '@/services/research-groups/research-groups.service'

export const researchGroupsKeys = {
  all: ['research-groups'] as const,
  lists: () => [...researchGroupsKeys.all, 'list'] as const,
}

export const researchGroupsQueryOptions = queryOptions({
  queryKey: researchGroupsKeys.lists(),
  queryFn: () => researchGroupsService.list(),
})

export function useResearchGroupsQuery() {
  return useQuery(researchGroupsQueryOptions)
}
