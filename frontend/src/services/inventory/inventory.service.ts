import { api } from '@/lib/api-client'
import type {
  InventoryItem,
  InventoryMovement,
  InventoryStock,
} from '@/types/inventory/inventory.types'

export const inventoryService = {
  getStock: (researchGroupId: string, laboratoryId?: string) => {
    const params = new URLSearchParams()
    if (laboratoryId) params.set('laboratoryId', laboratoryId)
    const query = params.toString()

    return api.get<InventoryStock>(
      `/api/v1/research-groups/${researchGroupId}/inventory/stock${query ? `?${query}` : ''}`,
    )
  },

  listItems: (researchGroupId: string) =>
    api.get<InventoryItem[]>(`/api/v1/research-groups/${researchGroupId}/inventory/items`),

  listMovements: (researchGroupId: string) =>
    api.get<InventoryMovement[]>(`/api/v1/research-groups/${researchGroupId}/inventory/movements`),
}
