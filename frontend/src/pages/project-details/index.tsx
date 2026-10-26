import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import { ProjectDocuments } from '@/pages/project-details/components/project-documents'
import { ProjectFormDialog, type ProjectDialogState } from '@/pages/projects/components/project-form-dialog'
import { ProjectStatusBadge } from '@/pages/projects/components/project-status-badge'
import { formatProjectPeriod } from '@/pages/projects/project-format'
import { useLaboratoriesQuery } from '@/queries/laboratories/laboratories.queries'
import { useProjectQuery } from '@/queries/projects/projects.queries'
import { useResearchLinesQuery } from '@/queries/research-lines/research-lines.queries'

const backLinkClassName =
  'inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline'

function BackToProjectsLink() {
  return (
    <Link to=".." relative="path" className={backLinkClassName}>
      <ArrowLeft aria-hidden="true" className="size-4" />
      Voltar para projetos
    </Link>
  )
}

function PageState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="project-details-title" className="max-w-xl">
      <BackToProjectsLink />
      <h1 id="project-details-title" className="mt-4 text-2xl font-bold tracking-tight text-brand-navy">
        {title}
      </h1>
      {children}
    </section>
  )
}

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words text-brand-navy">{children}</dd>
    </div>
  )
}

export function ProjectDetailsPage() {
  const { projectId = '' } = useParams()
  const selectedGroup = useResearchGroup()
  const projectQuery = useProjectQuery(projectId)
  const laboratoriesQuery = useLaboratoriesQuery(selectedGroup.id)
  const researchLinesQuery = useResearchLinesQuery(selectedGroup.id)
  const [formDialog, setFormDialog] = useState<ProjectDialogState>({ open: false })

  const error = projectQuery.error ?? laboratoriesQuery.error ?? researchLinesQuery.error

  useEffect(() => {
    if (error && !(error instanceof ApiError && error.status === 404)) publishApiErrorToast(error)
  }, [error])

  if (projectQuery.isPending || laboratoriesQuery.isPending || researchLinesQuery.isPending) {
    return (
      <PageState title="Projeto">
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Carregando o projeto…
        </p>
      </PageState>
    )
  }

  const project = projectQuery.data
  const laboratories = laboratoriesQuery.data ?? []
  const laboratory = laboratories.find((candidate) => candidate.id === project?.laboratoryId)
  const notFound =
    (projectQuery.error instanceof ApiError && projectQuery.error.status === 404) ||
    (Boolean(project) && laboratoriesQuery.isSuccess && !laboratory)

  if (notFound) {
    return (
      <PageState title="Projeto não encontrado">
        <p className="mt-2 text-sm text-muted-foreground">
          Este projeto pode ter sido removido ou não pertence ao grupo selecionado.
        </p>
      </PageState>
    )
  }

  if (error || !project) {
    return (
      <PageState title="Não foi possível carregar o projeto">
        <p className="mt-2 text-sm text-muted-foreground">Confira sua conexão e tente novamente.</p>
        <Button
          className="mt-6"
          onClick={() => {
            void projectQuery.refetch()
            void laboratoriesQuery.refetch()
            void researchLinesQuery.refetch()
          }}
        >
          Tentar novamente
        </Button>
      </PageState>
    )
  }

  const researchLines = researchLinesQuery.data ?? []
  const researchLine = researchLines.find((line) => line.id === project.researchLineId)
  const knowledgeAreas = project.knowledgeAreas ?? []

  return (
    <section aria-labelledby="project-details-title">
      <BackToProjectsLink />

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 id="project-details-title" className="text-3xl font-bold tracking-tight break-words text-brand-navy">
              {project.name}
            </h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{formatProjectPeriod(project)}</p>
        </div>

        <Button
          variant="outline"
          className="h-10 w-full shrink-0 font-semibold sm:w-auto"
          onClick={() => setFormDialog({ open: true, mode: 'edit', project })}
        >
          <Pencil aria-hidden="true" />
          Editar projeto
        </Button>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <section aria-labelledby="project-overview-title" className="rounded-xl border border-slate-200 bg-card p-5 shadow-xs">
            <h2 id="project-overview-title" className="text-base font-bold text-brand-navy">
              Dados do projeto
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Laboratório">{laboratory?.name}</DetailItem>
              <DetailItem label="Linha de pesquisa">{researchLine?.name ?? '—'}</DetailItem>
              <div className="sm:col-span-2">
                <DetailItem label="Objetivo">
                  <span className="font-normal whitespace-pre-line">{project.objective}</span>
                </DetailItem>
              </div>
              {project.description && (
                <div className="sm:col-span-2">
                  <DetailItem label="Descrição">
                    <span className="font-normal whitespace-pre-line">{project.description}</span>
                  </DetailItem>
                </div>
              )}
              <div className="sm:col-span-2">
                <DetailItem label="Áreas do conhecimento">
                  {knowledgeAreas.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {knowledgeAreas.map((area) => (
                        <li key={area} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold">
                          {area}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    '—'
                  )}
                </DetailItem>
              </div>
            </dl>
          </section>

          <section aria-labelledby="project-materials-title" className="rounded-xl border border-dashed border-slate-200 bg-card p-5">
            <h2 id="project-materials-title" className="text-base font-bold text-brand-navy">
              Materiais usados
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ainda não é possível associar saídas de estoque a projetos. Os materiais usados e o registro
              de saída para este projeto ficarão disponíveis quando o sistema oferecer esse vínculo.
            </p>
          </section>
        </div>

        <ProjectDocuments projectId={project.id} documents={project.documents ?? []} />
      </div>

      <ProjectFormDialog
        state={formDialog}
        laboratories={laboratories}
        researchLines={researchLines}
        onOpenChange={(open) => {
          if (!open) setFormDialog({ open: false })
        }}
        onSaved={() => {
          setFormDialog({ open: false })
          publishToast({ kind: 'success', title: 'Projeto atualizado', description: 'As alterações foram salvas.' })
        }}
      />
    </section>
  )
}
