import { FileText, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ProjectStatusBadge } from '@/pages/projects/components/project-status-badge'
import type { ProjectListProps } from '@/pages/projects/components/projects-table'
import { formatDate } from '@/pages/research-group-details/research-group-format'
import type { Project } from '@/types/projects/project.types'

export function ProjectCard({
  project,
  laboratoryNames,
  researchLineNames,
  onDetails,
  onEdit,
  onDelete,
}: Omit<ProjectListProps, 'projects'> & { project: Project }) {
  const titleId = `project-title-${project.id}`

  return (
    <article aria-labelledby={titleId} className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={titleId} className="text-sm font-bold break-words text-brand-navy">{project.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{project.objective}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-10 text-muted-foreground hover:text-primary sm:size-8"
            aria-label={`Editar ${project.name}`}
            onClick={() => onEdit(project)}
          >
            <Pencil aria-hidden="true" className="size-5 sm:size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-10 text-muted-foreground hover:text-destructive sm:size-8"
            aria-label={`Excluir ${project.name}`}
            onClick={() => onDelete(project)}
          >
            <Trash2 aria-hidden="true" className="size-5 sm:size-4" />
          </Button>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Linha de pesquisa</dt>
          <dd className="mt-1 text-sm font-medium break-words text-brand-navy">
            {researchLineNames[project.researchLineId] ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Laboratório</dt>
          <dd className="mt-1 text-sm break-words text-brand-navy">
            {laboratoryNames[project.laboratoryId] ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Situação</dt>
          <dd className="mt-1"><ProjectStatusBadge status={project.status} /></dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Documentos</dt>
          <dd className="mt-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-10 w-auto gap-1 px-2 text-muted-foreground hover:text-primary sm:h-8"
              aria-label={`Ver detalhes e documentos de ${project.name}`}
              title="Ver detalhes do projeto"
              onClick={() => onDetails(project)}
            >
              <FileText aria-hidden="true" className="size-5 sm:size-4" />
              <span className="text-sm">{project.documents?.length ?? 0}</span>
            </Button>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Início</dt>
          <dd className="mt-1 text-sm text-brand-navy tabular-nums">{formatDate(project.startDate)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Término</dt>
          <dd className="mt-1 text-sm text-brand-navy tabular-nums">{formatDate(project.endDate) ?? 'Sem data'}</dd>
        </div>
      </dl>
    </article>
  )
}
