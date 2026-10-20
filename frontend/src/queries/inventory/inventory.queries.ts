import { queryOptions, useQueries, useQuery } from '@tanstack/react-query'

import { inventoryService } from '@/services/inventory/inventory.service'
import type { Laboratory } from '@/types/laboratories/laboratory.types'
import type { InventoryStock } from '@/types/inventory/inventory.types'

export const inventoryKeys = {
  all: ['inventory'] as const,
  stocks: (researchGroupId: string) => [...inventoryKeys.all, researchGroupId, 'stock'] as const,
  stock: (researchGroupId: string, laboratoryId?: string) =>
    [...inventoryKeys.stocks(researchGroupId), laboratoryId ?? 'group'] as const,
  items: (researchGroupId: string) => [...inventoryKeys.all, researchGroupId, 'items'] as const,
  movements: (researchGroupId: string) =>
    [...inventoryKeys.all, researchGroupId, 'movements'] as const,
}

export const inventoryStockQueryOptions = (researchGroupId: string, laboratoryId?: string) =>
  queryOptions({
    queryKey: inventoryKeys.stock(researchGroupId, laboratoryId),
    queryFn: () => inventoryService.getStock(researchGroupId, laboratoryId),
  })

export const inventoryItemsQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: inventoryKeys.items(researchGroupId),
    queryFn: () => inventoryService.listItems(researchGroupId),
  })

export const inventoryMovementsQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: inventoryKeys.movements(researchGroupId),
    queryFn: () => inventoryService.listMovements(researchGroupId),
  })

export function useInventoryStockQuery(researchGroupId: string) {
  return useQuery(inventoryStockQueryOptions(researchGroupId))
}

export function useInventoryItemsQuery(researchGroupId: string) {
  return useQuery(inventoryItemsQueryOptions(researchGroupId))
}

export function useInventoryMovementsQuery(researchGroupId: string) {
  return useQuery(inventoryMovementsQueryOptions(researchGroupId))
}

export type LaboratoryStock = {
  laboratory: Laboratory
  stock: InventoryStock
}

export function useLaboratoryStocksQuery(researchGroupId: string, laboratories: Laboratory[]) {
  return useQueries({
    queries: laboratories.map((laboratory) =>
      inventoryStockQueryOptions(researchGroupId, laboratory.id),
    ),
    combine: (results) => ({
      data: results.flatMap((result, index): LaboratoryStock[] =>
        result.data ? [{ laboratory: laboratories[index], stock: result.data }] : [],
      ),
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
    }),
  })
}
