import { z } from 'zod'

const memberRoles = ['ADMIN', 'RESPONSIBLE', 'STUDENT', 'PARTNER'] as const

export const memberFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome completo.').max(255),
  socialName: z.string().max(255),
  email: z.union([z.email('Informe um e-mail válido.'), z.literal('')]).refine((value) => value.length <= 254),
  phone: z.string().max(30),
  cpf: z.string().max(14),
  academicDegree: z.string().max(100),
  areasOfExpertiseText: z.string(),
  role: z.union([z.enum(memberRoles), z.literal('')]),
  researchLineIds: z.array(z.uuid()),
}).superRefine((values, context) => {
  const areas = values.areasOfExpertiseText
    .split(/[,;\n]/)
    .map((area) => area.trim())
    .filter(Boolean)

  if (areas.some((area) => area.length > 500)) {
    context.addIssue({
      code: 'custom',
      path: ['areasOfExpertiseText'],
      message: 'Cada área de atuação pode ter no máximo 500 caracteres.',
    })
  }

  if (!values.role) {
    context.addIssue({ code: 'custom', path: ['role'], message: 'Selecione o perfil do vínculo.' })
  }

  if (values.role === 'PARTNER' && values.cpf.replace(/\D/g, '').length !== 11) {
    context.addIssue({ code: 'custom', path: ['cpf'], message: 'Informe o CPF para cadastrar um parceiro.' })
  }
})

export type MemberFormValues = z.infer<typeof memberFormSchema>
