import { z } from 'zod'

export const roleFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do cargo.').max(255, 'Use no máximo 255 caracteres.'),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>
