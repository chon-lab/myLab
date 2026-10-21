export type MemberRole = 'ADMIN' | 'RESPONSIBLE' | 'STUDENT' | 'PARTNER'

export type Person = {
  id: string
  name: string
  socialName: string | null
  email: string | null
  phone: string | null
  cpf: string | null
  academicDegree: string | null
  areasOfExpertise: string[]
  createdAt: string
  updatedAt: string
}

export type GroupMember = {
  id: string
  personId: string
  researchGroupId: string
  active: boolean
  role: MemberRole | null
  researchLineIds: string[]
  createdAt: string
  updatedAt: string
}

export type ResearchLineOption = {
  id: string
  researchGroupId: string
  name: string
  objective: string
  keywords: string[]
  knowledgeAreas: string[]
  createdAt: string
  updatedAt: string
}

export type GroupMemberListItem = {
  person: Person
  membership: GroupMember
}

export type CreatePersonRequest = {
  name: string
  socialName: string | null
  email: string | null
  phone: string | null
  cpf: string | null
  academicDegree: string | null
  areasOfExpertise: string[]
  researchLineIds: string[]
  role: MemberRole
}

export type UpdatePersonRequest = Omit<CreatePersonRequest, 'researchLineIds' | 'role'>

export type UpdateGroupMemberRequest = {
  role?: MemberRole
  active?: boolean
  researchLineIds?: string[]
}
