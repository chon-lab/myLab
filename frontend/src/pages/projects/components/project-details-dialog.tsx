import { Pencil, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProjectDocuments } from '@/pages/projects/components/project-documents'
import { ProjectStatusBadge } from '@/pages/projects/components/project-status-badge'
import { formatProjectPeriod } from '@/pages/projects/project-format'
import { useProjectQuery } from '@/queries/projects/projects.queries'
import type { Project } from '@/types/projects/project.types'

export function ProjectDetailsDialog({
  project,
  laboratoryNames,
  researchLineNames,
  onEdit,
  onOpenChange,
}: {
  project: Project
  laboratoryNames: Record<string, string>
  researchLineNames: Record<string, string>
  onEdit: (project: Project) => void
  onOpenChange: (open: boolean) => void
}) {
  const detailQuery = useProjectQuery(project.id, project)
  const detail = detailQuery.data ?? project

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-dvh flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-h-[90svh] sm:max-w-2xl sm:rounded-xl"
      >
          <>
            <DialogHeader className="relative shrink-0 border-b px-5 py-5 pr-14 sm:px-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Fechar detalhes do projeto"
                  className="absolute top-3 right-3 size-10 sm:top-4 sm:right-4 sm:size-8"
                >
                  <X aria-hidden="true" className="size-5 sm:size-4" />
                </Button>
              </DialogClose>
              <DialogTitle className="text-lg font-bold text-brand-navy">Detalhes do projeto</DialogTitle>
              <DialogDescription>{detail?.name ?? project.name}</DialogDescription>
            </DialogHeader>

            {detailQuery.isPending && (
              <p role="status" className="px-5 pt-4 text-xs text-muted-foreground sm:px-6">
                Atualizando detalhes do projeto…
              </p>
            )}

            {detailQuery.isError && (
              <div className="flex flex-wrap items-center gap-2 px-5 pt-4 sm:px-6">
                <p role="alert" className="text-sm text-destructive">
                  Não foi possível atualizar os detalhes. Os dados exibidos podem estar desatualizados.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => void detailQuery.refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-center gap-3">
                  <ProjectStatusBadge status={detail.status} />
                  <span className="text-xs text-muted-foreground">{formatProjectPeriod(detail)}</span>
                </div>

                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Linha de pesquisa</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-brand-navy">
                      {researchLineNames[detail.researchLineId] ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Laboratório</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-brand-navy">
                      {laboratoryNames[detail.laboratoryId] ?? '—'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-muted-foreground">Objetivo</dt>
                    <dd className="mt-1 whitespace-pre-line break-words text-sm text-brand-navy">{detail.objective}</dd>
                  </div>
                  {detail.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-muted-foreground">Descrição</dt>
                      <dd className="mt-1 whitespace-pre-line break-words text-sm text-brand-navy">{detail.description}</dd>
                    </div>
                  )}
                  {detail.knowledgeAreas && detail.knowledgeAreas.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-muted-foreground">Áreas do conhecimento</dt>
                      <dd className="mt-1 break-words text-sm text-brand-navy">
                        {detail.knowledgeAreas.join(', ')}
                      </dd>
                    </div>
                  )}
                </dl>

                <ProjectDocuments key={detail.id} projectId={detail.id} documents={detail.documents ?? []} />
              </div>

            <DialogFooter className="mx-0 mb-0 gap-2 border-t bg-background px-5 py-3 sm:px-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Fechar</Button>
              </DialogClose>
              <Button type="button" onClick={() => onEdit(detail)}>
                <Pencil aria-hidden="true" />
                Editar projeto
              </Button>
            </DialogFooter>
          </>
      </DialogContent>
    </Dialog>
  )
}
