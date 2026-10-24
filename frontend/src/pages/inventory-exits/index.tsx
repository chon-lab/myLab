import { useEffect, useState } from 'react'
import { ArrowUpFromLine } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useResearchGroup } from '@/components/layout/research-group-context'
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import { InventoryExitFormDialog } from '@/pages/inventory-exits/components/inventory-exit-form-dialog'
import {
  formatCurrencyBRL,
  formatMovementDate,
  formatMovementReasonLabel,
} from '@/pages/inventory-stock/inventory-stock-format'
import { useInventoryExitsQuery } from '@/queries/inventory/inventory.queries'
import type { InventoryExitHistoryRecord } from '@/types/inventory/inventory.types'

const exitTypeBadgeClasses: Record<InventoryExitHistoryRecord['type'], string> = {
  CONSUMPTION: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  DISPOSAL: 'border-amber-200 bg-amber-50 text-amber-800',
  LOSS: 'border-rose-200 bg-rose-50 text-rose-800',
}

function getExitTotal(exit: InventoryExitHistoryRecord) {
  return exit.items.reduce((total, item) => total + item.totalCost, 0)
}

function getExitItemsLabel(exit: InventoryExitHistoryRecord) {
  return `${exit.items.length} ${exit.items.length === 1 ? 'item' : 'itens'}`
}

function ExitTypeBadge({ type }: { type: InventoryExitHistoryRecord['type'] }) {
  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${exitTypeBadgeClasses[type]}`}>
      {formatMovementReasonLabel(type)}
    </Badge>
  )
}

function ExitStatusBadge({ status }: { status: InventoryExitHistoryRecord['status'] }) {
  const isConfirmed = status === 'CONFIRMED'

  return (
    <Badge
      variant="outline"
      className={isConfirmed
        ? 'gap-1.5 rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800'
        : 'gap-1.5 rounded-full border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800'}
    >
      <span aria-hidden="true" className={isConfirmed ? 'size-1.5 rounded-full bg-emerald-600' : 'size-1.5 rounded-full bg-rose-600'} />
      {isConfirmed ? 'Confirmada' : 'Estornada'}
    </Badge>
  )
}

export function InventoryExitsPage() {
  const researchGroup = useResearchGroup()
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(() => searchParams.get('openExit') === 'true')
  const exitsQuery = useInventoryExitsQuery(researchGroup.id)
  const exits = exitsQuery.data ?? []

  useEffect(() => {
    if (searchParams.get('openExit') !== 'true') return

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('openExit')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (exitsQuery.isError) publishApiErrorToast(exitsQuery.error)
  }, [exitsQuery.error, exitsQuery.isError])

  return (
    <section aria-labelledby="inventory-exits-title" className="w-full">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 id="inventory-exits-title" className="text-2xl font-bold tracking-tight text-brand-navy">
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">Saídas</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Consumo, descarte e perdas de itens do estoque.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => setFormOpen(true)}
          className="h-10 w-full shrink-0 px-4 font-semibold sm:w-auto"
        >
          <ArrowUpFromLine aria-hidden="true" />
          Registrar saída
        </Button>
      </div>

      {exitsQuery.isPending ? (
        <p role="status" className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Carregando saídas…
        </p>
      ) : exitsQuery.isError ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-8 text-center">
          <p role="alert" className="text-sm text-destructive">Não foi possível carregar as saídas.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void exitsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : exits.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-10 text-center">
          <p className="text-sm font-semibold text-brand-navy">Nenhuma saída registrada.</p>
          <p className="mt-1 text-sm text-muted-foreground">Registre o consumo, descarte ou perda de um item.</p>
        </div>
      ) : (
        <>
          <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 bg-card md:block">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-3 font-semibold">Data</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Motivo</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Laboratório</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Itens</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Custo</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-brand-navy">
                {exits.map((exit) => (
                  <tr key={exit.id} className={exit.status === 'REVERSED' ? 'text-muted-foreground' : ''}>
                    <td className="whitespace-nowrap px-3 py-3.5">{formatMovementDate(exit.occurredAt)}</td>
                    <td className="px-3 py-3.5"><ExitTypeBadge type={exit.type} /></td>
                    <td className="max-w-48 truncate px-3 py-3.5 font-semibold" title={exit.laboratoryName}>{exit.laboratoryName}</td>
                    <td className="max-w-64 truncate px-3 py-3.5" title={exit.items.map((item) => item.itemName).join(', ')}>
                      {getExitItemsLabel(exit)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-right font-semibold">{formatCurrencyBRL(getExitTotal(exit))}</td>
                    <td className="whitespace-nowrap px-3 py-3.5"><ExitStatusBadge status={exit.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul aria-label="Saídas registradas" className="mt-5 space-y-3 md:hidden">
            {exits.map((exit) => (
              <li key={exit.id} className={`rounded-xl border border-slate-200 bg-card p-4 ${exit.status === 'REVERSED' ? 'opacity-70' : ''}`}>
                <p className="break-words text-sm font-semibold text-brand-navy">{exit.laboratoryName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatMovementDate(exit.occurredAt)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ExitTypeBadge type={exit.type} />
                  <ExitStatusBadge status={exit.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Itens</dt>
                    <dd className="mt-1 font-medium text-brand-navy">{getExitItemsLabel(exit)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Custo</dt>
                    <dd className="mt-1 font-semibold text-brand-navy">{formatCurrencyBRL(getExitTotal(exit))}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}

      <InventoryExitFormDialog
        researchGroupId={researchGroup.id}
        open={formOpen}
        preselectedItemId={searchParams.get('itemId')}
        preselectedLaboratoryId={searchParams.get('laboratoryId')}
        onOpenChange={setFormOpen}
        onCreated={() => {
          setFormOpen(false)
          publishToast({
            kind: 'success',
            title: 'Saída registrada',
            description: 'O saldo e o histórico foram atualizados.',
          })
        }}
      />
    </section>
  )
}
