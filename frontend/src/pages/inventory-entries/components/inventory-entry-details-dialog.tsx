import { useEffect } from 'react'
import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { publishApiErrorToast } from '@/lib/api-error-toasts'
import { InventoryEntryDocuments } from '@/pages/inventory-entries/components/inventory-entry-documents'
import { useInventoryEntryQuery } from '@/queries/inventory/inventory.queries'
import {
  formatCurrencyBRL,
  formatMovementDate,
  formatQuantity,
  formatUnitOfMeasure,
} from '@/pages/inventory-stock/inventory-stock-format'
import type { InventoryEntryHistoryRecord } from '@/types/inventory/inventory.types'

function getSourceLabel(entry: InventoryEntryHistoryRecord) {
  if (entry.source === 'DONATION') return 'Doação'
  return entry.purchaseType === 'FUNDING' ? 'Fomento' : 'Compra'
}

export function InventoryEntryDetailsDialog({
  entry,
  onOpenChange,
}: {
  entry: InventoryEntryHistoryRecord | null
  onOpenChange: (open: boolean) => void
}) {
  const detailQuery = useInventoryEntryQuery(entry?.id ?? null)
  const detail = detailQuery.data

  useEffect(() => {
    if (detailQuery.isError) publishApiErrorToast(detailQuery.error)
  }, [detailQuery.error, detailQuery.isError])

  return (
    <Dialog open={Boolean(entry)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-dvh flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-h-[90svh] sm:max-w-2xl sm:rounded-xl"
      >
        {entry && (
          <>
            <DialogHeader className="relative shrink-0 border-b px-5 py-5 pr-14 sm:px-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Fechar detalhes da entrada"
                  className="absolute top-3 right-3 size-10 sm:top-4 sm:right-4 sm:size-7"
                >
                  <X aria-hidden="true" className="size-5 sm:size-4" />
                </Button>
              </DialogClose>
              <DialogTitle className="text-lg font-bold text-brand-navy">Detalhes da entrada</DialogTitle>
              {detail ? (
                <DialogDescription>
                  Recebida em {formatMovementDate(detail.receivedAt)} no laboratório {detail.laboratoryName}.
                </DialogDescription>
              ) : (
                <DialogDescription>Carregando os dados atualizados da entrada.</DialogDescription>
              )}
            </DialogHeader>

            {detailQuery.isPending && !detail && (
              <p role="status" className="px-5 py-10 text-center text-sm text-muted-foreground sm:px-6">
                Carregando detalhes da entrada…
              </p>
            )}

            {detailQuery.isError && !detail && (
              <div className="space-y-4 px-5 py-8 text-center sm:px-6">
                <p role="alert" className="text-sm text-destructive">
                  Não foi possível carregar os detalhes desta entrada.
                </p>
                <Button type="button" variant="outline" onClick={() => void detailQuery.refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {detail && (
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-brand-navy">
                  {getSourceLabel(detail)}
                </Badge>
                <Badge
                  variant="outline"
                  className={detail.status === 'CONFIRMED'
                    ? 'rounded-full border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'rounded-full border-rose-200 bg-rose-50 text-rose-800'}
                >
                  {detail.status === 'CONFIRMED' ? 'Confirmada' : 'Estornada'}
                </Badge>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Fornecedor, doador ou agência</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-brand-navy">{detail.sourceName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Laboratório</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-brand-navy">{detail.laboratoryName}</dd>
                </div>
                {detail.reversalReason && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-muted-foreground">Motivo do estorno</dt>
                    <dd className="mt-1 break-words text-sm text-brand-navy">{detail.reversalReason}</dd>
                  </div>
                )}
                {detail.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-muted-foreground">Observações</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-brand-navy">{detail.notes}</dd>
                  </div>
                )}
              </dl>

              <section aria-labelledby="inventory-entry-detail-items-title">
                <h2 id="inventory-entry-detail-items-title" className="mb-3 text-sm font-bold text-brand-navy">
                  Itens recebidos ({detail.items.length})
                </h2>
                <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                  {detail.items.map((item) => (
                    <li key={item.id} className="space-y-2 p-3 sm:p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-brand-navy">{item.itemName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatQuantity(item.quantity)} {formatUnitOfMeasure(item.unitOfMeasure)} ×{' '}
                            {formatCurrencyBRL(item.historicalUnitValue)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-brand-navy">
                          {formatCurrencyBRL(item.quantity * item.historicalUnitValue)}
                        </p>
                      </div>
                      {(item.batchNumber || item.manufacturer || item.expirationDate) && (
                        <dl className="grid gap-2 text-xs sm:grid-cols-3">
                          {item.batchNumber && (
                            <div><dt className="text-muted-foreground">Lote</dt><dd className="break-words text-brand-navy">{item.batchNumber}</dd></div>
                          )}
                          {item.manufacturer && (
                            <div><dt className="text-muted-foreground">Fabricante</dt><dd className="break-words text-brand-navy">{item.manufacturer}</dd></div>
                          )}
                          {item.expirationDate && (
                            <div><dt className="text-muted-foreground">Validade</dt><dd className="text-brand-navy">{formatMovementDate(item.expirationDate)}</dd></div>
                          )}
                        </dl>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              <InventoryEntryDocuments entryId={detail.id} />
            </div>
            )}

            <DialogFooter className="mx-0 mb-0 border-t bg-background px-5 py-3 sm:px-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
