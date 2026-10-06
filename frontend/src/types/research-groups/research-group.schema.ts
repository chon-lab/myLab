import { z } from 'zod'

import type {
  GroupContact,
  ResearchGroup,
  UpdateResearchGroupRequest,
} from '@/types/research-groups/research-group.types'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const requiredText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max, `Use no máximo ${max} caracteres.`)

const optionalText = (max: number) =>
  z.string().trim().max(max, `Use no máximo ${max} caracteres.`)

const digitsOnly = (value: string) => value.replace(/\D/g, '')

const contactSchema = z
  .object({
    phone: optionalText(30),
    fax: optionalText(30),
    email: optionalText(254).refine(
      (value) => value === '' || emailPattern.test(value),
      'Informe um e-mail válido.',
    ),
    website: optionalText(2048),
  })
  .refine((contact) => Object.values(contact).some((value) => value !== ''), {
    message: 'Preencha ao menos um campo ou remova este contato.',
    path: ['phone'],
  })

export const researchGroupFormSchema = z.object({
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
  institutionUnit: optionalText(255),
  sourceUrl: optionalText(2048),
  repercussions: z.string().trim(),
  address: z.object({
    street: optionalText(255),
    number: optionalText(30),
    complement: optionalText(255),
    neighborhood: optionalText(120),
    city: optionalText(120),
    state: z
      .string()
      .trim()
      .refine((value) => value === '' || /^[A-Za-z]{2}$/.test(value), 'Use a sigla com 2 letras.'),
    postalCode: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || /^\d{8}$/.test(digitsOnly(value)),
        'Informe um CEP com 8 dígitos.',
      ),
    postOfficeBox: optionalText(30),
  }),
  contacts: z.array(contactSchema),
})

export type ResearchGroupFormValues = z.infer<typeof researchGroupFormSchema>
export type ContactFormValues = ResearchGroupFormValues['contacts'][number]

export const emptyContact: ContactFormValues = { phone: '', fax: '', email: '', website: '' }

const nullToEmpty = (value: string | null | undefined) => value ?? ''
const emptyToNull = (value: string) => (value === '' ? null : value)

export function toResearchGroupFormValues(group: ResearchGroup): ResearchGroupFormValues {
  const address = group.address

  return {
    name: group.name,
    situation: group.situation,
    formationYear: String(group.formationYear),
    predominantArea: group.predominantArea,
    institutionName: group.institutionName,
    institutionUnit: nullToEmpty(group.institutionUnit),
    sourceUrl: nullToEmpty(group.sourceUrl),
    repercussions: nullToEmpty(group.repercussions),
    address: {
      street: nullToEmpty(address?.street),
      number: nullToEmpty(address?.number),
      complement: nullToEmpty(address?.complement),
      neighborhood: nullToEmpty(address?.neighborhood),
      city: nullToEmpty(address?.city),
      state: nullToEmpty(address?.state),
      postalCode: nullToEmpty(address?.postalCode),
      postOfficeBox: nullToEmpty(address?.postOfficeBox),
    },
    contacts: group.contacts.map((contact) => ({
      phone: nullToEmpty(contact.phone),
      fax: nullToEmpty(contact.fax),
      email: nullToEmpty(contact.email),
      website: nullToEmpty(contact.website),
    })),
  }
}

export function toUpdateResearchGroupRequest(
  values: ResearchGroupFormValues,
  current: ResearchGroup,
): UpdateResearchGroupRequest {
  const { address: addressValues } = values
  const latitude = current.address?.latitude ?? null
  const longitude = current.address?.longitude ?? null
  const address = {
    street: emptyToNull(addressValues.street),
    number: emptyToNull(addressValues.number),
    complement: emptyToNull(addressValues.complement),
    neighborhood: emptyToNull(addressValues.neighborhood),
    city: emptyToNull(addressValues.city),
    state: emptyToNull(addressValues.state.toUpperCase()),
    postalCode: emptyToNull(digitsOnly(addressValues.postalCode)),
    postOfficeBox: emptyToNull(addressValues.postOfficeBox),
    latitude,
    longitude,
  }
  const hasAddress = Object.values(address).some((value) => value !== null)

  return {
    name: values.name,
    situation: values.situation,
    formationYear: Number(values.formationYear),
    situationAt: current.situationAt,
    lastSubmittedAt: current.lastSubmittedAt,
    predominantArea: values.predominantArea,
    institutionName: values.institutionName,
    institutionUnit: emptyToNull(values.institutionUnit),
    sourceUrl: emptyToNull(values.sourceUrl),
    repercussions: emptyToNull(values.repercussions),
    address: hasAddress ? address : null,
    contacts: values.contacts.map(
      (contact): GroupContact => ({
        phone: emptyToNull(contact.phone),
        fax: emptyToNull(contact.fax),
        email: emptyToNull(contact.email),
        website: emptyToNull(contact.website),
      }),
    ),
  }
}

export function toFormFieldPath(apiField: string) {
  return apiField.replace(/\[(\d+)\]/g, '.$1')
}
