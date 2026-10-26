import { useEffect } from 'react'
import { ArrowRight, X } from 'lucide-react'

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
import { useInventoryTransferQuery } from '@/queries/inventory/inventory.queries'
import {
  formatCurrencyBRL,
  formatMovementDate,
  formatQuantity,
  formatUnitOfMeasure,
} from '@/pages/inventory-stock/inventory-stock-format'
import type { InventoryTransferHistoryRecord } from '@/types/inventory/inventory.types'

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

export function InventoryTransferDetailsDialog({
  transfer,
  onOpenChange,
}: {
  transfer: InventoryTransferHistoryRecord | null
  onOpenChange: (open: boolean) => void
}) {
  const detailQuery = useInventoryTransferQuery(transfer?.id ?? null)
  const detail = detailQuery.data
  const totalCost = detail?.items.reduce((total, item) => total + item.totalCost, 0) ?? 0

  useEffect(() => {
    if (detailQuery.isError) publishApiErrorToast(detailQuery.error)
  }, [detailQuery.error, detailQuery.isError])

  return (
    <Dialog open={Boolean(transfer)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-dvh flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-h-[90svh] sm:max-w-2xl sm:rounded-xl"
      >
        {transfer && (
          <>
            <DialogHeader className="relative shrink-0 border-b px-5 py-5 pr-14 sm:px-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Fechar detalhes da transferência"
                  className="absolute top-3 right-3 size-10 sm:top-4 sm:right-4 sm:size-7"
                >
                  <X aria-hidden="true" className="size-5 sm:size-4" />
                </Button>
              </DialogClose>
              <DialogTitle className="text-lg font-bold text-brand-navy">Detalhes da transferência</DialogTitle>
              {detail ? (
                <DialogDescription>
                  Transferência em {formatMovementDate(detail.transferredAt)} de {detail.sourceLaboratoryName} para{' '}
                  {detail.destinationLaboratoryName}.
                </DialogDescription>
              ) : (
                <DialogDescription>Carregando os dados atualizados da transferência.</DialogDescription>
              )}
            </DialogHeader>

            {detailQuery.isPending && !detail && (
              <p role="status" className="px-5 py-10 text-center text-sm text-muted-foreground sm:px-6">
                Carregando detalhes da transferência…
              </p>
            )}

            {detailQuery.isError && !detail && (
              <div className="space-y-4 px-5 py-8 text-center sm:px-6">
                <p role="alert" className="text-sm text-destructive">
                  Não foi possível carregar os detalhes desta transferência.
                </p>
                <Button type="button" variant="outline" onClick={() => void detailQuery.refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {detail && (
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={detail.status === 'CONFIRMED'
                      ? 'rounded-full border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'rounded-full border-rose-200 bg-rose-50 text-rose-800'}
                  >
                    {detail.status === 'CONFIRMED' ? 'Confirmada' : 'Estornada'}
                  </Badge>
                </div>

                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-navy">
                  <span className="min-w-0 break-words">{detail.sourceLaboratoryName}</span>
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  <span className="sr-only">para</span>
                  <span className="min-w-0 break-words">{detail.destinationLaboratoryName}</span>
                </p>

                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Registrada em</dt>
                    <dd className="mt-1 text-sm font-semibold text-brand-navy">{formatDateTime(detail.createdAt)}</dd>
                  </div>
                  {detail.status === 'REVERSED' && detail.reversedAt && (
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Estornada em</dt>
                      <dd className="mt-1 text-sm font-semibold text-brand-navy">{formatDateTime(detail.reversedAt)}</dd>
                    </div>
                  )}
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

                <section aria-labelledby="inventory-transfer-detail-items-title">
                  <h2 id="inventory-transfer-detail-items-title" className="mb-3 text-sm font-bold text-brand-navy">
                    Itens transferidos ({detail.items.length})
                  </h2>
                  <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                    {detail.items.map((item) => (
                      <li key={item.id} className="flex flex-wrap items-start justify-between gap-2 p-3 sm:p-4">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-brand-navy">{item.itemName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatQuantity(item.quantity)} {formatUnitOfMeasure(item.unitOfMeasure)} ×{' '}
                            {formatCurrencyBRL(item.unitCost)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-brand-navy">{formatCurrencyBRL(item.totalCost)}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-brand-navy">Valor transferido</span>
                    <span className="font-bold text-brand-navy">{formatCurrencyBRL(totalCost)}</span>
                  </p>
                </section>
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
