import { useEffect, useState, type ReactNode } from 'react'
import { FlaskConical, Plus, Search } from 'lucide-react'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError } from '@/lib/api-client'
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import { DeleteLaboratoryDialog } from '@/pages/laboratories/components/delete-laboratory-dialog'
import { LaboratoryCard } from '@/pages/laboratories/components/laboratory-card'
import {
  LaboratoryFormDialog,
  type LaboratoryDialogState,
} from '@/pages/laboratories/components/laboratory-form-dialog'
import {
  formatLaboratoryAddress,
  getLaboratoryInitials,
  laboratoryStatusLabels,
} from '@/pages/laboratories/laboratory-format'
import {
  useLaboratoriesQuery,
  useLaboratoryMetricsQuery,
} from '@/queries/laboratories/laboratories.queries'
import { laboratoryStatusValues } from '@/types/laboratories/laboratory.schema'
import type { Laboratory, LaboratoryStatus } from '@/types/laboratories/laboratory.types'

type StatusFilter = LaboratoryStatus | 'ALL'

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function matchesLaboratorySearch(laboratory: Laboratory, rawQuery: string) {
  const query = normalizeSearchText(rawQuery.trim())
  if (!query) return true

  const searchableFields = [
    laboratory.name,
    getLaboratoryInitials(laboratory.name),
    laboratory.description ?? '',
    formatLaboratoryAddress(laboratory.address) ?? '',
  ]

  return searchableFields.some((field) => normalizeSearchText(field).includes(query))
}

function PageState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="laboratories-title" className="max-w-xl">
      <h1 id="laboratories-title" className="text-2xl font-bold tracking-tight text-brand-navy">
        {title}
      </h1>
      {children}
    </section>
  )
}

export function LaboratoriesPage() {
  const selectedGroup = useResearchGroup()
  const {
    data: laboratories,
    isPending,
    isError,
    error,
    refetch,
  } = useLaboratoriesQuery(selectedGroup.id)
  const { stockByLaboratoryId, projectCountByLaboratoryId, stockError, projectsError } =
    useLaboratoryMetricsQuery(selectedGroup.id, laboratories ?? [])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [formDialog, setFormDialog] = useState<LaboratoryDialogState>({ open: false })
  const [laboratoryToDelete, setLaboratoryToDelete] = useState<Laboratory | null>(null)

  useEffect(() => {
    if (isError) publishApiErrorToast(error)
  }, [error, isError])

  useEffect(() => {
    if (stockError) publishApiErrorToast(stockError)
  }, [stockError])

  useEffect(() => {
    if (projectsError) publishApiErrorToast(projectsError)
  }, [projectsError])

  if (isPending) {
    return (
      <PageState title="Laboratórios">
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Carregando os laboratórios…
        </p>
      </PageState>
    )
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404

    return (
      <PageState
        title={notFound ? 'Grupo não encontrado' : 'Não foi possível carregar os laboratórios'}
      >
        <p className="mt-2 text-sm text-muted-foreground">
          {notFound
            ? 'Este grupo de pesquisa pode ter sido removido. Selecione outro grupo no menu lateral.'
            : 'Confira sua conexão e tente novamente.'}
        </p>
        {!notFound && (
          <Button className="mt-6" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        )}
      </PageState>
    )
  }

  const filteredLaboratories = laboratories.filter(
    (laboratory) =>
      (statusFilter === 'ALL' || laboratory.status === statusFilter) &&
      matchesLaboratorySearch(laboratory, searchQuery),
  )
  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL'

  function openCreateDialog() {
    setFormDialog({ open: true, mode: 'create' })
  }

  function openEditDialog(laboratory: Laboratory) {
    setFormDialog({ open: true, mode: 'edit', laboratory })
  }

  function clearFilters() {
    setSearchQuery('')
    setStatusFilter('ALL')
  }

  return (
    <section aria-labelledby="laboratories-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 id="laboratories-title" className="text-3xl font-bold tracking-tight text-brand-navy">
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">Laboratórios</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Onde os itens ficam guardados e onde os projetos acontecem. Todos pertencem à{' '}
            {selectedGroup.institutionName}.
          </p>
        </div>

        <Button
          size="lg"
          className="h-10 w-full shrink-0 px-4 font-semibold sm:w-auto"
          onClick={openCreateDialog}
        >
          <Plus aria-hidden="true" />
          Novo laboratório
        </Button>
      </header>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="laboratories-search" className="block text-xs font-semibold text-brand-navy">
            Buscar
          </label>
          <InputGroup className="mt-1.5 h-10 w-full bg-card">
            <InputGroupAddon align="inline-start" className="pl-3">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="laboratories-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Nome ou sigla"
              className="h-full text-sm"
            />
          </InputGroup>
        </div>

        <div className="w-full sm:w-48">
          <label
            htmlFor="laboratories-status-filter"
            className="block text-xs font-semibold text-brand-navy"
          >
            Situação
          </label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger
              id="laboratories-status-filter"
              className="mt-1.5 h-10 w-full bg-card px-3 text-sm font-medium text-brand-navy"
            >
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {laboratoryStatusValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {laboratoryStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {laboratories.length === 0 ? (
        <section
          aria-labelledby="laboratories-empty-title"
          className="mt-5 rounded-xl border border-dashed border-slate-200 bg-card px-6 py-12 text-center"
        >
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <FlaskConical aria-hidden="true" className="size-5" />
          </span>
          <h2 id="laboratories-empty-title" className="mt-4 text-base font-bold text-brand-navy">
            Nenhum laboratório cadastrado
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Cadastre os laboratórios do grupo para registrar o estoque de cada espaço e vincular
            projetos a eles.
          </p>
          <Button className="mt-5 font-semibold" onClick={openCreateDialog}>
            <Plus aria-hidden="true" />
            Novo laboratório
          </Button>
        </section>
      ) : filteredLaboratories.length === 0 ? (
        <section
          aria-labelledby="laboratories-no-match-title"
          className="mt-5 rounded-xl border border-slate-200 bg-card px-6 py-10 text-center"
        >
          <h2 id="laboratories-no-match-title" className="text-base font-bold text-brand-navy">
            Nenhum laboratório encontrado
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nenhum laboratório corresponde aos filtros selecionados.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </section>
      ) : (
        <ul
          aria-label="Laboratórios do grupo"
          className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredLaboratories.map((laboratory) => (
            <li key={laboratory.id}>
              <LaboratoryCard
                laboratory={laboratory}
                stock={stockByLaboratoryId[laboratory.id]}
                projectCount={projectCountByLaboratoryId[laboratory.id]}
                onEdit={openEditDialog}
                onDelete={setLaboratoryToDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <LaboratoryFormDialog
        researchGroupId={selectedGroup.id}
        state={formDialog}
        onOpenChange={(open) => {
          if (!open) setFormDialog({ open: false })
        }}
        onSaved={(mode) => {
          setFormDialog({ open: false })
          publishToast({
            kind: 'success',
            title: mode === 'create' ? 'Laboratório criado' : 'Laboratório atualizado',
            description: 'As alterações foram salvas.',
          })
        }}
      />

      <DeleteLaboratoryDialog
        laboratory={laboratoryToDelete}
        onOpenChange={(open) => {
          if (!open) setLaboratoryToDelete(null)
        }}
        onDeleted={() => {
          setLaboratoryToDelete(null)
          publishToast({
            kind: 'success',
            title: 'Laboratório excluído',
            description: 'O laboratório foi removido do grupo.',
          })
        }}
      />
    </section>
  )
}
