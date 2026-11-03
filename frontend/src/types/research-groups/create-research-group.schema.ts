import { z } from 'zod'

import type { CreateResearchGroupRequest } from '@/types/research-groups/research-group.types'

const requiredText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max, `Use no máximo ${max} caracteres.`)

export const createResearchGroupFormSchema = z.object({
  cnpqId: requiredText(64, 'Informe o identificador do grupo no CNPq.'),
  name: requiredText(255, 'Informe o nome do grupo.'),
  situation: requiredText(50, 'Informe a situação do grupo.'),
  formationYear: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, 'Informe um ano válido.')
    .refine(
      (value) => Number(value) >= 1 && Number(value) <= new Date().getFullYear(),
      'O ano de formação não pode ser posterior ao ano atual.',
    ),
  predominantArea: requiredText(500, 'Informe a área predominante.'),
  institutionName: requiredText(255, 'Informe a instituição.'),
})

export type CreateResearchGroupFormValues = z.infer<typeof createResearchGroupFormSchema>

export function toCreateResearchGroupRequest(
  values: CreateResearchGroupFormValues,
): CreateResearchGroupRequest {
  return {
    cnpqId: values.cnpqId,
    name: values.name,
    situation: values.situation,
    formationYear: Number(values.formationYear),
    predominantArea: values.predominantArea,
    institutionName: values.institutionName,
    institutionUnit: null,
    sourceUrl: null,
    repercussions: null,
    address: null,
    contacts: [],
  }
}
