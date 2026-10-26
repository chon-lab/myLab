import { useEffect, useState, type ReactNode } from 'react'
import { FolderKanban, Plus, Search } from 'lucide-react'
import { Link } from 'react-router'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError } from '@/lib/api-client'
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import { DeleteProjectDialog } from '@/pages/projects/components/delete-project-dialog'
import { ProjectCard } from '@/pages/projects/components/project-card'
import { ProjectFormDialog, type ProjectDialogState } from '@/pages/projects/components/project-form-dialog'
import { ProjectsTable } from '@/pages/projects/components/projects-table'
import { projectStatusLabels } from '@/pages/projects/project-format'
import { useLaboratoriesQuery } from '@/queries/laboratories/laboratories.queries'
import { useLaboratoriesProjectsQuery } from '@/queries/projects/projects.queries'
import { useResearchLinesQuery } from '@/queries/research-lines/research-lines.queries'
import { projectStatusValues } from '@/types/projects/project.schema'
import type { Project } from '@/types/projects/project.types'

const ALL = 'ALL'

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function toNameById(records: { id: string; name: string }[]) {
  return Object.fromEntries(records.map((record) => [record.id, record.name]))
}

function PageState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="projects-title" className="max-w-xl">
      <h1 id="projects-title" className="text-2xl font-bold tracking-tight text-brand-navy">
        {title}
      </h1>
      {children}
    </section>
  )
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  className,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className: string
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-semibold text-brand-navy">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="mt-1.5 h-10 w-full bg-card px-3 text-sm font-medium text-brand-navy">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function ProjectsPage() {
  const selectedGroup = useResearchGroup()
  const laboratoriesQuery = useLaboratoriesQuery(selectedGroup.id)
  const researchLinesQuery = useResearchLinesQuery(selectedGroup.id)
  const laboratories = laboratoriesQuery.data ?? []
  const researchLines = researchLinesQuery.data ?? []
  const projectsQuery = useLaboratoriesProjectsQuery(laboratories)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [laboratoryFilter, setLaboratoryFilter] = useState(ALL)
  const [researchLineFilter, setResearchLineFilter] = useState(ALL)
  const [formDialog, setFormDialog] = useState<ProjectDialogState>({ open: false })
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const error = laboratoriesQuery.error ?? researchLinesQuery.error ?? projectsQuery.error

  useEffect(() => {
    if (error) publishApiErrorToast(error)
  }, [error])

  if (laboratoriesQuery.isPending || researchLinesQuery.isPending || projectsQuery.isPending) {
    return (
      <PageState title="Projetos">
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Carregando os projetos do grupo…
        </p>
      </PageState>
    )
  }

  if (error || !projectsQuery.data) {
    const notFound = laboratoriesQuery.error instanceof ApiError && laboratoriesQuery.error.status === 404

    return (
      <PageState title={notFound ? 'Grupo não encontrado' : 'Não foi possível carregar os projetos'}>
        <p className="mt-2 text-sm text-muted-foreground">
          {notFound
            ? 'Este grupo de pesquisa pode ter sido removido. Selecione outro grupo no menu lateral.'
            : 'Confira sua conexão e tente novamente.'}
        </p>
        {!notFound && (
          <Button
            className="mt-6"
            onClick={() => {
              void laboratoriesQuery.refetch()
              void researchLinesQuery.refetch()
              void projectsQuery.refetch()
            }}
          >
            Tentar novamente
          </Button>
        )}
      </PageState>
    )
  }

  const projects = projectsQuery.data
  const laboratoryNames = toNameById(laboratories)
  const researchLineNames = toNameById(researchLines)
  const effectiveLaboratoryFilter = laboratoryNames[laboratoryFilter] ? laboratoryFilter : ALL
  const effectiveResearchLineFilter = researchLineNames[researchLineFilter] ? researchLineFilter : ALL
  const query = normalizeSearchText(searchQuery.trim())
  const canCreate = laboratories.length > 0 && researchLines.length > 0

  const filteredProjects = projects.filter(
    (project) =>
      (statusFilter === ALL || project.status === statusFilter) &&
      (effectiveLaboratoryFilter === ALL || project.laboratoryId === effectiveLaboratoryFilter) &&
      (effectiveResearchLineFilter === ALL || project.researchLineId === effectiveResearchLineFilter) &&
      (!query ||
        [project.name, project.objective, project.description ?? ''].some((field) =>
          normalizeSearchText(field).includes(query),
        )),
  )

  function openCreateDialog() {
    setFormDialog({ open: true, mode: 'create' })
  }

  function clearFilters() {
    setSearchQuery('')
    setStatusFilter(ALL)
    setLaboratoryFilter(ALL)
    setResearchLineFilter(ALL)
  }

  const listProps = {
    laboratoryNames,
    researchLineNames,
    onEdit: (project: Project) => setFormDialog({ open: true, mode: 'edit', project }),
    onDelete: setProjectToDelete,
  }

  return (
    <section aria-labelledby="projects-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 id="projects-title" className="text-3xl font-bold tracking-tight text-brand-navy">
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">Projetos</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Projetos desenvolvidos nos laboratórios do grupo.
          </p>
        </div>

        <Button
          size="lg"
          className="h-10 w-full shrink-0 px-4 font-semibold sm:w-auto"
          disabled={!canCreate}
          onClick={openCreateDialog}
        >
          <Plus aria-hidden="true" />
          Novo projeto
        </Button>
      </header>

      {!canCreate && (
        <p className="mt-4 rounded-lg border border-slate-200 bg-card px-4 py-3 text-sm text-muted-foreground">
          Para cadastrar projetos, o grupo precisa de ao menos um{' '}
          <Link to="../laboratorios" relative="path" className="font-semibold text-primary underline-offset-4 hover:underline">
            laboratório
          </Link>{' '}
          e uma{' '}
          <Link to="../linhas-de-pesquisa" relative="path" className="font-semibold text-primary underline-offset-4 hover:underline">
            linha de pesquisa
          </Link>
          .
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="projects-search" className="block text-xs font-semibold text-brand-navy">
            Buscar
          </label>
          <InputGroup className="mt-1.5 h-10 w-full bg-card">
            <InputGroupAddon align="inline-start" className="pl-3">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="projects-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Nome ou objetivo"
              className="h-full text-sm"
            />
          </InputGroup>
        </div>

        <FilterSelect
          id="projects-status-filter"
          label="Situação"
          className="w-full sm:w-44"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: ALL, label: 'Todas' },
            ...projectStatusValues.map((status) => ({ value: status, label: projectStatusLabels[status] })),
          ]}
        />
        <FilterSelect
          id="projects-laboratory-filter"
          label="Laboratório"
          className="w-full sm:w-52"
          value={effectiveLaboratoryFilter}
          onChange={setLaboratoryFilter}
          options={[
            { value: ALL, label: 'Todos' },
            ...laboratories.map((laboratory) => ({ value: laboratory.id, label: laboratory.name })),
          ]}
        />
        <FilterSelect
          id="projects-research-line-filter"
          label="Linha de pesquisa"
          className="w-full sm:w-52"
          value={effectiveResearchLineFilter}
          onChange={setResearchLineFilter}
          options={[
            { value: ALL, label: 'Todas' },
            ...researchLines.map((line) => ({ value: line.id, label: line.name })),
          ]}
        />
      </div>

      {projects.length === 0 ? (
        <section
          aria-labelledby="projects-empty-title"
          className="mt-5 rounded-xl border border-dashed border-slate-200 bg-card px-6 py-12 text-center"
        >
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <FolderKanban aria-hidden="true" className="size-5" />
          </span>
          <h2 id="projects-empty-title" className="mt-4 text-base font-bold text-brand-navy">
            Nenhum projeto cadastrado
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Cadastre os projetos do grupo para acompanhar sua situação, período e linha de pesquisa.
          </p>
          {canCreate && (
            <Button className="mt-5 font-semibold" onClick={openCreateDialog}>
              <Plus aria-hidden="true" />
              Novo projeto
            </Button>
          )}
        </section>
      ) : filteredProjects.length === 0 ? (
        <section
          aria-labelledby="projects-no-match-title"
          className="mt-5 rounded-xl border border-slate-200 bg-card px-6 py-10 text-center"
        >
          <h2 id="projects-no-match-title" className="text-base font-bold text-brand-navy">
            Nenhum projeto encontrado
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nenhum projeto corresponde aos filtros selecionados.
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </section>
      ) : (
        <div className="mt-5">
          <div className="hidden md:block">
            <ProjectsTable projects={filteredProjects} {...listProps} />
          </div>
          <ul aria-label="Projetos do grupo" className="space-y-3 md:hidden">
            {filteredProjects.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} {...listProps} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            {filteredProjects.length} de {projects.length}{' '}
            {projects.length === 1 ? 'projeto' : 'projetos'}
          </p>
        </div>
      )}

      <ProjectFormDialog
        state={formDialog}
        laboratories={laboratories}
        researchLines={researchLines}
        onOpenChange={(open) => {
          if (!open) setFormDialog({ open: false })
        }}
        onSaved={(mode) => {
          setFormDialog({ open: false })
          publishToast({
            kind: 'success',
            title: mode === 'create' ? 'Projeto criado' : 'Projeto atualizado',
            description: 'As alterações foram salvas.',
          })
        }}
      />

      <DeleteProjectDialog
        project={projectToDelete}
        onOpenChange={(open) => {
          if (!open) setProjectToDelete(null)
        }}
        onDeleted={() => {
          setProjectToDelete(null)
          publishToast({ kind: 'success', title: 'Projeto excluído', description: 'O projeto foi removido.' })
        }}
      />
    </section>
  )
}
