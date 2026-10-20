import { useState, type ReactNode } from 'react'
import { CircleCheck, Layers3, Plus, Search } from 'lucide-react'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { ApiError } from '@/lib/api-client'
import { DeleteResearchLineDialog } from '@/pages/research-lines/components/delete-research-line-dialog'
import { ResearchLineCard } from '@/pages/research-lines/components/research-line-card'
import {
  ResearchLineFormDialog,
  type ResearchLineDialogState,
} from '@/pages/research-lines/components/research-line-form-dialog'
import {
  useResearchLinesQuery,
  useResearchLineUsageCountsQuery,
} from '@/queries/research-lines/research-lines.queries'
import type { ResearchLine } from '@/types/research-lines/research-line.types'

type FeedbackState = 'created' | 'updated' | 'deleted' | null

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function matchesResearchLineSearch(line: ResearchLine, rawQuery: string) {
  const query = normalizeSearchText(rawQuery.trim())
  if (!query) return true

  const searchableFields = [
    line.name,
    line.objective,
    ...(line.keywords ?? []),
    ...(line.knowledgeAreas ?? []),
  ]

  return searchableFields.some((field) => normalizeSearchText(field).includes(query))
}

function PageState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="research-lines-title" className="max-w-xl">
      <h1 id="research-lines-title" className="text-2xl font-bold tracking-tight text-brand-navy">
        {title}
      </h1>
      {children}
    </section>
  )
}

export function ResearchLinesPage() {
  const selectedGroup = useResearchGroup()
  const {
    data: researchLines,
    isPending,
    isError,
    error,
    refetch,
  } = useResearchLinesQuery(selectedGroup.id)
  const { membersCountByLineId, projectsCountByLineId } = useResearchLineUsageCountsQuery(
    selectedGroup.id,
    researchLines ?? [],
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [formDialog, setFormDialog] = useState<ResearchLineDialogState>({ open: false })
  const [lineToDelete, setLineToDelete] = useState<ResearchLine | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  if (isPending) {
    return (
      <PageState title="Linhas de pesquisa">
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Carregando as linhas de pesquisa…
        </p>
      </PageState>
    )
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404

    return (
      <PageState
        title={
          notFound
            ? 'Grupo não encontrado'
            : 'Não foi possível carregar as linhas de pesquisa'
        }
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

  const filteredLines = researchLines.filter((line) =>
    matchesResearchLineSearch(line, searchQuery),
  )

  function openCreateDialog() {
    setFeedback(null)
    setFormDialog({ open: true, mode: 'create' })
  }

  function openEditDialog(line: ResearchLine) {
    setFeedback(null)
    setFormDialog({ open: true, mode: 'edit', line })
  }

  function openDeleteDialog(line: ResearchLine) {
    setFeedback(null)
    setLineToDelete(line)
  }

  return (
    <section aria-labelledby="research-lines-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 id="research-lines-title" className="text-3xl font-bold tracking-tight text-brand-navy">
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">
              Linhas de pesquisa
            </span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Os temas que o grupo investiga. Cada projeto e cada membro se ligam a uma ou mais
            linhas.
          </p>
        </div>

        <Button
          size="lg"
          className="h-10 w-full shrink-0 px-4 font-semibold sm:w-auto"
          onClick={openCreateDialog}
        >
          <Plus aria-hidden="true" />
          Nova linha de pesquisa
        </Button>
      </header>

      <div role="status" className="mt-4 empty:hidden">
        {feedback && (
          <p className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {feedback === 'created' && 'Linha de pesquisa criada com sucesso.'}
            {feedback === 'updated' && 'Linha de pesquisa atualizada com sucesso.'}
            {feedback === 'deleted' && 'Linha de pesquisa excluída com sucesso.'}
          </p>
        )}
      </div>

      <div className="mt-6">
        <label
          htmlFor="research-lines-search"
          className="block text-xs font-semibold text-brand-navy"
        >
          Buscar
        </label>
        <InputGroup className="mt-1.5 h-10 w-full bg-card sm:max-w-xs">
          <InputGroupAddon align="inline-start" className="pl-3">
            <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            id="research-lines-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Nome ou palavra-chave"
            className="h-full text-sm"
          />
        </InputGroup>
      </div>

      {researchLines.length === 0 ? (
        <section
          aria-labelledby="research-lines-empty-title"
          className="mt-5 rounded-xl border border-dashed border-slate-200 bg-card px-6 py-12 text-center"
        >
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Layers3 aria-hidden="true" className="size-5" />
          </span>
          <h2 id="research-lines-empty-title" className="mt-4 text-base font-bold text-brand-navy">
            Nenhuma linha de pesquisa cadastrada
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Cadastre as linhas de pesquisa do grupo para associar projetos e pesquisadores aos
            temas investigados.
          </p>
          <Button className="mt-5 font-semibold" onClick={openCreateDialog}>
            <Plus aria-hidden="true" />
            Nova linha de pesquisa
          </Button>
        </section>
      ) : filteredLines.length === 0 ? (
        <section
          aria-labelledby="research-lines-no-match-title"
          className="mt-5 rounded-xl border border-slate-200 bg-card px-6 py-10 text-center"
        >
          <h2 id="research-lines-no-match-title" className="text-base font-bold text-brand-navy">
            Nenhuma linha de pesquisa encontrada
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Não encontramos resultados para “{searchQuery.trim()}”.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
            Limpar busca
          </Button>
        </section>
      ) : (
        <ul aria-label="Linhas de pesquisa do grupo" className="mt-5 space-y-4">
          {filteredLines.map((line) => (
            <li key={line.id}>
              <ResearchLineCard
                line={line}
                memberCount={
                  membersCountByLineId ? (membersCountByLineId[line.id] ?? 0) : null
                }
                projectCount={
                  projectsCountByLineId ? (projectsCountByLineId[line.id] ?? 0) : null
                }
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
            </li>
          ))}
        </ul>
      )}

      <ResearchLineFormDialog
        researchGroupId={selectedGroup.id}
        state={formDialog}
        onOpenChange={(open) => {
          if (!open) setFormDialog({ open: false })
        }}
        onSaved={(mode) => {
          setFormDialog({ open: false })
          setFeedback(mode === 'create' ? 'created' : 'updated')
        }}
      />

      <DeleteResearchLineDialog
        line={lineToDelete}
        onOpenChange={(open) => {
          if (!open) setLineToDelete(null)
        }}
        onDeleted={() => {
          setLineToDelete(null)
          setFeedback('deleted')
        }}
      />
    </section>
  )
}

