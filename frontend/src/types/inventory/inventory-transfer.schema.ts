import { z } from 'zod'

import {
  fractionalUnits,
  isIsoDate,
  parseInventoryDecimal,
  positiveDecimal,
} from '@/types/inventory/inventory-entry.schema'
import type { CreateInventoryTransferRequest } from '@/types/inventory/inventory.types'

const transferItemSchema = z.object({
  inventoryItemId: z.string().min(1, 'Selecione um item com saldo na origem.'),
  unitOfMeasure: z.union([
    z.enum(['UN', 'CX', 'KIT', 'M', 'KG', 'L']),
    z.literal(''),
  ]),
  quantity: positiveDecimal('a quantidade', 11, 4),
})

export const inventoryTransferFormSchema = z
  .object({
    sourceLaboratoryId: z.string().min(1, 'Selecione o laboratório de origem.'),
    destinationLaboratoryId: z.string().min(1, 'Selecione o laboratório de destino.'),
    transferredAt: z.string().refine(isIsoDate, 'Informe uma data válida.'),
    notes: z.string().max(4000, 'Use no máximo 4.000 caracteres.'),
    items: z.array(transferItemSchema).min(1, 'Adicione ao menos um item.').max(200),
  })
  .superRefine((values, context) => {
    if (
      values.sourceLaboratoryId &&
      values.sourceLaboratoryId === values.destinationLaboratoryId
    ) {
      context.addIssue({
        code: 'custom',
        path: ['destinationLaboratoryId'],
        message: 'O destino deve ser diferente da origem.',
      })
    }

    const seenItemIds = new Set<string>()

    values.items.forEach((item, index) => {
      if (item.inventoryItemId && seenItemIds.has(item.inventoryItemId)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'inventoryItemId'],
          message: 'Cada item pode aparecer apenas uma vez nesta transferência.',
        })
      }
      if (item.inventoryItemId) seenItemIds.add(item.inventoryItemId)

      const quantity = parseInventoryDecimal(item.quantity)
      if (
        quantity !== null &&
        item.unitOfMeasure &&
        !fractionalUnits.includes(item.unitOfMeasure) &&
        !Number.isInteger(quantity)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'quantity'],
          message: 'Esta unidade aceita somente quantidades inteiras.',
        })
      }
    })
  })

export type InventoryTransferFormValues = z.infer<typeof inventoryTransferFormSchema>

export function toCreateInventoryTransferRequest(
  values: InventoryTransferFormValues,
): CreateInventoryTransferRequest {
  return {
    sourceLaboratoryId: values.sourceLaboratoryId,
    destinationLaboratoryId: values.destinationLaboratoryId,
    transferredAt: values.transferredAt,
    ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
    items: values.items.map((item) => ({
      inventoryItemId: item.inventoryItemId,
      quantity: parseInventoryDecimal(item.quantity) ?? 0,
    })),
  }
}
