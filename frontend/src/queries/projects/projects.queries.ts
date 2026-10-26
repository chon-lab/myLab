import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { laboratoriesKeys } from '@/queries/laboratories/laboratories.queries'
import { researchLinesKeys } from '@/queries/research-lines/research-lines.queries'
import { projectsService } from '@/services/projects/projects.service'
import type { Laboratory } from '@/types/laboratories/laboratory.types'
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from '@/types/projects/project.types'

export const projectsKeys = {
  all: ['projects'] as const,
  lists: () => [...projectsKeys.all, 'list'] as const,
  listByLaboratory: (laboratoryId: string) => [...projectsKeys.lists(), laboratoryId] as const,
  details: () => [...projectsKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectsKeys.details(), id] as const,
}

export const projectsByLaboratoryQueryOptions = (laboratoryId: string) =>
  queryOptions({
    queryKey: projectsKeys.listByLaboratory(laboratoryId),
    queryFn: () => projectsService.listByLaboratory(laboratoryId),
  })

export const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: projectsKeys.detail(id),
    queryFn: () => projectsService.get(id),
  })

export function useLaboratoriesProjectsQuery(laboratories: Laboratory[]) {
  return useQueries({
    queries: laboratories.map((laboratory) => projectsByLaboratoryQueryOptions(laboratory.id)),
    combine: (results) => ({
      data: results.every((result) => result.isSuccess)
        ? results.flatMap((result) => result.data ?? [])
        : undefined,
      isPending: results.some((result) => result.isPending),
      error: results.find((result) => result.isError)?.error ?? null,
      refetch: () => Promise.all(results.map((result) => result.refetch())),
    }),
  })
}

export function useProjectQuery(id: string | null, fallback?: Project) {
  return useQuery({
    ...projectQueryOptions(id ?? ''),
    enabled: Boolean(id),
    placeholderData: fallback,
  })
}

function invalidateProjects(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: projectsKeys.all }),
    queryClient.invalidateQueries({ queryKey: laboratoriesKeys.projects() }),
    queryClient.invalidateQueries({ queryKey: researchLinesKeys.usage() }),
  ])
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ laboratoryId, body }: { laboratoryId: string; body: CreateProjectRequest }) =>
      projectsService.create(laboratoryId, body),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => invalidateProjects(queryClient),
  })
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProjectRequest }) =>
      projectsService.update(id, body),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => invalidateProjects(queryClient),
  })
}

type ProjectDocumentVariables = { projectId: string; documentId: string }

export function useUploadProjectDocumentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
      projectsService.uploadDocument(projectId, file),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsKeys.all }),
  })
}

export function useDownloadProjectDocumentMutation() {
  return useMutation({
    mutationFn: ({ projectId, documentId }: ProjectDocumentVariables) =>
      projectsService.downloadDocument(projectId, documentId),
    meta: { suppressGlobalErrorToast: true },
  })
}

export function useDeleteProjectDocumentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, documentId }: ProjectDocumentVariables) =>
      projectsService.deleteDocument(projectId, documentId),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsKeys.all }),
  })
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectsService.remove(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: projectsKeys.detail(id) })
      return invalidateProjects(queryClient)
    },
  })
}
