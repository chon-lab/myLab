export type ResearchLine = {
  id: string
  researchGroupId: string
  name: string
  objective: string
  keywords: string[]
  knowledgeAreas: string[]
  createdAt: string
  updatedAt: string
}

export type CreateResearchLineRequest = {
  name: string
  objective: string
  keywords: string[]
  knowledgeAreas: string[]
}

export type UpdateResearchLineRequest = {
  name: string
  objective: string
  keywords: string[]
  knowledgeAreas: string[]
}

export type GroupMemberSummary = {
  id: string
  personId: string
  researchGroupId: string
  active: boolean
  researchLineIds: string[]
  createdAt: string
  updatedAt: string
}

export type LaboratorySummary = {
  id: string
  researchGroupId: string
  name: string
}

export type ProjectSummary = {
  id: string
  laboratoryId: string
  researchLineId: string
  name: string
}

export type ResearchLineUsageCounts = {
  membersCountByLineId: Record<string, number> | null
  projectsCountByLineId: Record<string, number> | null
}

