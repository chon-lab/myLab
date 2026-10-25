import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'

import { inventoryKeys, inventoryStockQueryOptions } from '@/queries/inventory/inventory.queries'
import { laboratoriesService } from '@/services/laboratories/laboratories.service'
import type { InventoryStockResponse } from '@/types/inventory/inventory.types'
import type {
  CreateLaboratoryRequest,
  Laboratory,
  LaboratoryMetric,
  LaboratoryMetrics,
  LaboratoryProjectSummary,
  LaboratoryStockSummary,
  UpdateLaboratoryRequest,
} from '@/types/laboratories/laboratory.types'

export const laboratoriesKeys = {
  all: ['laboratories'] as const,
  lists: () => [...laboratoriesKeys.all, 'list'] as const,
  listByGroup: (researchGroupId: string) =>
    [...laboratoriesKeys.lists(), researchGroupId] as const,
  details: () => [...laboratoriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...laboratoriesKeys.details(), id] as const,
  projects: () => [...laboratoriesKeys.all, 'projects'] as const,
  projectsByLaboratory: (laboratoryId: string) =>
    [...laboratoriesKeys.projects(), laboratoryId] as const,
}

export const laboratoriesByGroupQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: laboratoriesKeys.listByGroup(researchGroupId),
    queryFn: () => laboratoriesService.listByGroup(researchGroupId),
  })

export const laboratoryQueryOptions = (id: string) =>
  queryOptions({
    queryKey: laboratoriesKeys.detail(id),
    queryFn: () => laboratoriesService.get(id),
  })

export const laboratoryProjectsQueryOptions = (laboratoryId: string) =>
  queryOptions({
    queryKey: laboratoriesKeys.projectsByLaboratory(laboratoryId),
    queryFn: () => laboratoriesService.listProjects(laboratoryId),
  })

export function useLaboratoriesQuery(researchGroupId: string) {
  return useQuery(laboratoriesByGroupQueryOptions(researchGroupId))
}

export function useLaboratoryQuery(id: string | null, fallback?: Laboratory) {
  return useQuery({
    ...laboratoryQueryOptions(id ?? ''),
    enabled: Boolean(id),
    placeholderData: fallback,
  })
}

function toStockSummary(stock: InventoryStockResponse): LaboratoryStockSummary {
  return {
    totalValue: stock.totalValue,
    itemCount: stock.items.filter((item) => item.quantity > 0).length,
  }
}

function toMetricsByLaboratoryId<TData, TMetric>(
  laboratories: Laboratory[],
  results: UseQueryResult<TData>[],
  select: (data: TData) => TMetric,
) {
  return laboratories.reduce<Record<string, LaboratoryMetric<TMetric>>>(
    (accumulator, laboratory, index) => {
      const result = results[index]
      accumulator[laboratory.id] =
        result?.status === 'success'
          ? { status: 'success', data: select(result.data) }
          : { status: result?.status === 'error' ? 'error' : 'pending' }
      return accumulator
    },
    {},
  )
}

export function useLaboratoryMetricsQuery(
  researchGroupId: string,
  laboratories: Laboratory[],
): LaboratoryMetrics {
  const stockResults = useQueries({
    queries: laboratories.map((laboratory) =>
      inventoryStockQueryOptions(researchGroupId, laboratory.id),
    ),
  })
  const projectResults = useQueries({
    queries: laboratories.map((laboratory) => laboratoryProjectsQueryOptions(laboratory.id)),
  })

  return {
    stockByLaboratoryId: toMetricsByLaboratoryId(laboratories, stockResults, toStockSummary),
    projectCountByLaboratoryId: toMetricsByLaboratoryId(
      laboratories,
      projectResults,
      (projects: LaboratoryProjectSummary[]) => projects.length,
    ),
    stockError: stockResults.find((result) => result.isError)?.error ?? null,
    projectsError: projectResults.find((result) => result.isError)?.error ?? null,
  }
}

function invalidateLaboratoryLists(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: laboratoriesKeys.all }),
    queryClient.invalidateQueries({ queryKey: inventoryKeys.laboratories() }),
  ])
}

export function useCreateLaboratoryMutation(researchGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateLaboratoryRequest) =>
      laboratoriesService.create(researchGroupId, body),
    onSuccess: () => invalidateLaboratoryLists(queryClient),
  })
}

export function useUpdateLaboratoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateLaboratoryRequest }) =>
      laboratoriesService.update(id, body),
    onSuccess: () => invalidateLaboratoryLists(queryClient),
  })
}

export function useDeleteLaboratoryMutation(researchGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => laboratoriesService.remove(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: laboratoriesKeys.detail(id) })
      queryClient.removeQueries({ queryKey: laboratoriesKeys.projectsByLaboratory(id) })
      queryClient.removeQueries({ queryKey: inventoryKeys.stock(researchGroupId, id) })
      return Promise.all([
        invalidateLaboratoryLists(queryClient),
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.stock(researchGroupId),
          exact: true,
        }),
      ])
    },
  })
}
