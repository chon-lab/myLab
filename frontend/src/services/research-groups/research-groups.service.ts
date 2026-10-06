import { api } from '@/lib/api-client'
import type {
  ResearchGroup,
  UpdateResearchGroupRequest,
} from '@/types/research-groups/research-group.types'

export const researchGroupsService = {
  list: () => api.get<ResearchGroup[]>('/api/v1/research-groups'),
  get: (id: string) => api.get<ResearchGroup>(`/api/v1/research-groups/${id}`),
  update: (id: string, body: UpdateResearchGroupRequest) =>
    api.put<void>(`/api/v1/research-groups/${id}`, body),
}
