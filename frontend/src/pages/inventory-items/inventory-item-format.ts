import type { InventoryUnitOfMeasure } from '@/types/inventory/inventory.types'

export const unitOfMeasureDescriptions: Record<InventoryUnitOfMeasure, string> = {
  UN: 'Unidade',
  CX: 'Caixa',
  KIT: 'Kit',
  M: 'Metro, aceita 0,5',
  KG: 'Quilo, aceita 0,25',
  L: 'Litro, aceita 1,5',
}

export function formatItemStatusLabel(active: boolean) {
  return active ? 'Ativo' : 'Arquivado'
}
