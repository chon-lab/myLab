export type GroupAddress = {
  street: string | null
  number: string | null
  complement: string | null
  neighborhood: string | null
  state: string | null
  city: string | null
  postalCode: string | null
  postOfficeBox: string | null
  latitude: number | null
  longitude: number | null
}

export type GroupContact = {
  phone: string | null
  fax: string | null
  email: string | null
  website: string | null
}

export type ResearchGroup = {
  id: string
  cnpqId: string
  name: string
  situation: string
  formationYear: number
  situationAt: string | null
  lastSubmittedAt: string | null
  predominantArea: string
  institutionName: string
  institutionUnit: string | null
  sourceUrl: string | null
  repercussions: string | null
  address: GroupAddress | null
  contacts: GroupContact[]
  createdAt: string
  updatedAt: string
}

export type UpdateResearchGroupRequest = {
  name: string
  situation: string
  formationYear: number
  situationAt: string | null
  lastSubmittedAt: string | null
  predominantArea: string
  institutionName: string
  institutionUnit: string | null
  sourceUrl: string | null
  repercussions: string | null
  address: GroupAddress | null
  contacts: GroupContact[]
}
