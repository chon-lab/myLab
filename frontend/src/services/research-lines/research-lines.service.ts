import { api } from '@/lib/api-client'
import type {
  CreateResearchLineRequest,
  GroupMemberSummary,
  LaboratorySummary,
  ProjectSummary,
  ResearchLine,
  UpdateResearchLineRequest,
} from '@/types/research-lines/research-line.types'

export const researchLinesService = {
  listByGroup: (researchGroupId: string) =>
    api.get<ResearchLine[]>(`/api/v1/research-groups/${researchGroupId}/research-lines`),
  get: (id: string) => api.get<ResearchLine>(`/api/v1/research-lines/${id}`),
  create: (researchGroupId: string, body: CreateResearchLineRequest) =>
    api.post<string | undefined>(`/api/v1/research-groups/${researchGroupId}/research-lines`, body),
  update: (id: string, body: UpdateResearchLineRequest) =>
    api.put<void>(`/api/v1/research-lines/${id}`, body),
  remove: (id: string) => api.delete<void>(`/api/v1/research-lines/${id}`),
  listGroupMembers: (researchGroupId: string) =>
    api.get<GroupMemberSummary[]>(`/api/v1/research-groups/${researchGroupId}/members`),
  listGroupLaboratories: (researchGroupId: string) =>
    api.get<LaboratorySummary[]>(`/api/v1/research-groups/${researchGroupId}/laboratories`),
  listLaboratoryProjects: (laboratoryId: string) =>
    api.get<ProjectSummary[]>(`/api/v1/laboratories/${laboratoryId}/projects`),
}

