import { api } from '@/lib/api-client'
import type {
  CreatePersonRequest,
  GroupMember,
  Person,
  ResearchLineOption,
  UpdateGroupMemberRequest,
  UpdatePersonRequest,
} from '@/types/members/member.types'

export const membersService = {
  listPeopleByGroup: (researchGroupId: string) =>
    api.get<Person[]>(`/api/v1/research-groups/${researchGroupId}/people`),
  listMembershipsByGroup: (researchGroupId: string) =>
    api.get<GroupMember[]>(`/api/v1/research-groups/${researchGroupId}/members`),
  listResearchLinesByGroup: (researchGroupId: string) =>
    api.get<ResearchLineOption[]>(`/api/v1/research-groups/${researchGroupId}/research-lines`),
  getPerson: (personId: string) => api.get<Person>(`/api/v1/people/${personId}`),
  createPerson: (researchGroupId: string, body: CreatePersonRequest) =>
    api.post<string | undefined>(`/api/v1/research-groups/${researchGroupId}/people`, body),
  updatePerson: (personId: string, body: UpdatePersonRequest) =>
    api.put<void>(`/api/v1/people/${personId}`, body),
  updateMembership: (researchGroupId: string, personId: string, body: UpdateGroupMemberRequest) =>
    api.patch<void>(`/api/v1/research-groups/${researchGroupId}/members/${personId}`, body),
}
