import { z } from 'zod'

export const inventoryEntryReverseSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Informe o motivo do estorno.')
    .max(2000, 'Use no máximo 2.000 caracteres.'),
})

export type InventoryEntryReverseFormValues = z.infer<typeof inventoryEntryReverseSchema>
