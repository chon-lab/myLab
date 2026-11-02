import { api } from '@/lib/api-client'
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from '@/types/projects/project.types'

export const projectsService = {
  listByLaboratory: (laboratoryId: string) =>
    api.get<Project[]>(`/api/v1/laboratories/${laboratoryId}/projects`),
  get: (id: string) => api.get<Project>(`/api/v1/projects/${id}`),
  create: (laboratoryId: string, body: CreateProjectRequest) =>
    api.post<string | undefined>(`/api/v1/laboratories/${laboratoryId}/projects`, body),
  update: (id: string, body: UpdateProjectRequest) =>
    api.put<void>(`/api/v1/projects/${id}`, body),
  remove: (id: string) => api.delete<void>(`/api/v1/projects/${id}`),
  uploadDocument: (projectId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<string | undefined>(`/api/v1/projects/${projectId}/documents`, formData)
  },
  downloadDocument: (projectId: string, documentId: string) =>
    api.download(`/api/v1/projects/${projectId}/documents/${documentId}`),
  deleteDocument: (projectId: string, documentId: string) =>
    api.delete<void>(`/api/v1/projects/${projectId}/documents/${documentId}`),
}
