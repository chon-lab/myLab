export type ProjectStatus = 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'SUSPENSO'

export type ProjectDocument = {
  id: string
  fileName: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
}

export type Project = {
  id: string
  laboratoryId: string
  researchLineId: string
  name: string
  description: string | null
  objective: string
  status: ProjectStatus
  startDate: string
  endDate: string | null
  knowledgeAreas: string[] | null
  documents: ProjectDocument[]
  createdAt: string
  updatedAt: string
}

export type UpdateProjectRequest = {
  name: string
  description?: string
  objective: string
  status: ProjectStatus
  startDate: string
  endDate?: string
  knowledgeAreas: string[]
}

export type CreateProjectRequest = UpdateProjectRequest & {
  researchLineId: string
}
