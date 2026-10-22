import { MapPin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  formatLaboratoryAddress,
  getLaboratoryInitials,
  laboratoryStatusBadgeClasses,
  laboratoryStatusDotClasses,
  laboratoryStatusLabels,
} from '@/pages/laboratories/laboratory-format'
import { formatCurrencyBRL } from '@/pages/inventory-stock/inventory-stock-format'
import type {
  Laboratory,
  LaboratoryMetric,
  LaboratoryStockSummary,
} from '@/types/laboratories/laboratory.types'

function MetricValue<T>({
  metric,
  format,
}: {
  metric: LaboratoryMetric<T> | undefined
  format: (data: T) => string
}) {
  if (!metric || metric.status === 'pending') {
    return (
      <span className="block h-5 w-16 animate-pulse rounded bg-slate-100">
        <span className="sr-only">Carregando…</span>
      </span>
    )
  }

  if (metric.status === 'error') {
    return (
      <span>
        <span aria-hidden="true">—</span>
        <span className="sr-only">Indisponível</span>
      </span>
    )
  }

  return <>{format(metric.data)}</>
}

export function LaboratoryCard({
  laboratory,
  stock,
  projectCount,
  onEdit,
  onDelete,
}: {
  laboratory: Laboratory
  stock: LaboratoryMetric<LaboratoryStockSummary> | undefined
  projectCount: LaboratoryMetric<number> | undefined
  onEdit: (laboratory: Laboratory) => void
  onDelete: (laboratory: Laboratory) => void
}) {
  const titleId = `laboratory-title-${laboratory.id}`
  const address = formatLaboratoryAddress(laboratory.address)
  const itemCount = stock?.status === 'success' ? stock.data.itemCount : null
  const projects = projectCount?.status === 'success' ? projectCount.data : null

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col rounded-xl border border-slate-200 bg-card shadow-xs"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-navy text-sm font-bold text-brand-yellow"
          >
            {getLaboratoryInitials(laboratory.name)}
          </span>

          <div className="flex items-center gap-1">
            <Badge
              className={cn(
                'h-6 gap-1.5 rounded-full px-2.5 text-xs font-semibold',
                laboratoryStatusBadgeClasses[laboratory.status],
              )}
            >
              <span
                aria-hidden="true"
                className={cn('size-1.5 rounded-full', laboratoryStatusDotClasses[laboratory.status])}
              />
              {laboratoryStatusLabels[laboratory.status]}
            </Badge>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Ações de ${laboratory.name}`}
                >
                  <MoreHorizontal aria-hidden="true" className="size-5 sm:size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  className="min-h-10 gap-2.5"
                  onSelect={() => onEdit(laboratory)}
                >
                  <Pencil aria-hidden="true" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="min-h-10 gap-2.5"
                  onSelect={() => onDelete(laboratory)}
                >
                  <Trash2 aria-hidden="true" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h2 id={titleId} className="mt-4 text-base font-bold break-words text-brand-navy">
          {laboratory.name}
        </h2>

        {laboratory.description ? (
          <p className="mt-1.5 text-sm leading-relaxed break-words whitespace-pre-line text-muted-foreground">
            {laboratory.description}
          </p>
        ) : (
          <p className="mt-1.5 text-sm text-muted-foreground italic">Sem descrição.</p>
        )}

        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <span className="break-words">
            <span className="sr-only">Endereço: </span>
            {address ?? 'Endereço não informado'}
          </span>
        </p>
      </div>

      <dl className="grid grid-cols-[1.6fr_1fr_1fr] border-t border-slate-100">
        <div className="flex flex-col px-5 py-3.5">
          <dt className="order-2 mt-1 text-xs text-muted-foreground">em estoque</dt>
          <dd className="order-1 text-base leading-tight font-bold text-brand-navy">
            <MetricValue metric={stock} format={(data) => formatCurrencyBRL(data.totalValue)} />
          </dd>
        </div>
        <div className="flex flex-col border-l border-slate-100 px-4 py-3.5">
          <dt className="order-2 mt-1 text-xs text-muted-foreground">
            {itemCount === 1 ? 'item' : 'itens'}
          </dt>
          <dd className="order-1 text-base leading-tight font-bold text-brand-navy">
            <MetricValue metric={stock} format={(data) => String(data.itemCount)} />
          </dd>
        </div>
        <div className="flex flex-col border-l border-slate-100 px-4 py-3.5">
          <dt className="order-2 mt-1 text-xs text-muted-foreground">
            {projects === 1 ? 'projeto' : 'projetos'}
          </dt>
          <dd className="order-1 text-base leading-tight font-bold text-brand-navy">
            <MetricValue metric={projectCount} format={(data) => String(data)} />
          </dd>
        </div>
      </dl>
    </article>
  )
}
