import { AppShell } from '@/components/layout/app-shell'
import { CreateFirstGroup } from '@/components/create-first-group'
import { Button } from '@/components/ui/button'
import { useLogoutMutation } from '@/queries/auth/auth.queries'
import type { ResearchGroup } from '@/types/research-groups/research-group.types'

export function RouteLoadingState() {
  return (
    <main className="grid min-h-svh place-items-center bg-slate-50 px-6">
      <p role="status" className="text-sm text-muted-foreground">Carregando seus grupos de pesquisa…</p>
    </main>
  )
}

export function RouteErrorState({ onRetry }: { onRetry: () => void }) {
  const logout = useLogoutMutation()

  return (
    <main className="grid min-h-svh place-items-center bg-slate-50 px-6">
      <section className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight">Não foi possível carregar os grupos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Confira sua conexão e tente novamente.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={onRetry}>Tentar novamente</Button>
          <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
            Sair
          </Button>
        </div>
      </section>
    </main>
  )
}

export function EmptyGroupsState({ groups = [] }: { groups?: ResearchGroup[] }) {
  return (
    <AppShell groups={groups} selectedGroup={null}>
      <CreateFirstGroup />
    </AppShell>
  )
}
