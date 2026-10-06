import { queryOptions, useQueries } from '@tanstack/react-query'

import { projectsService } from '@/services/projects/projects.service'
import type { Laboratory } from '@/types/laboratories/laboratory.types'
import type { Project } from '@/types/projects/project.types'

export const projectsKeys = {
  all: ['projects'] as const,
  byLaboratory: (laboratoryId: string) =>
    [...projectsKeys.all, 'laboratory', laboratoryId] as const,
}

export const projectsByLaboratoryQueryOptions = (laboratoryId: string) =>
  queryOptions({
    queryKey: projectsKeys.byLaboratory(laboratoryId),
    queryFn: () => projectsService.listByLaboratory(laboratoryId),
  })

export function useProjectsByLaboratoriesQuery(laboratories: Laboratory[]) {
  return useQueries({
    queries: laboratories.map((laboratory) => projectsByLaboratoryQueryOptions(laboratory.id)),
    combine: (results) => ({
      data: results.flatMap((result): Project[] => result.data ?? []),
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
    }),
  })
}
