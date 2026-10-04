import { Navigate, useLocation, useParams } from 'react-router'

import { useResearchGroupsQuery } from '@/queries/research-groups/research-groups.queries'
import type { ResearchGroup } from '@/types/research-groups/research-group.types'

const pages = [
  ['dados-do-grupo', 'Dados do grupo'],
  ['linhas-de-pesquisa', 'Linhas de pesquisa'],
  ['membros', 'Membros'],
  ['laboratorios', 'Laboratórios'],
  ['projetos', 'Projetos'],
  ['estoque/saldo', 'Saldo do estoque'],
  ['estoque/itens', 'Itens do estoque'],
  ['estoque/entradas', 'Entradas de estoque'],
  ['estoque/saidas', 'Saídas de estoque'],
  ['estoque/transferencias', 'Transferências de estoque'],
]

export function NavigationPlaceholderPage({ group }: { group: ResearchGroup }) {
  const { pathname } = useLocation()
  const pageTitle = pages.find(([path]) => pathname.endsWith(path))?.[1] ?? 'Página'

  return (
    <section aria-labelledby="placeholder-title" className="max-w-3xl">
      <p className="text-sm font-semibold text-primary">{group.name}</p>
      <h1 id="placeholder-title" className="mt-2 text-2xl font-bold tracking-tight text-brand-navy">
        {pageTitle}
      </h1>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm leading-6 text-muted-foreground">
          Esta tela será implementada em uma próxima etapa. O grupo selecionado para esta navegação é {group.name}.
        </p>
      </div>
    </section>
  )
}

export function GroupPlaceholderRoute() {
  const { researchGroupId } = useParams()
  const { data: groups = [] } = useResearchGroupsQuery()
  const group = groups.find((item) => item.id === researchGroupId)

  if (!group) return <Navigate to="/" replace />

  return <NavigationPlaceholderPage group={group} />
}
