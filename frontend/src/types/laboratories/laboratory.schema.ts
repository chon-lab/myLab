import { z } from 'zod'

import type {
  CreateLaboratoryRequest,
  Laboratory,
  LaboratoryAddressRequest,
  UpdateLaboratoryRequest,
} from '@/types/laboratories/laboratory.types'

export const laboratoryStatusValues = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const

export const laboratoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do laboratório.')
    .max(255, 'Use no máximo 255 caracteres.'),
  description: z.string().trim().max(1000, 'Use no máximo 1000 caracteres.'),
  status: z.enum(laboratoryStatusValues, { message: 'Selecione a situação do laboratório.' }),
  street: z.string().trim().max(255, 'Use no máximo 255 caracteres.'),
  number: z.string().trim().max(30, 'Use no máximo 30 caracteres.'),
  city: z.string().trim().max(120, 'Use no máximo 120 caracteres.'),
  postalCode: z
    .string()
    .trim()
    .regex(/^$|^\d{5}-?\d{3}$/, 'Informe um CEP com 8 dígitos.'),
})

export type LaboratoryFormValues = z.infer<typeof laboratoryFormSchema>

export const emptyLaboratoryFormValues: LaboratoryFormValues = {
  name: '',
  description: '',
  status: 'ACTIVE',
  street: '',
  number: '',
  city: '',
  postalCode: '',
}

function formatPostalCode(value: string | null) {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : value
}

export function toLaboratoryFormValues(laboratory?: Laboratory | null): LaboratoryFormValues {
  if (!laboratory) return emptyLaboratoryFormValues

  return {
    name: laboratory.name,
    description: laboratory.description ?? '',
    status: laboratory.status,
    street: laboratory.address?.street ?? '',
    number: laboratory.address?.number ?? '',
    city: laboratory.address?.city ?? '',
    postalCode: formatPostalCode(laboratory.address?.postalCode ?? null),
  }
}

function optionalText(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function toAddressPayload(values: LaboratoryFormValues): LaboratoryAddressRequest | undefined {
  const address: LaboratoryAddressRequest = {
    street: optionalText(values.street),
    number: optionalText(values.number),
    city: optionalText(values.city),
    postalCode: optionalText(values.postalCode),
  }

  return Object.values(address).some(Boolean) ? address : undefined
}

export function toLaboratoryPayload(
  values: LaboratoryFormValues,
): CreateLaboratoryRequest & UpdateLaboratoryRequest {
  return {
    name: values.name.trim(),
    description: optionalText(values.description),
    status: values.status,
    address: toAddressPayload(values),
  }
}

export function toLaboratoryFormFieldPath(apiField: string): keyof LaboratoryFormValues {
  if (apiField.endsWith('street')) return 'street'
  if (apiField.endsWith('number')) return 'number'
  if (apiField.endsWith('city')) return 'city'
  if (apiField.endsWith('postalCode')) return 'postalCode'
  if (apiField === 'description') return 'description'
  if (apiField === 'status') return 'status'
  return 'name'
}
