import { api } from '@/lib/api-client'
import type {
  CreateLaboratoryRequest,
  Laboratory,
  LaboratoryProjectSummary,
  UpdateLaboratoryRequest,
} from '@/types/laboratories/laboratory.types'

export const laboratoriesService = {
  listByGroup: (researchGroupId: string) =>
    api.get<Laboratory[]>(`/api/v1/research-groups/${researchGroupId}/laboratories`),
  get: (id: string) => api.get<Laboratory>(`/api/v1/laboratories/${id}`),
  create: (researchGroupId: string, body: CreateLaboratoryRequest) =>
    api.post<string | undefined>(`/api/v1/research-groups/${researchGroupId}/laboratories`, body),
  update: (id: string, body: UpdateLaboratoryRequest) =>
    api.put<void>(`/api/v1/laboratories/${id}`, body),
  remove: (id: string) => api.delete<void>(`/api/v1/laboratories/${id}`),
  listProjects: (laboratoryId: string) =>
    api.get<LaboratoryProjectSummary[]>(`/api/v1/laboratories/${laboratoryId}/projects`),
}
