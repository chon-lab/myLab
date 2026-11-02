import { FileText, Pencil, Trash2 } from 'lucide-react'

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
import { formatDate } from '@/pages/research-group-details/research-group-format'
import type { Project } from '@/types/projects/project.types'

export type ProjectListProps = {
  projects: Project[]
  laboratoryNames: Record<string, string>
  researchLineNames: Record<string, string>
  onDetails: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

const headClassName = 'px-3 py-3 text-xs font-semibold text-muted-foreground'

export function ProjectsTable({
  projects,
  laboratoryNames,
  researchLineNames,
  onDetails,
  onEdit,
  onDelete,
}: ProjectListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <Table aria-label="Projetos do grupo" className="table-fixed">
        <TableHeader className="bg-muted/50">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className={`${headClassName} w-[22%] pl-4`}>Projeto</TableHead>
            <TableHead className={`${headClassName} w-[16%]`}>Linha de pesquisa</TableHead>
            <TableHead className={`${headClassName} w-[9%]`}>Laboratório</TableHead>
            <TableHead className={`${headClassName} w-[14%]`}>Situação</TableHead>
            <TableHead className={`${headClassName} w-[10%] px-2`}>Início</TableHead>
            <TableHead className={`${headClassName} w-[10%] px-2`}>Término</TableHead>
            <TableHead className={`${headClassName} w-[10%] px-1 text-center`}>Documentos</TableHead>
            <TableHead className={`${headClassName} w-[9%] pr-1 text-right`}>
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="border-border/60">
              <TableCell className="px-4 py-3 whitespace-normal">
                <p className="text-sm font-bold break-words text-brand-navy">{project.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs break-words text-muted-foreground">{project.objective}</p>
              </TableCell>
              <TableCell className="px-3 py-3 text-xs whitespace-normal text-brand-navy">
                {researchLineNames[project.researchLineId] ?? '—'}
              </TableCell>
              <TableCell className="px-3 py-3 text-xs whitespace-normal text-brand-navy">
                {laboratoryNames[project.laboratoryId] ?? '—'}
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-normal">
                <ProjectStatusBadge status={project.status} />
              </TableCell>
              <TableCell className="px-2 py-3 text-xs text-brand-navy tabular-nums">
                {formatDate(project.startDate)}
              </TableCell>
              <TableCell className="px-2 py-3 text-xs text-muted-foreground tabular-nums">
                {formatDate(project.endDate) ?? 'Sem data'}
              </TableCell>
              <TableCell className="px-1 py-3 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-muted-foreground hover:text-primary"
                  aria-label={`Ver detalhes e documentos de ${project.name}`}
                  title="Ver detalhes do projeto"
                  onClick={() => onDetails(project)}
                >
                  <FileText aria-hidden="true" className="size-4" />
                  <span className="text-xs">{project.documents?.length ?? 0}</span>
                </Button>
              </TableCell>
              <TableCell className="pr-1 pl-0 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-muted-foreground hover:text-primary"
                    aria-label={`Editar ${project.name}`}
                    onClick={() => onEdit(project)}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Excluir ${project.name}`}
                    onClick={() => onDelete(project)}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
