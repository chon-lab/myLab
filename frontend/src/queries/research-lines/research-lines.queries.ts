import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { researchLinesService } from '@/services/research-lines/research-lines.service'
import type {
  CreateResearchLineRequest,
  ResearchLine,
  ResearchLineUsageCounts,
  UpdateResearchLineRequest,
} from '@/types/research-lines/research-line.types'

export const researchLinesKeys = {
  all: ['research-lines'] as const,
  lists: () => [...researchLinesKeys.all, 'list'] as const,
  listByGroup: (researchGroupId: string) =>
    [...researchLinesKeys.lists(), researchGroupId] as const,
  details: () => [...researchLinesKeys.all, 'detail'] as const,
  detail: (id: string) => [...researchLinesKeys.details(), id] as const,
  usage: () => [...researchLinesKeys.all, 'usage'] as const,
  membersByGroup: (researchGroupId: string) =>
    [...researchLinesKeys.usage(), 'members', researchGroupId] as const,
  projectsByGroup: (researchGroupId: string) =>
    [...researchLinesKeys.usage(), 'projects', researchGroupId] as const,
}

export const researchLinesByGroupQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: researchLinesKeys.listByGroup(researchGroupId),
    queryFn: () => researchLinesService.listByGroup(researchGroupId),
  })

export const researchLineQueryOptions = (id: string) =>
  queryOptions({
    queryKey: researchLinesKeys.detail(id),
    queryFn: () => researchLinesService.get(id),
  })

export const groupMembersUsageQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: researchLinesKeys.membersByGroup(researchGroupId),
    queryFn: () => researchLinesService.listGroupMembers(researchGroupId),
  })

export const groupProjectsUsageQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: researchLinesKeys.projectsByGroup(researchGroupId),
    queryFn: async () => {
      const laboratories = await researchLinesService.listGroupLaboratories(researchGroupId)
      if (laboratories.length === 0) return []
      const projectLists = await Promise.all(
        laboratories.map((laboratory) => researchLinesService.listLaboratoryProjects(laboratory.id)),
      )
      return projectLists.flat()
    },
  })

export function useResearchLinesQuery(researchGroupId: string) {
  return useQuery(researchLinesByGroupQueryOptions(researchGroupId))
}

export function useResearchLineQuery(id: string | null, fallback?: ResearchLine) {
  return useQuery({
    ...researchLineQueryOptions(id ?? ''),
    enabled: Boolean(id),
    placeholderData: fallback,
  })
}

export function useResearchLineUsageCountsQuery(
  researchGroupId: string,
  researchLines: ResearchLine[],
): ResearchLineUsageCounts {
  const membersQuery = useQuery(groupMembersUsageQueryOptions(researchGroupId))
  const projectsQuery = useQuery(groupProjectsUsageQueryOptions(researchGroupId))

  const membersCountByLineId = membersQuery.data
    ? researchLines.reduce<Record<string, number>>((accumulator, line) => {
        accumulator[line.id] = membersQuery.data.filter(
          (member) => member.active && member.researchLineIds?.includes(line.id),
        ).length
        return accumulator
      }, {})
    : null

  const projectsCountByLineId = projectsQuery.data
    ? researchLines.reduce<Record<string, number>>((accumulator, line) => {
        accumulator[line.id] = projectsQuery.data.filter(
          (project) => project.researchLineId === line.id,
        ).length
        return accumulator
      }, {})
    : null

  return {
    membersCountByLineId,
    projectsCountByLineId,
  }
}

export function useCreateResearchLineMutation(researchGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateResearchLineRequest) =>
      researchLinesService.create(researchGroupId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: researchLinesKeys.all }),
  })
}

export function useUpdateResearchLineMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateResearchLineRequest }) =>
      researchLinesService.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: researchLinesKeys.all }),
  })
}

export function useDeleteResearchLineMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => researchLinesService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: researchLinesKeys.detail(id) })
      return queryClient.invalidateQueries({ queryKey: researchLinesKeys.all })
    },
  })
}

