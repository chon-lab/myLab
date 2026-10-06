import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z
    .string()
    .min(1, 'Informe sua senha.')
    .min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  rememberMe: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
