import { api } from '@/lib/api-client'
import type { Project } from '@/types/projects/project.types'

export const projectsService = {
  listByLaboratory: (laboratoryId: string) =>
    api.get<Project[]>(`/api/v1/laboratories/${laboratoryId}/projects`),
}
