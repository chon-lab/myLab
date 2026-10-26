import { z } from 'zod'

import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from '@/types/projects/project.types'

export const projectStatusValues = ['EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'SUSPENSO'] as const

export const projectFormSchema = z
  .object({
    laboratoryId: z.string().min(1, 'Selecione o laboratório.'),
    researchLineId: z.string().min(1, 'Selecione a linha de pesquisa.'),
    name: z
      .string()
      .trim()
      .min(1, 'Informe o nome do projeto.')
      .max(255, 'Use no máximo 255 caracteres.'),
    description: z.string().trim().max(1000, 'Use no máximo 1000 caracteres.'),
    objective: z.string().trim().min(1, 'Informe o objetivo do projeto.'),
    status: z.enum(projectStatusValues, { message: 'Selecione a situação do projeto.' }),
    startDate: z.string().min(1, 'Informe a data de início.'),
    endDate: z.string(),
    knowledgeAreas: z
      .string()
      .refine(
        (value) => splitKnowledgeAreas(value).every((area) => area.length <= 500),
        'Cada área deve ter no máximo 500 caracteres.',
      ),
  })
  .refine((values) => !values.endDate || values.endDate >= values.startDate, {
    path: ['endDate'],
    message: 'A data de término não pode ser anterior à de início.',
  })

export type ProjectFormValues = z.infer<typeof projectFormSchema>

function splitKnowledgeAreas(value: string) {
  return [...new Set(value.split('\n').map((area) => area.trim()).filter(Boolean))]
}

export function toProjectFormValues(project?: Project | null): ProjectFormValues {
  return {
    laboratoryId: project?.laboratoryId ?? '',
    researchLineId: project?.researchLineId ?? '',
    name: project?.name ?? '',
    description: project?.description ?? '',
    objective: project?.objective ?? '',
    status: project?.status ?? 'EM_ANDAMENTO',
    startDate: project?.startDate ?? '',
    endDate: project?.endDate ?? '',
    knowledgeAreas: (project?.knowledgeAreas ?? []).join('\n'),
  }
}

export function toUpdateProjectPayload(values: ProjectFormValues): UpdateProjectRequest {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    objective: values.objective.trim(),
    status: values.status,
    startDate: values.startDate,
    endDate: values.endDate || undefined,
    knowledgeAreas: splitKnowledgeAreas(values.knowledgeAreas),
  }
}

export function toCreateProjectPayload(values: ProjectFormValues): CreateProjectRequest {
  return { ...toUpdateProjectPayload(values), researchLineId: values.researchLineId }
}

export function toProjectFormFieldPath(apiField: string): keyof ProjectFormValues {
  if (apiField.startsWith('knowledgeAreas')) return 'knowledgeAreas'
  const fields = Object.keys(toProjectFormValues()) as (keyof ProjectFormValues)[]
  return fields.find((field) => field === apiField) ?? 'name'
}
