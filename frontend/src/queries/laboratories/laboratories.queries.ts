import { queryOptions, useQuery } from '@tanstack/react-query'

import { laboratoriesService } from '@/services/laboratories/laboratories.service'

export const laboratoriesKeys = {
  all: ['laboratories'] as const,
  list: (researchGroupId: string) => [...laboratoriesKeys.all, researchGroupId, 'list'] as const,
}

export const laboratoriesQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: laboratoriesKeys.list(researchGroupId),
    queryFn: () => laboratoriesService.listByGroup(researchGroupId),
  })

export function useLaboratoriesQuery(researchGroupId: string) {
  return useQuery(laboratoriesQueryOptions(researchGroupId))
}
