import { api } from '@/lib/api-client'
import type { ResearchGroup } from '@/types/research-groups/research-group.types'

export const researchGroupsService = {
  list: () => api.get<ResearchGroup[]>('/api/v1/research-groups'),
}
