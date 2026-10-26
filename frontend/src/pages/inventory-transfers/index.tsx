import { useEffect, useMemo, useState } from 'react'
import { ArrowLeftRight, ArrowRight, FileText, Undo2 } from 'lucide-react'
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
import { InventoryTransferDetailsDialog } from '@/pages/inventory-transfers/components/inventory-transfer-details-dialog'
import { InventoryTransferFormDialog } from '@/pages/inventory-transfers/components/inventory-transfer-form-dialog'
import { InventoryTransferReverseDialog } from '@/pages/inventory-transfers/components/inventory-transfer-reverse-dialog'
import {
  formatCurrencyBRL,
  formatMovementDate,
} from '@/pages/inventory-stock/inventory-stock-format'
import {
  useInventoryItemsQuery,
  useInventoryLaboratoriesQuery,
  useInventoryTransfersQuery,
} from '@/queries/inventory/inventory.queries'
import type { InventoryTransferHistoryRecord } from '@/types/inventory/inventory.types'

function getTransferTotal(transfer: InventoryTransferHistoryRecord) {
  return transfer.items.reduce((total, item) => total + item.totalCost, 0)
}

function getTransferItemsLabel(transfer: InventoryTransferHistoryRecord) {
  return `${transfer.items.length} ${transfer.items.length === 1 ? 'item' : 'itens'}`
}

function getTransferDescription(transfer: InventoryTransferHistoryRecord) {
  return `de ${transfer.sourceLaboratoryName} para ${transfer.destinationLaboratoryName} em ${formatMovementDate(transfer.transferredAt)}`
}

function TransferRoute({ transfer }: { transfer: InventoryTransferHistoryRecord }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="min-w-0 break-words">{transfer.sourceLaboratoryName}</span>
      <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="sr-only">para</span>
      <span className="min-w-0 break-words">{transfer.destinationLaboratoryName}</span>
    </span>
  )
}

function TransferStatusBadge({ status }: { status: InventoryTransferHistoryRecord['status'] }) {
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

function TransferDetailsButton({
  transfer,
  onSelect,
}: {
  transfer: InventoryTransferHistoryRecord
  onSelect: (transfer: InventoryTransferHistoryRecord) => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Ver detalhes da transferência ${getTransferDescription(transfer)}`}
      title="Ver detalhes"
      className="size-10 rounded-lg sm:size-7"
      onClick={() => onSelect(transfer)}
    >
      <FileText aria-hidden="true" className="size-5 sm:size-4" />
    </Button>
  )
}

function TransferReverseButton({
  transfer,
  onSelect,
}: {
  transfer: InventoryTransferHistoryRecord
  onSelect: (transfer: InventoryTransferHistoryRecord) => void
}) {
  const isReversed = transfer.status === 'REVERSED'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={isReversed
        ? `Transferência ${getTransferDescription(transfer)} já estornada`
        : `Estornar transferência ${getTransferDescription(transfer)}`}
      title={isReversed ? 'Transferência já estornada' : 'Estornar transferência'}
      className="size-10 rounded-lg text-muted-foreground hover:text-destructive sm:size-7"
      disabled={isReversed}
      onClick={() => onSelect(transfer)}
    >
      <Undo2 aria-hidden="true" className="size-5 sm:size-4" />
    </Button>
  )
}

export function InventoryTransfersPage() {
  const researchGroup = useResearchGroup()
  const [searchParams, setSearchParams] = useSearchParams()
  const sourceLaboratoryId = searchParams.get('sourceLaboratoryId') ?? ''
  const destinationLaboratoryId = searchParams.get('destinationLaboratoryId') ?? ''
  const inventoryItemId = searchParams.get('inventoryItemId') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const [formOpen, setFormOpen] = useState(() => searchParams.get('openTransfer') === 'true')
  const [selectedTransfer, setSelectedTransfer] = useState<InventoryTransferHistoryRecord | null>(null)
  const [transferToReverse, setTransferToReverse] = useState<InventoryTransferHistoryRecord | null>(null)

  const laboratoriesQuery = useInventoryLaboratoriesQuery(researchGroup.id)
  const itemsQuery = useInventoryItemsQuery(researchGroup.id)
  const filters = useMemo(() => ({
    sourceLaboratoryId: sourceLaboratoryId || null,
    destinationLaboratoryId: destinationLaboratoryId || null,
    inventoryItemId: inventoryItemId || null,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
  }), [dateFrom, dateTo, destinationLaboratoryId, inventoryItemId, sourceLaboratoryId])
  const invalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo)
  const transfersQuery = useInventoryTransfersQuery(researchGroup.id, filters, !invalidDateRange)
  const transfers = transfersQuery.data ?? []
  const laboratories = laboratoriesQuery.data ?? []
  const catalogItems = itemsQuery.data ?? []
  const hasFilters = Boolean(sourceLaboratoryId || destinationLaboratoryId || inventoryItemId || dateFrom || dateTo)

  useEffect(() => {
    if (searchParams.get('openTransfer') !== 'true') return

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('openTransfer')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (laboratoriesQuery.isError) publishApiErrorToast(laboratoriesQuery.error)
  }, [laboratoriesQuery.error, laboratoriesQuery.isError])

  useEffect(() => {
    if (itemsQuery.isError) publishApiErrorToast(itemsQuery.error)
  }, [itemsQuery.error, itemsQuery.isError])

  useEffect(() => {
    if (transfersQuery.isError) publishApiErrorToast(transfersQuery.error)
  }, [transfersQuery.error, transfersQuery.isError])

  function setFilterParam(key: string, value: string) {
    const nextParams = new URLSearchParams(searchParams)
    if (value) nextParams.set(key, value)
    else nextParams.delete(key)
    setSearchParams(nextParams, { replace: true })
  }

  function clearFilters() {
    const nextParams = new URLSearchParams(searchParams)
    for (const key of ['sourceLaboratoryId', 'destinationLaboratoryId', 'inventoryItemId', 'dateFrom', 'dateTo']) {
      nextParams.delete(key)
    }
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <section aria-labelledby="inventory-transfers-title" className="w-full">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 id="inventory-transfers-title" className="text-2xl font-bold tracking-tight text-brand-navy">
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">Transferências</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Itens movidos entre os laboratórios do grupo.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => setFormOpen(true)}
          className="h-10 w-full shrink-0 px-4 font-semibold sm:w-auto"
        >
          <ArrowLeftRight aria-hidden="true" />
          Transferir
        </Button>
      </div>

      <section aria-label="Filtros das transferências" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1fr_1fr]">
        <div className="space-y-1.5">
          <label htmlFor="inventory-transfers-source" className="text-xs font-semibold text-brand-navy">Origem</label>
          <Select value={sourceLaboratoryId || '__all__'} onValueChange={(value) => setFilterParam('sourceLaboratoryId', value === '__all__' ? '' : value)}>
            <SelectTrigger id="inventory-transfers-source" className="h-10 w-full" disabled={laboratoriesQuery.isPending || laboratoriesQuery.isError}>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {laboratories.map((laboratory) => (
                <SelectItem key={laboratory.id} value={laboratory.id}>{laboratory.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-transfers-destination" className="text-xs font-semibold text-brand-navy">Destino</label>
          <Select value={destinationLaboratoryId || '__all__'} onValueChange={(value) => setFilterParam('destinationLaboratoryId', value === '__all__' ? '' : value)}>
            <SelectTrigger id="inventory-transfers-destination" className="h-10 w-full" disabled={laboratoriesQuery.isPending || laboratoriesQuery.isError}>
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
          <label htmlFor="inventory-transfers-item" className="text-xs font-semibold text-brand-navy">Item</label>
          <Select value={inventoryItemId || '__all__'} onValueChange={(value) => setFilterParam('inventoryItemId', value === '__all__' ? '' : value)}>
            <SelectTrigger id="inventory-transfers-item" className="h-10 w-full" disabled={itemsQuery.isPending || itemsQuery.isError}>
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
          <label htmlFor="inventory-transfers-date-from" className="text-xs font-semibold text-brand-navy">De</label>
          <Input id="inventory-transfers-date-from" type="date" value={dateFrom} onChange={(event) => setFilterParam('dateFrom', event.target.value)} className="h-10" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-transfers-date-to" className="text-xs font-semibold text-brand-navy">Até</label>
          <Input id="inventory-transfers-date-to" type="date" value={dateTo} onChange={(event) => setFilterParam('dateTo', event.target.value)} className="h-10" />
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
          A data inicial deve ser anterior à data final. Corrija o período para consultar as transferências.
        </p>
      ) : transfersQuery.isPending ? (
        <p role="status" className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Carregando transferências…
        </p>
      ) : transfersQuery.isError ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-8 text-center">
          <p role="alert" className="text-sm text-destructive">Não foi possível carregar o histórico de transferências.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void transfersQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : transfers.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-card px-4 py-10 text-center">
          <p className="text-sm font-semibold text-brand-navy">Nenhuma transferência encontrada.</p>
          <p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros ou registre uma nova transferência.</p>
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
                  <th scope="col" className="px-3 py-3 font-semibold">Origem → destino</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Itens</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Valor</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Situação</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-brand-navy">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className={transfer.status === 'REVERSED' ? 'text-muted-foreground' : ''}>
                    <td className="whitespace-nowrap px-3 py-3.5">{formatMovementDate(transfer.transferredAt)}</td>
                    <td className="max-w-80 px-3 py-3.5 font-semibold"><TransferRoute transfer={transfer} /></td>
                    <td className="max-w-64 truncate px-3 py-3.5" title={transfer.items.map((item) => item.itemName).join(', ')}>
                      {getTransferItemsLabel(transfer)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-right font-semibold">{formatCurrencyBRL(getTransferTotal(transfer))}</td>
                    <td className="whitespace-nowrap px-3 py-3.5"><TransferStatusBadge status={transfer.status} /></td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <TransferDetailsButton transfer={transfer} onSelect={setSelectedTransfer} />
                        <TransferReverseButton transfer={transfer} onSelect={setTransferToReverse} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul aria-label="Transferências registradas" className="mt-5 space-y-3 md:hidden">
            {transfers.map((transfer) => (
              <li key={transfer.id} className={`rounded-xl border border-slate-200 bg-card p-4 ${transfer.status === 'REVERSED' ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-sm font-semibold text-brand-navy">
                    <TransferRoute transfer={transfer} />
                    <p className="mt-1 text-xs font-normal text-muted-foreground">{formatMovementDate(transfer.transferredAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <TransferDetailsButton transfer={transfer} onSelect={setSelectedTransfer} />
                    <TransferReverseButton transfer={transfer} onSelect={setTransferToReverse} />
                  </div>
                </div>
                <div className="mt-3">
                  <TransferStatusBadge status={transfer.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Itens</dt>
                    <dd className="mt-1 font-medium text-brand-navy">{getTransferItemsLabel(transfer)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Valor</dt>
                    <dd className="mt-1 font-semibold text-brand-navy">{formatCurrencyBRL(getTransferTotal(transfer))}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}

      <InventoryTransferFormDialog
        researchGroupId={researchGroup.id}
        open={formOpen}
        preselectedItemId={searchParams.get('itemId')}
        preselectedSourceLaboratoryId={searchParams.get('sourceLaboratoryId')}
        onOpenChange={setFormOpen}
        onCreated={() => {
          setFormOpen(false)
          publishToast({
            kind: 'success',
            title: 'Transferência registrada',
            description: 'Os saldos dos dois laboratórios foram atualizados.',
          })
        }}
      />
      <InventoryTransferDetailsDialog
        transfer={selectedTransfer}
        onOpenChange={(open) => {
          if (!open) setSelectedTransfer(null)
        }}
      />
      <InventoryTransferReverseDialog
        researchGroupId={researchGroup.id}
        transfer={transferToReverse}
        onOpenChange={(open) => {
          if (!open) setTransferToReverse(null)
        }}
        onReversed={() => setTransferToReverse(null)}
      />
    </section>
  )
}
