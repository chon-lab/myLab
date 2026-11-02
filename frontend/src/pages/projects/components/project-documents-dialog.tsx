import { X } from 'lucide-react'

import { ProjectDocuments } from '@/components/projects/project-documents'
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
import { useProjectQuery } from '@/queries/projects/projects.queries'
import { ProjectStatusBadge } from '@/pages/projects/components/project-status-badge'
import { formatProjectPeriod } from '@/pages/projects/project-format'
import type { Project } from '@/types/projects/project.types'

export function ProjectDocumentsDialog({
  project,
  laboratoryNames,
  researchLineNames,
  onOpenChange,
}: {
  project: Project | null
  laboratoryNames: Record<string, string>
  researchLineNames: Record<string, string>
  onOpenChange: (open: boolean) => void
}) {
  const projectQuery = useProjectQuery(project?.id ?? null)
  const detail = projectQuery.data

  return (
    <Dialog open={Boolean(project)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-dvh flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-h-[90svh] sm:max-w-2xl sm:rounded-xl"
      >
        {project && (
          <>
            <DialogHeader className="relative shrink-0 border-b px-5 py-5 pr-14 sm:px-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Fechar documentos do projeto"
                  className="absolute top-3 right-3 size-10 sm:top-4 sm:right-4 sm:size-7"
                >
                  <X aria-hidden="true" className="size-5 sm:size-4" />
                </Button>
              </DialogClose>
              <DialogTitle className="text-lg font-bold text-brand-navy">Detalhes do projeto</DialogTitle>
              <DialogDescription>{detail?.name ?? project.name}</DialogDescription>
            </DialogHeader>

            {projectQuery.isPending && !detail && (
              <p role="status" className="px-5 py-10 text-center text-sm text-muted-foreground sm:px-6">
                Carregando documentos do projeto…
              </p>
            )}

            {projectQuery.isError && !detail && (
              <div className="space-y-4 px-5 py-8 text-center sm:px-6">
                <p role="alert" className="text-sm text-destructive">
                  Não foi possível carregar os documentos deste projeto.
                </p>
                <Button type="button" variant="outline" onClick={() => void projectQuery.refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {detail && (
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
                      <dd className="mt-1 break-words text-sm text-brand-navy">{detail.knowledgeAreas.join(', ')}</dd>
                    </div>
                  )}
                </dl>

                <ProjectDocuments key={detail.id} projectId={detail.id} documents={detail.documents ?? []} />
              </div>
            )}

            <DialogFooter className="mx-0 mb-0 border-t bg-background px-5 py-3 sm:px-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
