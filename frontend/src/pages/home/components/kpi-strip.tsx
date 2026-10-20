import type { ReactNode } from 'react'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatQuantity } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useInventoryItemsQuery, useInventoryStockQuery } from '@/queries/inventory/inventory.queries'
import { useLaboratoriesQuery } from '@/queries/laboratories/laboratories.queries'
import { useProjectsByLaboratoriesQuery } from '@/queries/projects/projects.queries'

type KpiState = { isPending: boolean; isError: boolean }

type KpiProps = {
  label: string
  state: KpiState
  value: ReactNode
  caption: ReactNode
  highlighted?: boolean
}

function Kpi({ label, state, value, caption, highlighted = false }: KpiProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center gap-1 px-6 py-5',
        highlighted ? 'bg-brand-navy text-white' : 'bg-card text-foreground',
      )}
    >
      <dt className={cn('text-sm', highlighted ? 'text-white/80' : 'text-muted-foreground')}>
        {label}
      </dt>
      {state.isPending ? (
        <>
          <dd>
            <Skeleton className="h-8 w-28" />
          </dd>
          <dd>
            <Skeleton className="h-4 w-36" />
          </dd>
        </>
      ) : state.isError ? (
        <>
          <dd className="text-3xl font-bold">—</dd>
          <dd role="alert" className="text-xs text-destructive">
            Não foi possível carregar.
          </dd>
        </>
      ) : (
        <>
          <dd className="text-3xl font-bold tracking-tight">{value}</dd>
          <dd className={cn('text-xs', highlighted ? 'text-white/70' : 'text-muted-foreground')}>
            {caption}
          </dd>
        </>
      )}
    </div>
  )
}

export function KpiStrip() {
  const { id: researchGroupId } = useResearchGroup()
  const stock = useInventoryStockQuery(researchGroupId)
  const items = useInventoryItemsQuery(researchGroupId)
  const laboratories = useLaboratoriesQuery(researchGroupId)
  const projects = useProjectsByLaboratoriesQuery(laboratories.data ?? [])

  const laboratoryCount = laboratories.data?.length ?? 0
  const maintenanceCount =
    laboratories.data?.filter((laboratory) => laboratory.status === 'MAINTENANCE').length ?? 0
  const itemsWithBalance = stock.data?.items.filter((item) => item.quantity > 0).length ?? 0
  const catalogCount = items.data?.filter((item) => item.active).length ?? 0
  const ongoingProjects = projects.data.filter((project) => project.status === 'EM_ANDAMENTO').length

  const projectsState: KpiState = {
    isPending: laboratories.isPending || projects.isPending,
    isError: laboratories.isError || projects.isError,
  }

  return (
    <section aria-label="Indicadores do grupo" className="overflow-hidden rounded-xl border">
      <dl className="grid divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:divide-x">
        <Kpi
          highlighted
          label="Valor total em estoque"
          state={{
            isPending: stock.isPending || laboratories.isPending,
            isError: stock.isError || laboratories.isError,
          }}
          value={formatCurrency(stock.data?.totalValue ?? 0)}
          caption={`Somando ${formatQuantity(laboratoryCount)} ${laboratoryCount === 1 ? 'laboratório' : 'laboratórios'} do grupo`}
        />
        <Kpi
          label="Itens com saldo"
          state={{
            isPending: stock.isPending || items.isPending,
            isError: stock.isError || items.isError,
          }}
          value={formatQuantity(itemsWithBalance)}
          caption={`de ${formatQuantity(catalogCount)} no catálogo`}
        />
        <Kpi
          label="Laboratórios"
          state={laboratories}
          value={formatQuantity(laboratoryCount)}
          caption={`${formatQuantity(maintenanceCount)} em manutenção`}
        />
        <Kpi
          label="Projetos em andamento"
          state={projectsState}
          value={formatQuantity(ongoingProjects)}
          caption={`de ${formatQuantity(projects.data.length)} cadastrados`}
        />
      </dl>
    </section>
  )
}
