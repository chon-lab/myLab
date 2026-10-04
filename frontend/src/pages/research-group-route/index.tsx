import { Navigate, useParams } from 'react-router'

import { AppShell } from '@/components/layout/app-shell'
import { ResearchGroupProvider } from '@/components/layout/research-group-provider'
import { Button } from '@/components/ui/button'
import { useResearchGroupsQuery } from '@/queries/research-groups/research-groups.queries'

const selectedGroupStorageKey = 'mylab:selected-research-group'

function LoadingState() {
  return (
    <main className="grid min-h-svh place-items-center bg-slate-50 px-6">
      <p role="status" className="text-sm text-muted-foreground">Carregando seus grupos de pesquisa…</p>
    </main>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center bg-slate-50 px-6">
      <section className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight">Não foi possível carregar os grupos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Confira sua conexão e tente novamente.</p>
        <Button className="mt-6" onClick={onRetry}>Tentar novamente</Button>
      </section>
    </main>
  )
}

function EmptyState() {
  return (
    <main className="grid min-h-svh place-items-center bg-slate-50 px-6">
      <section className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight">Nenhum grupo de pesquisa disponível</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Peça a um administrador para adicionar você a um grupo de pesquisa.
        </p>
      </section>
    </main>
  )
}

function getSavedGroupId() {
  try {
    return window.localStorage.getItem(selectedGroupStorageKey)
  } catch {
    return null
  }
}

export function ResearchGroupIndexRoute() {
  const { data: groups, isPending, isError, refetch } = useResearchGroupsQuery()

  if (isPending) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (groups.length === 0) return <EmptyState />

  const savedGroup = groups.find((group) => group.id === getSavedGroupId())
  const group = savedGroup ?? groups[0]

  return <Navigate to={`/grupos/${group.id}/painel`} replace />
}

export function ResearchGroupRoute() {
  const { data: groups, isPending, isError, refetch } = useResearchGroupsQuery()
  const { researchGroupId } = useParams()

  if (isPending) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (groups.length === 0) return <EmptyState />

  const group = groups.find((item) => item.id === researchGroupId)

  if (!group) return <Navigate to="/" replace />

  return (
    <ResearchGroupProvider group={group}>
      <AppShell groups={groups} selectedGroup={group} />
    </ResearchGroupProvider>
  )
}
