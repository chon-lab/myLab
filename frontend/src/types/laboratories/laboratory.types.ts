export type LaboratoryStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'

export type Laboratory = {
  id: string
  researchGroupId: string
  name: string
  description: string | null
  status: LaboratoryStatus
}
