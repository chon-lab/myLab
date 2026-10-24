import { z } from 'zod'

import {
  fractionalUnits,
  isIsoDate,
  parseInventoryDecimal,
  positiveDecimal,
} from '@/types/inventory/inventory-entry.schema'
import type { CreateInventoryExitRequest } from '@/types/inventory/inventory.types'

const exitItemSchema = z.object({
  inventoryItemId: z.string().min(1, 'Selecione um item com saldo.'),
  unitOfMeasure: z.union([
    z.enum(['UN', 'CX', 'KIT', 'M', 'KG', 'L']),
    z.literal(''),
  ]),
  quantity: positiveDecimal('a quantidade', 11, 4),
})

export const inventoryExitFormSchema = z
  .object({
    type: z.enum(['CONSUMPTION', 'DISPOSAL', 'LOSS']),
    laboratoryId: z.string().min(1, 'Selecione o laboratório de origem.'),
    occurredAt: z.string().refine(isIsoDate, 'Informe uma data válida.'),
    notes: z.string().max(4000, 'Use no máximo 4.000 caracteres.'),
    items: z.array(exitItemSchema).min(1, 'Adicione ao menos um item.').max(200),
  })
  .superRefine((values, context) => {
    const seenItemIds = new Set<string>()

    values.items.forEach((item, index) => {
      if (item.inventoryItemId && seenItemIds.has(item.inventoryItemId)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'inventoryItemId'],
          message: 'Cada item pode aparecer apenas uma vez nesta saída.',
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

export type InventoryExitFormValues = z.infer<typeof inventoryExitFormSchema>

export function toCreateInventoryExitRequest(
  values: InventoryExitFormValues,
): CreateInventoryExitRequest {
  return {
    laboratoryId: values.laboratoryId,
    type: values.type,
    occurredAt: values.occurredAt,
    ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
    items: values.items.map((item) => ({
      inventoryItemId: item.inventoryItemId,
      quantity: parseInventoryDecimal(item.quantity) ?? 0,
    })),
  }
}
