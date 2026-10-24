import { api } from '@/lib/api-client'
import type {
  CreateInventoryEntryRequest,
  CreateInventoryExitRequest,
  CreateInventoryTransferRequest,
  InventoryEntryFilters,
  InventoryEntryDocumentSummary,
  InventoryEntryHistoryRecord,
  InventoryEntryDocumentUploadRequest,
  InventoryExitHistoryRecord,
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

  listEntries: (researchGroupId: string, filters: InventoryEntryFilters = {}) =>
    api.get<InventoryEntryHistoryRecord[]>(
      `/api/v1/research-groups/${researchGroupId}/inventory/entries${buildQueryString({
        laboratoryId: filters.laboratoryId,
        source: filters.source,
        inventoryItemId: filters.inventoryItemId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      })}`,
    ),

  getEntry: (entryId: string) =>
    api.get<InventoryEntryHistoryRecord>(`/api/v1/inventory/entries/${entryId}`),

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

  listEntryDocuments: (entryId: string) =>
    api.get<InventoryEntryDocumentSummary[]>(`/api/v1/inventory/entries/${entryId}/documents`),

  uploadEntryDocument: (entryId: string, body: InventoryEntryDocumentUploadRequest) => {
    const formData = new FormData()
    formData.append('file', body.file)
    return api.post<InventoryEntryDocumentSummary>(
      `/api/v1/inventory/entries/${entryId}/documents/file`,
      formData,
    )
  },

  downloadEntryDocument: (entryId: string, documentId: string) =>
    api.download(`/api/v1/inventory/entries/${entryId}/documents/${documentId}/file`),

  deleteEntryDocument: (entryId: string, documentId: string) =>
    api.delete<void>(`/api/v1/inventory/entries/${entryId}/documents/${documentId}`),

  listExits: (researchGroupId: string) =>
    api.get<InventoryExitHistoryRecord[]>(
      `/api/v1/research-groups/${researchGroupId}/inventory/exits`,
    ),

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

