import { z } from 'zod'

import type {
  CreateInventoryEntryRequest,
  InventoryItem,
  InventoryUnitOfMeasure,
} from '@/types/inventory/inventory.types'

const fractionalUnits: InventoryUnitOfMeasure[] = ['M', 'KG', 'L']

export function parseInventoryDecimal(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(?:\.\d*)?$|^\.\d+$/.test(normalized)) return null

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function decimalScale(value: string) {
  const normalized = value.trim().replace(',', '.')
  const decimalPart = normalized.split('.')[1] ?? ''
  return decimalPart.replace(/0+$/, '').length
}

function integerDigits(value: string) {
  const normalized = value.trim().replace(',', '.')
  return (normalized.split('.')[0] ?? '').replace(/^[+-]?0*/, '').length
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

const positiveDecimal = (
  label: string,
  maxIntegerDigits: number,
  maxDecimalDigits: number,
) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${label}.`)
    .superRefine((value, context) => {
      const parsed = parseInventoryDecimal(value)

      if (parsed === null) {
        context.addIssue({ code: 'custom', message: `Informe ${label} com um número válido.` })
        return
      }

      if (parsed <= 0) {
        context.addIssue({ code: 'custom', message: `${label} deve ser maior que zero.` })
      }

      if (integerDigits(value) > maxIntegerDigits) {
        context.addIssue({ code: 'custom', message: `${label} ultrapassa o limite permitido.` })
      }

      if (decimalScale(value) > maxDecimalDigits) {
        context.addIssue({
          code: 'custom',
          message: `${label} aceita no máximo ${maxDecimalDigits} casas decimais.`,
        })
      }
    })

const entryItemSchema = z.object({
  inventoryItemId: z.string().min(1, 'Selecione um item do catálogo.'),
  unitOfMeasure: z.union([
    z.enum(['UN', 'CX', 'KIT', 'M', 'KG', 'L']),
    z.literal(''),
  ]),
  quantity: positiveDecimal('a quantidade', 11, 4),
  historicalUnitValue: positiveDecimal('o valor unitário histórico', 13, 2),
  batchNumber: z.string().max(100, 'Use no máximo 100 caracteres.').optional().or(z.literal('')),
  manufacturer: z.string().max(255, 'Use no máximo 255 caracteres.').optional().or(z.literal('')),
  expirationDate: z
    .string()
    .refine((value) => value === '' || isIsoDate(value), 'Informe uma data válida.')
    .optional(),
})

export const inventoryEntryFormSchema = z
  .object({
    laboratoryId: z.string().min(1, 'Selecione o laboratório de destino.'),
    source: z.enum(['PURCHASE', 'DONATION']),
    purchaseType: z.union([z.enum(['FUNDING', 'OTHER']), z.literal('')]),
    sourceName: z
      .string()
      .trim()
      .min(1, 'Informe a entidade de origem.')
      .max(255, 'Use no máximo 255 caracteres.'),
    receivedAt: z.string().refine(isIsoDate, 'Informe uma data válida.'),
    notes: z.string().max(4000, 'Use no máximo 4.000 caracteres.'),
    items: z.array(entryItemSchema).min(1, 'Adicione ao menos um item.').max(200),
  })
  .superRefine((values, context) => {
    if (values.source === 'PURCHASE' && !values.purchaseType) {
      context.addIssue({
        code: 'custom',
        path: ['purchaseType'],
        message: 'Selecione se a compra veio de fomento ou outra origem.',
      })
    }

    if (values.source === 'DONATION' && values.purchaseType) {
      context.addIssue({
        code: 'custom',
        path: ['purchaseType'],
        message: 'Doações não possuem tipo de compra.',
      })
    }

    const seenItemIds = new Set<string>()

    values.items.forEach((item, index) => {
      if (item.inventoryItemId && seenItemIds.has(item.inventoryItemId)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'inventoryItemId'],
          message: 'Cada item pode aparecer apenas uma vez nesta entrada.',
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

export type InventoryEntryFormValues = z.infer<typeof inventoryEntryFormSchema>

export function toCreateInventoryEntryRequest(
  values: InventoryEntryFormValues,
): CreateInventoryEntryRequest {
  const items = values.items.map((item) => ({
    inventoryItemId: item.inventoryItemId,
    quantity: parseInventoryDecimal(item.quantity) ?? 0,
    historicalUnitValue: parseInventoryDecimal(item.historicalUnitValue) ?? 0,
    ...(item.batchNumber?.trim() ? { batchNumber: item.batchNumber.trim() } : {}),
    ...(item.manufacturer?.trim() ? { manufacturer: item.manufacturer.trim() } : {}),
    ...(item.expirationDate ? { expirationDate: item.expirationDate } : {}),
  }))

  return {
    laboratoryId: values.laboratoryId,
    source: values.source,
    ...(values.source === 'PURCHASE' && values.purchaseType
      ? { purchaseType: values.purchaseType }
      : {}),
    sourceName: values.sourceName.trim(),
    receivedAt: values.receivedAt,
    ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
    items,
  }
}

export function getActiveInventoryItems(items: InventoryItem[] | undefined) {
  return (items ?? []).filter((item) => item.active)
}
