import { api } from '@/lib/api-client'
import type {
  AssignablePerson,
  GroupMember,
  InviteMemberRequest,
  Person,
  ResearchLineOption,
  UpdateGroupMemberRequest,
} from '@/types/members/member.types'

export const membersService = {
  listPeopleByGroup: (researchGroupId: string) =>
    api.get<Person[]>(`/api/v1/research-groups/${researchGroupId}/people`),
  listMembershipsByGroup: (researchGroupId: string) =>
    api.get<GroupMember[]>(`/api/v1/research-groups/${researchGroupId}/members`),
  listResearchLinesByGroup: (researchGroupId: string) =>
    api.get<ResearchLineOption[]>(`/api/v1/research-groups/${researchGroupId}/research-lines`),
  searchAssignablePeople: (researchGroupId: string, search: string) =>
    api.get<AssignablePerson[]>(
      `/api/v1/research-groups/${researchGroupId}/assignable-people?search=${encodeURIComponent(search)}`,
    ),
  inviteMember: (researchGroupId: string, body: InviteMemberRequest) =>
    api.post<string | undefined>(`/api/v1/research-groups/${researchGroupId}/members`, body),
  updateMembership: (researchGroupId: string, personId: string, body: UpdateGroupMemberRequest) =>
    api.patch<void>(`/api/v1/research-groups/${researchGroupId}/members/${personId}`, body),
}
