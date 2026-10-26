import { formatDate } from '@/pages/research-group-details/research-group-format'
import type { Project, ProjectStatus } from '@/types/projects/project.types'

export const projectStatusLabels: Record<ProjectStatus, string> = {
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  SUSPENSO: 'Suspenso',
}

export const projectStatusBadgeClasses: Record<ProjectStatus, string> = {
  EM_ANDAMENTO: 'bg-emerald-50 text-emerald-800',
  CONCLUIDO: 'bg-primary/10 text-primary',
  CANCELADO: 'bg-destructive/10 text-destructive',
  SUSPENSO: 'bg-amber-50 text-amber-800',
}

export function formatProjectPeriod(project: Project) {
  const start = formatDate(project.startDate)
  return project.endDate ? `${start} – ${formatDate(project.endDate)}` : `Desde ${start}`
}
