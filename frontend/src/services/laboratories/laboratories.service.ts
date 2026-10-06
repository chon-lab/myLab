import { api } from '@/lib/api-client'
import type { Laboratory } from '@/types/laboratories/laboratory.types'

export const laboratoriesService = {
  listByGroup: (researchGroupId: string) =>
    api.get<Laboratory[]>(`/api/v1/research-groups/${researchGroupId}/laboratories`),
}
