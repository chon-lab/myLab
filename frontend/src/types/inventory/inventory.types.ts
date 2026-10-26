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

export type InventoryPurchaseType = 'FUNDING' | 'OTHER'

export type InventoryEntrySource = 'PURCHASE' | 'DONATION'

export type InventoryEntryStatus = 'CONFIRMED' | 'REVERSED'

export type InventoryEntryHistoryItem = {
  id: string
  inventoryItemId: string
  itemName: string
  itemType: InventoryItemType
  unitOfMeasure: InventoryUnitOfMeasure
  quantity: number
  historicalUnitValue: number
  batchNumber: string | null
  manufacturer: string | null
  expirationDate: string | null
}

export type InventoryEntryDocumentSummary = {
  id: string
  documentNumber: string | null
  issuer: string | null
  documentDate: string | null
  fileName: string | null
  contentType: string | null
  sizeBytes: number | null
  checksumSha256: string | null
  uploadedAt: string | null
  fileAvailable: boolean
}

export type InventoryEntryHistoryRecord = {
  id: string
  researchGroupId: string
  laboratoryId: string
  laboratoryName: string
  source: InventoryEntrySource
  purchaseType: InventoryPurchaseType | null
  sourceName: string
  receivedAt: string
  notes: string | null
  status: InventoryEntryStatus
  reversedAt: string | null
  reversalReason: string | null
  createdAt: string
  items: InventoryEntryHistoryItem[]
  documents: InventoryEntryDocumentSummary[]
}

export type InventoryEntryFilters = {
  laboratoryId?: string | null
  source?: InventoryEntrySource | null
  inventoryItemId?: string | null
  dateFrom?: string | null
  dateTo?: string | null
}

export type InventoryExitType = 'CONSUMPTION' | 'DISPOSAL' | 'LOSS'

export type InventoryExitStatus = 'CONFIRMED' | 'REVERSED'

export type InventoryExitHistoryItem = {
  id: string
  inventoryItemId: string
  itemName: string
  itemType: InventoryItemType
  unitOfMeasure: InventoryUnitOfMeasure
  quantity: number
  unitCost: number
  totalCost: number
}

export type InventoryExitHistoryRecord = {
  id: string
  researchGroupId: string
  laboratoryId: string
  laboratoryName: string
  type: InventoryExitType
  occurredAt: string
  notes: string | null
  status: InventoryExitStatus
  reversedAt: string | null
  reversalReason: string | null
  createdAt: string
  items: InventoryExitHistoryItem[]
}

export type InventoryExitFilters = {
  laboratoryId?: string | null
  type?: InventoryExitType | null
  inventoryItemId?: string | null
  dateFrom?: string | null
  dateTo?: string | null
}

export type LaboratoryStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'

export type InventoryLaboratory = {
  id: string
  researchGroupId: string
  name: string
  description: string | null
  status: LaboratoryStatus
  createdAt: string
  updatedAt: string
}

export type InventoryItem = {
  id: string
  researchGroupId: string
  name: string
  description: string | null
  itemType: InventoryItemType
  unitOfMeasure: InventoryUnitOfMeasure
  referenceUnitValue: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CreateInventoryItemRequest = {
  name: string
  description?: string
  itemType: InventoryItemType
  unitOfMeasure: InventoryUnitOfMeasure
  referenceUnitValue: number
}

export type UpdateInventoryItemRequest = {
  name: string
  description?: string
  referenceUnitValue: number
}

export type InventoryStockItem = {
  inventoryItemId: string
  itemName: string
  itemType: InventoryItemType
  unitOfMeasure: InventoryUnitOfMeasure
  quantity: number
  totalValue: number
}

export type InventoryStockResponse = {
  researchGroupId: string
  laboratoryId: string | null
  items: InventoryStockItem[]
  totalValue: number
}

export type InventoryLaboratoryStockBreakdown = {
  laboratoryId: string
  laboratoryName: string
  quantity: number
  totalValue: number
}

export type InventoryMovementHistoryItem = {
  id: string
  inventoryItemId: string
  itemName: string
  quantity: number
  unitCost: number
  totalValue: number
  batchNumber: string | null
  manufacturer: string | null
  expirationDate: string | null
}

export type InventoryMovementHistoryRecord = {
  id: string
  researchGroupId: string
  movementType: InventoryMovementType
  reason: InventoryMovementReason
  purchaseType: InventoryPurchaseType | null
  sourceLaboratoryId: string | null
  sourceLaboratoryName: string | null
  destinationLaboratoryId: string | null
  destinationLaboratoryName: string | null
  externalSourceName: string | null
  occurredAt: string
  notes: string | null
  status: InventoryMovementStatus
  reversedAt: string | null
  reversalReason: string | null
  createdAt: string
  items: InventoryMovementHistoryItem[]
}

export type InventoryMovementFilters = {
  laboratoryId?: string | null
  inventoryItemId?: string | null
  movementType?: InventoryMovementType | null
  reason?: InventoryMovementReason | null
  status?: InventoryMovementStatus | null
  dateFrom?: string | null
  dateTo?: string | null
}

export type CreateInventoryEntryItemRequest = {
  inventoryItemId: string
  quantity: number
  historicalUnitValue: number
  batchNumber?: string
  manufacturer?: string
  expirationDate?: string
}

export type CreateInventoryEntryRequest = {
  laboratoryId: string
  source: InventoryEntrySource
  purchaseType?: InventoryPurchaseType
  sourceName: string
  receivedAt: string
  notes?: string
  items: CreateInventoryEntryItemRequest[]
}

export type CreateInventoryExitItemRequest = {
  inventoryItemId: string
  quantity: number
}

export type CreateInventoryExitRequest = {
  laboratoryId: string
  type: InventoryExitType
  occurredAt: string
  notes?: string
  items: CreateInventoryExitItemRequest[]
}

export type CreateInventoryTransferItemRequest = {
  inventoryItemId: string
  quantity: number
}

export type CreateInventoryTransferRequest = {
  sourceLaboratoryId: string
  destinationLaboratoryId: string
  transferredAt: string
  notes?: string
  items: CreateInventoryTransferItemRequest[]
}

export type ReverseInventoryMovementRequest = {
  reason: string
}

export type InventoryEntryDocumentUploadRequest = {
  file: File
}

