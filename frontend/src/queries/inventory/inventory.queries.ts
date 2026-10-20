import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { inventoryService } from '@/services/inventory/inventory.service'
import type {
  CreateInventoryEntryRequest,
  CreateInventoryExitRequest,
  CreateInventoryTransferRequest,
  InventoryLaboratory,
  InventoryLaboratoryStockBreakdown,
  InventoryMovementFilters,
  ReverseInventoryMovementRequest,
} from '@/types/inventory/inventory.types'

export const inventoryKeys = {
  all: ['inventory'] as const,
  stocks: () => [...inventoryKeys.all, 'stock'] as const,
  stockByGroup: (researchGroupId: string) =>
    [...inventoryKeys.stocks(), researchGroupId] as const,
  stock: (researchGroupId: string, laboratoryId?: string | null) =>
    [...inventoryKeys.stockByGroup(researchGroupId), laboratoryId ?? 'all'] as const,
  stockBreakdownByGroup: (researchGroupId: string, laboratoryIds: string[]) =>
    [...inventoryKeys.stockByGroup(researchGroupId), 'breakdown', ...laboratoryIds] as const,
  items: () => [...inventoryKeys.all, 'items'] as const,
  itemsByGroup: (researchGroupId: string) =>
    [...inventoryKeys.items(), researchGroupId] as const,
  laboratories: () => [...inventoryKeys.all, 'laboratories'] as const,
  laboratoriesByGroup: (researchGroupId: string) =>
    [...inventoryKeys.laboratories(), researchGroupId] as const,
  movements: () => [...inventoryKeys.all, 'movements'] as const,
  movementsByGroup: (researchGroupId: string, filters: InventoryMovementFilters = {}) =>
    [
      ...inventoryKeys.movements(),
      researchGroupId,
      {
        laboratoryId: filters.laboratoryId ?? null,
        inventoryItemId: filters.inventoryItemId ?? null,
        movementType: filters.movementType ?? null,
        reason: filters.reason ?? null,
        status: filters.status ?? null,
        dateFrom: filters.dateFrom ?? null,
        dateTo: filters.dateTo ?? null,
      },
    ] as const,
  entries: () => [...inventoryKeys.all, 'entries'] as const,
  entriesByGroup: (researchGroupId: string) =>
    [...inventoryKeys.entries(), researchGroupId] as const,
  exits: () => [...inventoryKeys.all, 'exits'] as const,
  exitsByGroup: (researchGroupId: string) =>
    [...inventoryKeys.exits(), researchGroupId] as const,
  transfers: () => [...inventoryKeys.all, 'transfers'] as const,
  transfersByGroup: (researchGroupId: string) =>
    [...inventoryKeys.transfers(), researchGroupId] as const,
}

export const inventoryStockQueryOptions = (
  researchGroupId: string,
  laboratoryId?: string | null,
) =>
  queryOptions({
    queryKey: inventoryKeys.stock(researchGroupId, laboratoryId),
    queryFn: () => inventoryService.getStock(researchGroupId, laboratoryId),
  })

export const inventoryItemsByGroupQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: inventoryKeys.itemsByGroup(researchGroupId),
    queryFn: () => inventoryService.listItemsByGroup(researchGroupId),
  })

export const inventoryLaboratoriesByGroupQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: inventoryKeys.laboratoriesByGroup(researchGroupId),
    queryFn: () => inventoryService.listGroupLaboratories(researchGroupId),
  })

export const inventoryMovementsQueryOptions = (
  researchGroupId: string,
  filters: InventoryMovementFilters = {},
) =>
  queryOptions({
    queryKey: inventoryKeys.movementsByGroup(researchGroupId, filters),
    queryFn: () => inventoryService.listMovements(researchGroupId, filters),
  })

export function useInventoryStockQuery(
  researchGroupId: string,
  laboratoryId?: string | null,
) {
  return useQuery(inventoryStockQueryOptions(researchGroupId, laboratoryId))
}

export function useInventoryItemsQuery(researchGroupId: string) {
  return useQuery(inventoryItemsByGroupQueryOptions(researchGroupId))
}

export function useInventoryLaboratoriesQuery(researchGroupId: string) {
  return useQuery(inventoryLaboratoriesByGroupQueryOptions(researchGroupId))
}

export function useInventoryLaboratoryBreakdownsQuery(
  researchGroupId: string,
  laboratories: InventoryLaboratory[],
) {
  const laboratoryIds = laboratories.map((laboratory) => laboratory.id)

  return useQuery({
    queryKey: inventoryKeys.stockBreakdownByGroup(researchGroupId, laboratoryIds),
    enabled: laboratories.length > 0,
    queryFn: async () => {
      const responses = await Promise.all(
        laboratories.map(async (laboratory) => ({
          laboratory,
          stock: await inventoryService.getStock(researchGroupId, laboratory.id),
        })),
      )

      const breakdownByItemId: Record<string, InventoryLaboratoryStockBreakdown[]> = {}

      responses.forEach(({ laboratory, stock }) => {
        stock.items.forEach((stockItem) => {
          if (stockItem.quantity <= 0) return

          const list = breakdownByItemId[stockItem.inventoryItemId] ?? []
          list.push({
            laboratoryId: laboratory.id,
            laboratoryName: laboratory.name,
            quantity: stockItem.quantity,
            totalValue: stockItem.totalValue,
          })
          breakdownByItemId[stockItem.inventoryItemId] = list
        })
      })

      return breakdownByItemId
    },
  })
}

export function useInventoryMovementsQuery(
  researchGroupId: string,
  filters: InventoryMovementFilters = {},
  enabled = true,
) {
  return useQuery({
    ...inventoryMovementsQueryOptions(researchGroupId, filters),
    enabled,
  })
}

export async function invalidateInventoryGroupBalance(
  queryClient: QueryClient,
  researchGroupId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: inventoryKeys.stockByGroup(researchGroupId) }),
    queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() }),
    queryClient.invalidateQueries({ queryKey: inventoryKeys.entriesByGroup(researchGroupId) }),
    queryClient.invalidateQueries({ queryKey: inventoryKeys.exitsByGroup(researchGroupId) }),
    queryClient.invalidateQueries({ queryKey: inventoryKeys.transfersByGroup(researchGroupId) }),
  ])
}

export function useCreateInventoryEntryMutation(researchGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateInventoryEntryRequest) =>
      inventoryService.createEntry(researchGroupId, body),
    onSuccess: () => invalidateInventoryGroupBalance(queryClient, researchGroupId),
  })
}

export function useReverseInventoryEntryMutation(researchGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      entryId,
      body,
    }: {
      entryId: string
      body: ReverseInventoryMovementRequest
    }) => inventoryService.reverseEntry(entryId, body),
    onSuccess: () => invalidateInventoryGroupBalance(queryClient, researchGroupId),
  })
}

export function useCreateInventoryExitMutation(researchGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateInventoryExitRequest) =>
      inventoryService.createExit(researchGroupId, body),
    onSuccess: () => invalidateInventoryGroupBalance(queryClient, researchGroupId),
  })
}

export function useReverseInventoryExitMutation(researchGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      exitId,
      body,
    }: {
      exitId: string
      body: ReverseInventoryMovementRequest
    }) => inventoryService.reverseExit(exitId, body),
    onSuccess: () => invalidateInventoryGroupBalance(queryClient, researchGroupId),
  })
}

export function useCreateInventoryTransferMutation(researchGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateInventoryTransferRequest) =>
      inventoryService.createTransfer(researchGroupId, body),
    onSuccess: () => invalidateInventoryGroupBalance(queryClient, researchGroupId),
  })
}

export function useReverseInventoryTransferMutation(researchGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      transferId,
      body,
    }: {
      transferId: string
      body: ReverseInventoryMovementRequest
    }) => inventoryService.reverseTransfer(transferId, body),
    onSuccess: () => invalidateInventoryGroupBalance(queryClient, researchGroupId),
  })
}

