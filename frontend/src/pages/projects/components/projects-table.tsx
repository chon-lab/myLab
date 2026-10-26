import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProjectStatusBadge } from '@/pages/projects/components/project-status-badge'
import { formatProjectPeriod } from '@/pages/projects/project-format'
import type { Project } from '@/types/projects/project.types'

export type ProjectListProps = {
  projects: Project[]
  laboratoryNames: Record<string, string>
  researchLineNames: Record<string, string>
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

const headClassName = 'px-4 py-3 text-xs font-semibold text-muted-foreground'

export function ProjectsTable({
  projects,
  laboratoryNames,
  researchLineNames,
  onEdit,
  onDelete,
}: ProjectListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-xs">
      <Table aria-label="Projetos do grupo">
        <TableHeader className="bg-slate-50/70">
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className={`${headClassName} pl-5`}>Projeto</TableHead>
            <TableHead className={headClassName}>Laboratório</TableHead>
            <TableHead className={headClassName}>Linha de pesquisa</TableHead>
            <TableHead className={headClassName}>Período</TableHead>
            <TableHead className={headClassName}>Situação</TableHead>
            <TableHead className={`${headClassName} pr-5 text-right`}>
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="border-slate-100">
              <TableCell className="max-w-80 px-5 py-3.5 whitespace-normal">
                <p className="text-sm font-bold break-words text-brand-navy">{project.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {project.objective}
                </p>
              </TableCell>
              <TableCell className="px-4 py-3.5 text-sm font-medium whitespace-normal text-brand-navy">
                {laboratoryNames[project.laboratoryId] ?? '—'}
              </TableCell>
              <TableCell className="max-w-56 px-4 py-3.5 text-sm whitespace-normal text-brand-navy">
                {researchLineNames[project.researchLineId] ?? '—'}
              </TableCell>
              <TableCell className="px-4 py-3.5 text-sm text-brand-navy tabular-nums">
                {formatProjectPeriod(project)}
              </TableCell>
              <TableCell className="px-4 py-3.5">
                <ProjectStatusBadge status={project.status} />
              </TableCell>
              <TableCell className="px-5 py-3.5 text-right whitespace-nowrap">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-brand-navy"
                  aria-label={`Editar ${project.name}`}
                  onClick={() => onEdit(project)}
                >
                  <Pencil aria-hidden="true" className="size-5 sm:size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Excluir ${project.name}`}
                  onClick={() => onDelete(project)}
                >
                  <Trash2 aria-hidden="true" className="size-5 sm:size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
