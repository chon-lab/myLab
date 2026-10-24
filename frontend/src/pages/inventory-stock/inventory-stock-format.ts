import type {
  InventoryItem,
  InventoryItemType,
  InventoryLaboratoryStockBreakdown,
  InventoryMovementReason,
  InventoryMovementType,
  InventoryUnitOfMeasure,
} from '@/types/inventory/inventory.types'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const quantityFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
})

const unitLabels: Record<InventoryUnitOfMeasure, string> = {
  UN: 'un',
  CX: 'cx',
  KIT: 'kit',
  M: 'm',
  KG: 'kg',
  L: 'L',
}

const itemTypeLabels: Record<InventoryItemType, string> = {
  PERMANENT: 'Durável',
  CONSUMABLE: 'Consumo',
}

const movementTypeLabels: Record<InventoryMovementType, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Saída',
  TRANSFER: 'Transferência',
}

const movementReasonLabels: Record<InventoryMovementReason, string> = {
  PURCHASE: 'Compra',
  DONATION: 'Doação',
  CONSUMPTION: 'Consumo',
  DISPOSAL: 'Descarte',
  LOSS: 'Perda',
  INTERNAL_TRANSFER: 'Transferência interna',
}

export function formatCurrencyBRL(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatQuantity(value: number) {
  return quantityFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatUnitOfMeasure(unit: InventoryUnitOfMeasure) {
  return unitLabels[unit] ?? unit.toLowerCase()
}

export function formatItemTypeLabel(itemType: InventoryItemType) {
  return itemTypeLabels[itemType]
}

export function formatMovementTypeLabel(movementType: InventoryMovementType) {
  return movementTypeLabels[movementType]
}

export function formatMovementReasonLabel(reason: InventoryMovementReason) {
  return movementReasonLabels[reason]
}

export function formatMovementDate(isoDate: string) {
  const parts = isoDate.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return isoDate
}

export function resolveItemEffectiveLaboratoryId(
  selectedLaboratoryId: string | null,
  laboratoryBreakdown?: InventoryLaboratoryStockBreakdown[],
) {
  if (selectedLaboratoryId) return selectedLaboratoryId
  if (laboratoryBreakdown && laboratoryBreakdown.length === 1) {
    return laboratoryBreakdown[0].laboratoryId
  }
  return null
}

export function resolveItemSubtitle(
  selectedLaboratoryName: string | null,
  laboratoryBreakdown?: InventoryLaboratoryStockBreakdown[],
  catalogItem?: InventoryItem,
) {
  if (selectedLaboratoryName) return selectedLaboratoryName
  if (laboratoryBreakdown && laboratoryBreakdown.length > 0) {
    return laboratoryBreakdown.map((entry) => entry.laboratoryName).join(' • ')
  }
  if (catalogItem?.description?.trim()) {
    return catalogItem.description.trim()
  }
  return 'Todos os laboratórios'
}

export function buildInventoryShortcutPath(
  researchGroupId: string,
  destination: 'entradas' | 'saidas' | 'transferencias',
  params: {
    itemId?: string | null
    laboratoryId?: string | null
  } = {},
) {
  const searchParams = new URLSearchParams()

  if (params.itemId) {
    searchParams.set('itemId', params.itemId)
  }

  if (params.laboratoryId) {
    searchParams.set('laboratoryId', params.laboratoryId)
    if (destination === 'transferencias') {
      searchParams.set('sourceLaboratoryId', params.laboratoryId)
    }
  }

  if (destination === 'entradas') {
    searchParams.set('openEntry', 'true')
  }

  if (destination === 'saidas') {
    searchParams.set('openExit', 'true')
  }

  const query = searchParams.toString()
  const basePath = `/grupos/${researchGroupId}/estoque/${destination}`
  return query ? `${basePath}?${query}` : basePath
}

