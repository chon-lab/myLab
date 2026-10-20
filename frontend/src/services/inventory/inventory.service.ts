import { api } from '@/lib/api-client'
import type {
  CreateInventoryEntryRequest,
  CreateInventoryExitRequest,
  CreateInventoryTransferRequest,
  InventoryItem,
  InventoryLaboratory,
  InventoryMovementFilters,
  InventoryMovementHistoryRecord,
  InventoryStockResponse,
  ReverseInventoryMovementRequest,
} from '@/types/inventory/inventory.types'

function buildQueryString(params: Record<string, string | null | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value.trim() !== '') {
      searchParams.set(key, value)
    }
  })

  const serialized = searchParams.toString()
  return serialized ? `?${serialized}` : ''
}

export const inventoryService = {
  getStock: (researchGroupId: string, laboratoryId?: string | null) =>
    api.get<InventoryStockResponse>(
      `/api/v1/research-groups/${researchGroupId}/inventory/stock${buildQueryString({
        laboratoryId,
      })}`,
    ),

  listItemsByGroup: (researchGroupId: string) =>
    api.get<InventoryItem[]>(`/api/v1/research-groups/${researchGroupId}/inventory/items`),

  listGroupLaboratories: (researchGroupId: string) =>
    api.get<InventoryLaboratory[]>(`/api/v1/research-groups/${researchGroupId}/laboratories`),

  listMovements: (researchGroupId: string, filters: InventoryMovementFilters = {}) =>
    api.get<InventoryMovementHistoryRecord[]>(
      `/api/v1/research-groups/${researchGroupId}/inventory/movements${buildQueryString({
        laboratoryId: filters.laboratoryId,
        inventoryItemId: filters.inventoryItemId,
        movementType: filters.movementType,
        reason: filters.reason,
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      })}`,
    ),

  createEntry: (researchGroupId: string, body: CreateInventoryEntryRequest) =>
    api.post<string | undefined>(
      `/api/v1/research-groups/${researchGroupId}/inventory/entries`,
      body,
    ),

  reverseEntry: (entryId: string, body: ReverseInventoryMovementRequest) =>
    api.post<void>(`/api/v1/inventory/entries/${entryId}/reverse`, body),

  createExit: (researchGroupId: string, body: CreateInventoryExitRequest) =>
    api.post<string | undefined>(
      `/api/v1/research-groups/${researchGroupId}/inventory/exits`,
      body,
    ),

  reverseExit: (exitId: string, body: ReverseInventoryMovementRequest) =>
    api.post<void>(`/api/v1/inventory/exits/${exitId}/reverse`, body),

  createTransfer: (researchGroupId: string, body: CreateInventoryTransferRequest) =>
    api.post<string | undefined>(
      `/api/v1/research-groups/${researchGroupId}/inventory/transfers`,
      body,
    ),

  reverseTransfer: (transferId: string, body: ReverseInventoryMovementRequest) =>
    api.post<void>(`/api/v1/inventory/transfers/${transferId}/reverse`, body),
}

