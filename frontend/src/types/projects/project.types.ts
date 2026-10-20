export type ProjectStatus = 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'SUSPENSO'

export type Project = {
  id: string
  laboratoryId: string
  researchLineId: string
  name: string
  status: ProjectStatus
  startDate: string
  endDate: string | null
}
