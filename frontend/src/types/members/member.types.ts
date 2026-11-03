export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE'

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
  status: MembershipStatus
  roleId: string | null
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

export type AssignablePerson = {
  id: string
  name: string
  email: string | null
  academicDegree: string | null
}

export type InviteMemberRequest = {
  personId: string
  roleId: string
  researchLineIds: string[]
}

export type UpdateGroupMemberRequest = {
  status?: MembershipStatus
  roleId?: string
  researchLineIds?: string[]
}
