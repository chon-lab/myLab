import { z } from 'zod'

import type {
  CreateResearchLineRequest,
  ResearchLine,
  UpdateResearchLineRequest,
} from '@/types/research-lines/research-line.types'

export function splitDelimitedItems(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export function mergeUniqueItems(existing: string[], additions: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of [...existing, ...additions]) {
    const trimmed = item.trim()
    if (!trimmed) continue
    const normalized = trimmed.toLocaleLowerCase('pt-BR')
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(trimmed)
  }

  return result
}

export const researchLineFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe o nome da linha de pesquisa.')
      .max(255, 'Use no máximo 255 caracteres.'),
    objective: z.string().trim().min(1, 'Informe o objetivo da linha de pesquisa.'),
    keywords: z.array(z.string()),
    keywordDraft: z.string(),
    knowledgeAreas: z.array(z.string()),
    knowledgeAreaDraft: z.string(),
  })
  .superRefine((values, ctx) => {
    const allKeywords = mergeUniqueItems(values.keywords, splitDelimitedItems(values.keywordDraft))
    const invalidKeyword = allKeywords.find((item) => item.length > 255)

    if (invalidKeyword) {
      ctx.addIssue({
        code: 'custom',
        path: ['keywordDraft'],
        message: 'Cada palavra-chave deve ter no máximo 255 caracteres.',
      })
    }

    const allKnowledgeAreas = mergeUniqueItems(
      values.knowledgeAreas,
      splitDelimitedItems(values.knowledgeAreaDraft),
    )
    const invalidKnowledgeArea = allKnowledgeAreas.find((item) => item.length > 500)

    if (invalidKnowledgeArea) {
      ctx.addIssue({
        code: 'custom',
        path: ['knowledgeAreaDraft'],
        message: 'Cada área do conhecimento deve ter no máximo 500 caracteres.',
      })
    }
  })

export type ResearchLineFormValues = z.infer<typeof researchLineFormSchema>

export const emptyResearchLineFormValues: ResearchLineFormValues = {
  name: '',
  objective: '',
  keywords: [],
  keywordDraft: '',
  knowledgeAreas: [],
  knowledgeAreaDraft: '',
}

export function toResearchLineFormValues(line?: ResearchLine | null): ResearchLineFormValues {
  if (!line) return emptyResearchLineFormValues

  return {
    name: line.name,
    objective: line.objective,
    keywords: [...(line.keywords ?? [])],
    keywordDraft: '',
    knowledgeAreas: [...(line.knowledgeAreas ?? [])],
    knowledgeAreaDraft: '',
  }
}

export function toResearchLinePayload(
  values: ResearchLineFormValues,
): CreateResearchLineRequest & UpdateResearchLineRequest {
  return {
    name: values.name.trim(),
    objective: values.objective.trim(),
    keywords: mergeUniqueItems(values.keywords, splitDelimitedItems(values.keywordDraft)),
    knowledgeAreas: mergeUniqueItems(
      values.knowledgeAreas,
      splitDelimitedItems(values.knowledgeAreaDraft),
    ),
  }
}

export function toResearchLineFormFieldPath(
  apiField: string,
): keyof ResearchLineFormValues {
  if (apiField.startsWith('keywords')) return 'keywordDraft'
  if (apiField.startsWith('knowledgeAreas')) return 'knowledgeAreaDraft'
  if (apiField === 'objective') return 'objective'
  return 'name'
}

