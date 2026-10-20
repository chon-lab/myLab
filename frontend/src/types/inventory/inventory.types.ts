export type InventoryItemType = 'CONSUMABLE' | 'PERMANENT'

export type InventoryUnitOfMeasure = 'UN' | 'CX' | 'KIT' | 'M' | 'KG' | 'L'

export type InventoryMovementType = 'ENTRY' | 'EXIT' | 'TRANSFER'

export type InventoryMovementReason =
  | 'PURCHASE'
  | 'DONATION'
  | 'CONSUMPTION'
  | 'DISPOSAL'
  | 'LOSS'
  | 'INTERNAL_TRANSFER'

export type InventoryMovementStatus = 'CONFIRMED' | 'REVERSED'

export type InventoryItem = {
  id: string
  researchGroupId: string
  name: string
  description: string | null
  itemType: InventoryItemType
  unitOfMeasure: InventoryUnitOfMeasure
  referenceUnitValue: number
  active: boolean
}

export type InventoryStockItem = {
  inventoryItemId: string
  itemName: string
  itemType: InventoryItemType
  unitOfMeasure: InventoryUnitOfMeasure
  quantity: number
  totalValue: number
}

export type InventoryStock = {
  researchGroupId: string
  laboratoryId: string | null
  items: InventoryStockItem[]
  totalValue: number
}

export type InventoryMovementItem = {
  id: string
  inventoryItemId: string
  itemName: string
  quantity: number
  unitCost: number
  totalValue: number
}

export type InventoryMovement = {
  id: string
  researchGroupId: string
  movementType: InventoryMovementType
  reason: InventoryMovementReason
  sourceLaboratoryId: string | null
  sourceLaboratoryName: string | null
  destinationLaboratoryId: string | null
  destinationLaboratoryName: string | null
  externalSourceName: string | null
  occurredAt: string
  notes: string | null
  status: InventoryMovementStatus
  createdAt: string
  items: InventoryMovementItem[]
}

export const unitOfMeasureSymbols: Record<InventoryUnitOfMeasure, string> = {
  UN: 'un.',
  CX: 'cx.',
  KIT: 'kit',
  M: 'm',
  KG: 'kg',
  L: 'L',
}

export const movementTypeLabels: Record<InventoryMovementType, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Saída',
  TRANSFER: 'Transferência',
}
