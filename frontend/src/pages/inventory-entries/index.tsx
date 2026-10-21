import { useEffect, useMemo, useState } from 'react'
import { ArrowDownToLine, FileText, Undo2 } from 'lucide-react'
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
import { formatCurrencyBRL, formatMovementDate } from '@/pages/inventory-stock/inventory-stock-format'
import { InventoryEntryDetailsDialog } from '@/pages/inventory-entries/components/inventory-entry-details-dialog'
import { InventoryEntryFormDialog } from '@/pages/inventory-entries/components/inventory-entry-form-dialog'
import { InventoryEntryReverseDialog } from '@/pages/inventory-entries/components/inventory-entry-reverse-dialog'
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import {
  useInventoryEntriesQuery,
  useInventoryItemsQuery,
  useInventoryLaboratoriesQuery,
} from '@/queries/inventory/inventory.queries'
import type {
  InventoryEntryHistoryRecord,
  InventoryEntrySource,
} from '@/types/inventory/inventory.types'

function getSourceLabel(entry: InventoryEntryHistoryRecord) {
  if (entry.source === 'DONATION') return 'Doação'
  return entry.purchaseType === 'FUNDING' ? 'Fomento' : 'Compra'
}

function getSourceBadgeClass(entry: InventoryEntryHistoryRecord) {
  if (entry.source === 'DONATION') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return entry.purchaseType === 'FUNDING'
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : 'border-indigo-200 bg-indigo-50 text-indigo-800'
}

function getEntryTotal(entry: InventoryEntryHistoryRecord) {
  return entry.items.reduce((total, item) => total + item.quantity * item.historicalUnitValue, 0)
}

function getEntryItemsLabel(entry: InventoryEntryHistoryRecord) {
  return `${entry.items.length} ${entry.items.length === 1 ? 'item' : 'itens'}`
}

function EntryStatusBadge({ status }: { status: InventoryEntryHistoryRecord['status'] }) {
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

function EntryDetailsButton({
  entry,
  onSelect,
}: {
  entry: InventoryEntryHistoryRecord
  onSelect: (entry: InventoryEntryHistoryRecord) => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Ver detalhes da entrada de ${entry.sourceName}`}
      title="Ver detalhes"
      className="size-10 rounded-lg sm:size-7"
      onClick={() => onSelect(entry)}
    >
      <FileText aria-hidden="true" className="size-5 sm:size-4" />
    </Button>
  )
}

function EntryReverseButton({
  entry,
  onSelect,
}: {
  entry: InventoryEntryHistoryRecord
  onSelect: (entry: InventoryEntryHistoryRecord) => void
}) {
  const isReversed = entry.status === 'REVERSED'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={isReversed ? `Entrada de ${entry.sourceName} já estornada` : `Estornar entrada de ${entry.sourceName}`}
      title={isReversed ? 'Entrada já estornada' : 'Estornar entrada'}
      className="size-10 rounded-lg text-muted-foreground hover:text-destructive sm:size-7"
      disabled={isReversed}
      onClick={() => onSelect(entry)}
    >
      <Undo2 aria-hidden="true" className="size-5 sm:size-4" />
    </Button>
  )
}

export function InventoryEntriesPage() {
  const researchGroup = useResearchGroup()
  const [searchParams, setSearchParams] = useSearchParams()
  const laboratoryId = searchParams.get('laboratoryId') ?? ''
  const sourceParam = searchParams.get('source')
  const source: InventoryEntrySource | '' = sourceParam === 'PURCHASE' || sourceParam === 'DONATION'
    ? sourceParam
    : ''
  const inventoryItemId = searchParams.get('inventoryItemId') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const [formOpen, setFormOpen] = useState(() => searchParams.get('openEntry') === 'true')
  const [selectedEntry, setSelectedEntry] = useState<InventoryEntryHistoryRecord | null>(null)
  const [entryToReverse, setEntryToReverse] = useState<InventoryEntryHistoryRecord | null>(null)

  const laboratoriesQuery = useInventoryLaboratoriesQuery(researchGroup.id)
  const itemsQuery = useInventoryItemsQuery(researchGroup.id)
  const filters = useMemo(() => ({
    laboratoryId: laboratoryId || null,
    source: (source || null) as InventoryEntrySource | null,
    inventoryItemId: inventoryItemId || null,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
  }), [dateFrom, dateTo, inventoryItemId, laboratoryId, source])
  const invalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo)
  const entriesQuery = useInventoryEntriesQuery(researchGroup.id, filters, !invalidDateRange)
  const entries = entriesQuery.data ?? []
  const laboratories = laboratoriesQuery.data ?? []
  const catalogItems = itemsQuery.data ?? []

  useEffect(() => {
    if (searchParams.get('openEntry') !== 'true') return

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('openEntry')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (laboratoriesQuery.isError) publishApiErrorToast(laboratoriesQuery.error)
  }, [laboratoriesQuery.error, laboratoriesQuery.isError])

  useEffect(() => {
    if (itemsQuery.isError) publishApiErrorToast(itemsQuery.error)
  }, [itemsQuery.error, itemsQuery.isError])

  useEffect(() => {
    if (entriesQuery.isError) publishApiErrorToast(entriesQuery.error)
  }, [entriesQuery.error, entriesQuery.isError])

  function setFilterParam(key: string, value: string) {
    const nextParams = new URLSearchParams(searchParams)
    if (value) nextParams.set(key, value)
    else nextParams.delete(key)
    setSearchParams(nextParams, { replace: true })
  }

  function clearFilters() {
    const nextParams = new URLSearchParams(searchParams)
    for (const key of ['laboratoryId', 'source', 'inventoryItemId', 'dateFrom', 'dateTo']) {
      nextParams.delete(key)
    }
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <section aria-labelledby="inventory-entries-title" className="w-full">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 id="inventory-entries-title" className="text-2xl font-bold tracking-tight text-brand-navy">
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">Entradas</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tudo o que chegou ao estoque, com a origem de cada item.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => setFormOpen(true)}
          className="h-10 w-full shrink-0 px-4 font-semibold sm:w-auto"
        >
          <ArrowDownToLine aria-hidden="true" />
          Registrar entrada
        </Button>
      </div>

      <section aria-label="Filtros das entradas" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1fr_1fr]">
        <div className="space-y-1.5">
          <label htmlFor="inventory-entries-laboratory" className="text-xs font-semibold text-brand-navy">Laboratório</label>
          <Select value={laboratoryId || '__all__'} onValueChange={(value) => setFilterParam('laboratoryId', value === '__all__' ? '' : value)}>
          <SelectTrigger id="inventory-entries-laboratory" className="h-10 w-full" disabled={laboratoriesQuery.isPending || laboratoriesQuery.isError}>
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
          <label htmlFor="inventory-entries-source" className="text-xs font-semibold text-brand-navy">Origem</label>
          <Select value={source || '__all__'} onValueChange={(value) => setFilterParam('source', value === '__all__' ? '' : value)}>
            <SelectTrigger id="inventory-entries-source" className="h-10 w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              <SelectItem value="PURCHASE">Compra</SelectItem>
              <SelectItem value="DONATION">Doação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-entries-item" className="text-xs font-semibold text-brand-navy">Item</label>
          <Select value={inventoryItemId || '__all__'} onValueChange={(value) => setFilterParam('inventoryItemId', value === '__all__' ? '' : value)}>
            <SelectTrigger id="inventory-entries-item" className="h-10 w-full" disabled={itemsQuery.isPending || itemsQuery.isError}>
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
          <label htmlFor="inventory-entries-date-from" className="text-xs font-semibold text-brand-navy">De</label>
          <Input id="inventory-entries-date-from" type="date" value={dateFrom} onChange={(event) => setFilterParam('dateFrom', event.target.value)} className="h-10" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-entries-date-to" className="text-xs font-semibold text-brand-navy">Até</label>
          <Input id="inventory-entries-date-to" type="date" value={dateTo} onChange={(event) => setFilterParam('dateTo', event.target.value)} className="h-10" />
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
          A data inicial deve ser anterior à data final. Corrija o período para consultar as entradas.
        </p>
      ) : entriesQuery.isPending ? (
        <p role="status" className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Carregando entradas…
        </p>
      ) : entriesQuery.isError ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-8 text-center">
          <p role="alert" className="text-sm text-destructive">Não foi possível carregar o histórico de entradas.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void entriesQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : entries.length === 0 && !invalidDateRange ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-10 text-center">
          <p className="text-sm font-semibold text-brand-navy">Nenhuma entrada encontrada.</p>
          <p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros ou registre uma nova entrada.</p>
          {(laboratoryId || source || inventoryItemId || dateFrom || dateTo) && (
            <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>Limpar filtros</Button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 bg-card md:block">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-3 font-semibold">Recebida em</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Origem</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Fornecedor, doador ou agência</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Laboratório</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Itens</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Valor</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Situação</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-brand-navy">
                {entries.map((entry) => (
                  <tr key={entry.id} className={entry.status === 'REVERSED' ? 'text-muted-foreground' : ''}>
                    <td className="whitespace-nowrap px-3 py-3.5">{formatMovementDate(entry.receivedAt)}</td>
                    <td className="px-3 py-3.5">
                      <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${getSourceBadgeClass(entry)}`}>
                        {getSourceLabel(entry)}
                      </Badge>
                    </td>
                    <td className="max-w-56 truncate px-3 py-3.5 font-semibold" title={entry.sourceName}>{entry.sourceName}</td>
                    <td className="max-w-40 truncate px-3 py-3.5" title={entry.laboratoryName}>{entry.laboratoryName}</td>
                    <td className="whitespace-nowrap px-3 py-3.5">{getEntryItemsLabel(entry)}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-right font-semibold">{formatCurrencyBRL(getEntryTotal(entry))}</td>
                    <td className="whitespace-nowrap px-3 py-3.5"><EntryStatusBadge status={entry.status} /></td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <EntryDetailsButton entry={entry} onSelect={setSelectedEntry} />
                        <EntryReverseButton entry={entry} onSelect={setEntryToReverse} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul aria-label="Entradas registradas" className="mt-5 space-y-3 md:hidden">
            {entries.map((entry) => (
              <li key={entry.id} className={`rounded-xl border border-slate-200 bg-card p-4 ${entry.status === 'REVERSED' ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-brand-navy">{entry.sourceName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatMovementDate(entry.receivedAt)} · {entry.laboratoryName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <EntryDetailsButton entry={entry} onSelect={setSelectedEntry} />
                    <EntryReverseButton entry={entry} onSelect={setEntryToReverse} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${getSourceBadgeClass(entry)}`}>
                    {getSourceLabel(entry)}
                  </Badge>
                  <EntryStatusBadge status={entry.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Itens</dt>
                    <dd className="mt-1 font-medium text-brand-navy">{getEntryItemsLabel(entry)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Valor</dt>
                    <dd className="mt-1 font-semibold text-brand-navy">{formatCurrencyBRL(getEntryTotal(entry))}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}

      <InventoryEntryFormDialog
        researchGroupId={researchGroup.id}
        open={formOpen}
        preselectedItemId={searchParams.get('itemId')}
        preselectedLaboratoryId={searchParams.get('laboratoryId')}
        onOpenChange={setFormOpen}
        onCreated={() => {
          setFormOpen(false)
          publishToast({
            kind: 'success',
            title: 'Entrada registrada',
            description: 'O saldo e o histórico foram atualizados.',
          })
        }}
      />
      <InventoryEntryDetailsDialog
        entry={selectedEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null)
        }}
      />
      <InventoryEntryReverseDialog
        researchGroupId={researchGroup.id}
        entry={entryToReverse}
        onOpenChange={(open) => {
          if (!open) setEntryToReverse(null)
        }}
        onReversed={() => setEntryToReverse(null)}
      />
    </section>
  )
}
