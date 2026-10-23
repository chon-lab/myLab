import { z } from 'zod'

import type {
  CreateInventoryItemRequest,
  InventoryItem,
  UpdateInventoryItemRequest,
} from '@/types/inventory/inventory.types'

export const inventoryItemTypeValues = ['CONSUMABLE', 'PERMANENT'] as const

export const inventoryUnitOfMeasureValues = ['UN', 'CX', 'KIT', 'M', 'KG', 'L'] as const

const currencyInputPattern = /^(R\$\s*)?(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/

export function parseCurrencyInput(value: string) {
  const normalized = value.replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.').trim()
  return normalized ? Number(normalized) : Number.NaN
}

export function formatCurrencyInput(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const inventoryItemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do item.')
    .max(255, 'Use no máximo 255 caracteres.'),
  description: z.string().trim().max(2000, 'Use no máximo 2000 caracteres.'),
  itemType: z.enum(inventoryItemTypeValues, { message: 'Selecione o tipo do item.' }),
  unitOfMeasure: z.enum(inventoryUnitOfMeasureValues, {
    message: 'Selecione a unidade de medida.',
  }),
  referenceUnitValue: z
    .string()
    .trim()
    .min(1, 'Informe o valor unitário de referência.')
    .regex(currencyInputPattern, 'Informe um valor como 189,00.')
    .refine((value) => parseCurrencyInput(value) >= 0.01, 'Informe um valor a partir de R$ 0,01.'),
})

export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>

export const emptyInventoryItemFormValues: InventoryItemFormValues = {
  name: '',
  description: '',
  itemType: 'CONSUMABLE',
  unitOfMeasure: 'UN',
  referenceUnitValue: '',
}

export function toInventoryItemFormValues(item?: InventoryItem | null): InventoryItemFormValues {
  if (!item) return emptyInventoryItemFormValues

  return {
    name: item.name,
    description: item.description ?? '',
    itemType: item.itemType,
    unitOfMeasure: item.unitOfMeasure,
    referenceUnitValue: formatCurrencyInput(item.referenceUnitValue),
  }
}

function optionalText(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function toCreateInventoryItemPayload(
  values: InventoryItemFormValues,
): CreateInventoryItemRequest {
  return {
    name: values.name.trim(),
    description: optionalText(values.description),
    itemType: values.itemType,
    unitOfMeasure: values.unitOfMeasure,
    referenceUnitValue: parseCurrencyInput(values.referenceUnitValue),
  }
}

export function toUpdateInventoryItemPayload(
  values: InventoryItemFormValues,
): UpdateInventoryItemRequest {
  return {
    name: values.name.trim(),
    description: optionalText(values.description),
    referenceUnitValue: parseCurrencyInput(values.referenceUnitValue),
  }
}

export function toInventoryItemFormFieldPath(apiField: string): keyof InventoryItemFormValues {
  if (apiField === 'description') return 'description'
  if (apiField === 'itemType') return 'itemType'
  if (apiField === 'unitOfMeasure') return 'unitOfMeasure'
  if (apiField === 'referenceUnitValue') return 'referenceUnitValue'
  return 'name'
}
