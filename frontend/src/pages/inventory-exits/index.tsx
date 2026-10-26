import { useEffect, useMemo, useState } from 'react'
import { ArrowUpFromLine, FileText, Undo2 } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useResearchGroup } from '@/components/layout/research-group-context'
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import { InventoryExitDetailsDialog } from '@/pages/inventory-exits/components/inventory-exit-details-dialog'
import { InventoryExitFormDialog } from '@/pages/inventory-exits/components/inventory-exit-form-dialog'
import { InventoryExitReverseDialog } from '@/pages/inventory-exits/components/inventory-exit-reverse-dialog'
import {
  formatCurrencyBRL,
  formatMovementDate,
  formatMovementReasonLabel,
} from '@/pages/inventory-stock/inventory-stock-format'
import {
  useInventoryExitsQuery,
  useInventoryItemsQuery,
  useInventoryLaboratoriesQuery,
} from '@/queries/inventory/inventory.queries'
import type {
  InventoryExitHistoryRecord,
  InventoryExitType,
} from '@/types/inventory/inventory.types'

const exitTypes: InventoryExitType[] = ['CONSUMPTION', 'DISPOSAL', 'LOSS']

const exitTypeBadgeClasses: Record<InventoryExitType, string> = {
  CONSUMPTION: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  DISPOSAL: 'border-amber-200 bg-amber-50 text-amber-800',
  LOSS: 'border-rose-200 bg-rose-50 text-rose-800',
}

function isExitType(value: string | null): value is InventoryExitType {
  return exitTypes.includes(value as InventoryExitType)
}

function getExitTotal(exit: InventoryExitHistoryRecord) {
  return exit.items.reduce((total, item) => total + item.totalCost, 0)
}

function getExitItemsLabel(exit: InventoryExitHistoryRecord) {
  return `${exit.items.length} ${exit.items.length === 1 ? 'item' : 'itens'}`
}

function getExitDescription(exit: InventoryExitHistoryRecord) {
  return `${formatMovementReasonLabel(exit.type).toLowerCase()} de ${formatMovementDate(exit.occurredAt)}`
}

function ExitTypeBadge({ type }: { type: InventoryExitType }) {
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

function ExitDetailsButton({
  exit,
  onSelect,
}: {
  exit: InventoryExitHistoryRecord
  onSelect: (exit: InventoryExitHistoryRecord) => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Ver detalhes da saída por ${getExitDescription(exit)}`}
      title="Ver detalhes"
      className="size-10 rounded-lg sm:size-7"
      onClick={() => onSelect(exit)}
    >
      <FileText aria-hidden="true" className="size-5 sm:size-4" />
    </Button>
  )
}

function ExitReverseButton({
  exit,
  onSelect,
}: {
  exit: InventoryExitHistoryRecord
  onSelect: (exit: InventoryExitHistoryRecord) => void
}) {
  const isReversed = exit.status === 'REVERSED'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={isReversed
        ? `Saída por ${getExitDescription(exit)} já estornada`
        : `Estornar saída por ${getExitDescription(exit)}`}
      title={isReversed ? 'Saída já estornada' : 'Estornar saída'}
      className="size-10 rounded-lg text-muted-foreground hover:text-destructive sm:size-7"
      disabled={isReversed}
      onClick={() => onSelect(exit)}
    >
      <Undo2 aria-hidden="true" className="size-5 sm:size-4" />
    </Button>
  )
}

export function InventoryExitsPage() {
  const researchGroup = useResearchGroup()
  const [searchParams, setSearchParams] = useSearchParams()
  const laboratoryId = searchParams.get('laboratoryId') ?? ''
  const typeParam = searchParams.get('type')
  const type: InventoryExitType | '' = isExitType(typeParam) ? typeParam : ''
  const inventoryItemId = searchParams.get('inventoryItemId') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const [formOpen, setFormOpen] = useState(() => searchParams.get('openExit') === 'true')
  const [selectedExit, setSelectedExit] = useState<InventoryExitHistoryRecord | null>(null)
  const [exitToReverse, setExitToReverse] = useState<InventoryExitHistoryRecord | null>(null)

  const laboratoriesQuery = useInventoryLaboratoriesQuery(researchGroup.id)
  const itemsQuery = useInventoryItemsQuery(researchGroup.id)
  const filters = useMemo(() => ({
    laboratoryId: laboratoryId || null,
    type: type || null,
    inventoryItemId: inventoryItemId || null,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
  }), [dateFrom, dateTo, inventoryItemId, laboratoryId, type])
  const invalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo)
  const exitsQuery = useInventoryExitsQuery(researchGroup.id, filters, !invalidDateRange)
  const exits = exitsQuery.data ?? []
  const laboratories = laboratoriesQuery.data ?? []
  const catalogItems = itemsQuery.data ?? []
  const hasFilters = Boolean(laboratoryId || type || inventoryItemId || dateFrom || dateTo)

  useEffect(() => {
    if (searchParams.get('openExit') !== 'true') return

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('openExit')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (laboratoriesQuery.isError) publishApiErrorToast(laboratoriesQuery.error)
  }, [laboratoriesQuery.error, laboratoriesQuery.isError])

  useEffect(() => {
    if (itemsQuery.isError) publishApiErrorToast(itemsQuery.error)
  }, [itemsQuery.error, itemsQuery.isError])

  useEffect(() => {
    if (exitsQuery.isError) publishApiErrorToast(exitsQuery.error)
  }, [exitsQuery.error, exitsQuery.isError])

  function setFilterParam(key: string, value: string) {
    const nextParams = new URLSearchParams(searchParams)
    if (value) nextParams.set(key, value)
    else nextParams.delete(key)
    setSearchParams(nextParams, { replace: true })
  }

  function clearFilters() {
    const nextParams = new URLSearchParams(searchParams)
    for (const key of ['laboratoryId', 'type', 'inventoryItemId', 'dateFrom', 'dateTo']) {
      nextParams.delete(key)
    }
    setSearchParams(nextParams, { replace: true })
  }

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

      <section aria-label="Filtros das saídas" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1fr_1fr]">
        <div className="space-y-1.5">
          <label htmlFor="inventory-exits-laboratory" className="text-xs font-semibold text-brand-navy">Laboratório</label>
          <Select value={laboratoryId || '__all__'} onValueChange={(value) => setFilterParam('laboratoryId', value === '__all__' ? '' : value)}>
            <SelectTrigger id="inventory-exits-laboratory" className="h-10 w-full" disabled={laboratoriesQuery.isPending || laboratoriesQuery.isError}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {laboratories.map((laboratory) => (
                <SelectItem key={laboratory.id} value={laboratory.id}>{laboratory.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-exits-type" className="text-xs font-semibold text-brand-navy">Motivo</label>
          <Select value={type || '__all__'} onValueChange={(value) => setFilterParam('type', value === '__all__' ? '' : value)}>
            <SelectTrigger id="inventory-exits-type" className="h-10 w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {exitTypes.map((exitType) => (
                <SelectItem key={exitType} value={exitType}>{formatMovementReasonLabel(exitType)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-exits-item" className="text-xs font-semibold text-brand-navy">Item</label>
          <Select value={inventoryItemId || '__all__'} onValueChange={(value) => setFilterParam('inventoryItemId', value === '__all__' ? '' : value)}>
            <SelectTrigger id="inventory-exits-item" className="h-10 w-full" disabled={itemsQuery.isPending || itemsQuery.isError}>
              <SelectValue placeholder="Qualquer item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Qualquer item</SelectItem>
              {catalogItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-exits-date-from" className="text-xs font-semibold text-brand-navy">De</label>
          <Input id="inventory-exits-date-from" type="date" value={dateFrom} onChange={(event) => setFilterParam('dateFrom', event.target.value)} className="h-10" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-exits-date-to" className="text-xs font-semibold text-brand-navy">Até</label>
          <Input id="inventory-exits-date-to" type="date" value={dateTo} onChange={(event) => setFilterParam('dateTo', event.target.value)} className="h-10" />
        </div>
      </section>

      {laboratoriesQuery.isError && (
        <p role="alert" className="mt-4 text-sm text-destructive">Não foi possível carregar a lista de laboratórios para filtrar.</p>
      )}
      {itemsQuery.isError && (
        <p role="alert" className="mt-4 text-sm text-destructive">Não foi possível carregar a lista de itens para filtrar.</p>
      )}

      {invalidDateRange ? (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-800">
          A data inicial deve ser anterior à data final. Corrija o período para consultar as saídas.
        </p>
      ) : exitsQuery.isPending ? (
        <p role="status" className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Carregando saídas…
        </p>
      ) : exitsQuery.isError ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-8 text-center">
          <p role="alert" className="text-sm text-destructive">Não foi possível carregar o histórico de saídas.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void exitsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : exits.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-10 text-center">
          <p className="text-sm font-semibold text-brand-navy">Nenhuma saída encontrada.</p>
          <p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros ou registre uma nova saída.</p>
          {hasFilters && (
            <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>Limpar filtros</Button>
          )}
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
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Ações</th>
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
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <ExitDetailsButton exit={exit} onSelect={setSelectedExit} />
                        <ExitReverseButton exit={exit} onSelect={setExitToReverse} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul aria-label="Saídas registradas" className="mt-5 space-y-3 md:hidden">
            {exits.map((exit) => (
              <li key={exit.id} className={`rounded-xl border border-slate-200 bg-card p-4 ${exit.status === 'REVERSED' ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-brand-navy">{exit.laboratoryName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatMovementDate(exit.occurredAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ExitDetailsButton exit={exit} onSelect={setSelectedExit} />
                    <ExitReverseButton exit={exit} onSelect={setExitToReverse} />
                  </div>
                </div>
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
      <InventoryExitDetailsDialog
        exit={selectedExit}
        onOpenChange={(open) => {
          if (!open) setSelectedExit(null)
        }}
      />
      <InventoryExitReverseDialog
        researchGroupId={researchGroup.id}
        exit={exitToReverse}
        onOpenChange={(open) => {
          if (!open) setExitToReverse(null)
        }}
        onReversed={() => setExitToReverse(null)}
      />
    </section>
  )
}
