import type { InventoryMovement } from '@/types/inventory/inventory.types'

const exitReasonLabels: Partial<Record<InventoryMovement['reason'], string>> = {
  CONSUMPTION: 'Consumo',
  DISPOSAL: 'Descarte',
  LOSS: 'Perda',
}

export function describeMovement(movement: InventoryMovement) {
  const { movementType, reason, externalSourceName, notes } = movement

  if (movementType === 'ENTRY') {
    const label = reason === 'DONATION' ? 'Doação' : 'Compra'
    return externalSourceName ? `${label} de ${externalSourceName}` : label
  }

  if (movementType === 'EXIT') {
    const label = exitReasonLabels[reason] ?? 'Saída'
    return notes ? `${label}: ${notes}` : label
  }

  return notes ?? 'Transferência entre laboratórios'
}

export function movementLaboratories(movement: InventoryMovement) {
  const { movementType, sourceLaboratoryName, destinationLaboratoryName } = movement

  if (movementType === 'ENTRY') return destinationLaboratoryName ?? '—'
  if (movementType === 'EXIT') return sourceLaboratoryName ?? '—'

  return `${sourceLaboratoryName ?? '—'} → ${destinationLaboratoryName ?? '—'}`
}

export function movementTotalValue(movement: InventoryMovement) {
  return movement.items.reduce((total, item) => total + item.totalValue, 0)
}

export function sortByMostRecent(movements: InventoryMovement[]) {
  return [...movements].sort(
    (first, second) =>
      second.occurredAt.localeCompare(first.occurredAt) ||
      second.createdAt.localeCompare(first.createdAt),
  )
}
