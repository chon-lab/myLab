import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  buildInventoryShortcutPath,
  formatCurrencyBRL,
  formatItemTypeLabel,
  formatMovementDate,
  formatMovementReasonLabel,
  formatMovementTypeLabel,
  formatQuantity,
  formatUnitOfMeasure,
  resolveItemEffectiveLaboratoryId,
} from '@/pages/inventory-stock/inventory-stock-format'
import { useInventoryMovementsQuery } from '@/queries/inventory/inventory.queries'
import type {
  InventoryItem,
  InventoryLaboratoryStockBreakdown,
  InventoryMovementHistoryRecord,
  InventoryStockItem,
} from '@/types/inventory/inventory.types'

function resolveMovementLaboratoryLabel(movement: InventoryMovementHistoryRecord) {
  if (movement.movementType === 'TRANSFER') {
    const source = movement.sourceLaboratoryName ?? 'Origem'
    const destination = movement.destinationLaboratoryName ?? 'Destino'
    return `${source} → ${destination}`
  }

  return (
    movement.destinationLaboratoryName ??
    movement.sourceLaboratoryName ??
    'Laboratório não informado'
  )
}

export function InventoryStockItemDetailsDialog({
  researchGroupId,
  stockItem,
  catalogItem,
  selectedLaboratoryId,
  selectedLaboratoryName,
  laboratoryBreakdown,
  onOpenChange,
}: {
  researchGroupId: string
  stockItem: InventoryStockItem | null
  catalogItem?: InventoryItem
  selectedLaboratoryId: string | null
  selectedLaboratoryName: string | null
  laboratoryBreakdown?: InventoryLaboratoryStockBreakdown[]
  onOpenChange: (open: boolean) => void
}) {
  const movementsQuery = useInventoryMovementsQuery(
    researchGroupId,
    {
      inventoryItemId: stockItem?.inventoryItemId ?? null,
      laboratoryId: selectedLaboratoryId,
    },
    Boolean(stockItem),
  )

  if (!stockItem) return null

  const unitLabel = formatUnitOfMeasure(stockItem.unitOfMeasure)
  const effectiveLaboratoryId = resolveItemEffectiveLaboratoryId(
    selectedLaboratoryId,
    laboratoryBreakdown,
  )

  return (
    <Dialog open={Boolean(stockItem)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-brand-navy"
            >
              {formatItemTypeLabel(stockItem.itemType)}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              Unidade: {unitLabel}
            </Badge>
            {catalogItem && (
              <Badge
                variant="outline"
                className={
                  catalogItem.active
                    ? 'rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800'
                    : 'rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800'
                }
              >
                {catalogItem.active ? 'Ativo no catálogo' : 'Arquivado no catálogo'}
              </Badge>
            )}
          </div>
          <DialogTitle className="mt-1 text-lg font-bold text-brand-navy">
            {stockItem.itemName}
          </DialogTitle>
          <DialogDescription>
            {selectedLaboratoryName
              ? `Saldo e histórico filtrados pelo laboratório ${selectedLaboratoryName}.`
              : 'Visão consolidada do item no grupo de pesquisa.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {catalogItem?.description && (
            <section aria-labelledby="item-details-description-heading">
              <h3
                id="item-details-description-heading"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Descrição do catálogo
              </h3>
              <p className="mt-1 text-sm text-brand-navy">{catalogItem.description}</p>
            </section>
          )}

          <dl className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Quantidade disponível</dt>
              <dd className="mt-1 text-base font-bold text-brand-navy">
                {formatQuantity(stockItem.quantity)}{' '}
                <span className="text-xs font-normal text-muted-foreground">{unitLabel}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Valor em estoque</dt>
              <dd className="mt-1 text-base font-bold text-brand-navy">
                {formatCurrencyBRL(stockItem.totalValue)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Valor unitário de referência
              </dt>
              <dd className="mt-1 text-base font-bold text-brand-navy">
                {catalogItem ? formatCurrencyBRL(catalogItem.referenceUnitValue) : '—'}
              </dd>
            </div>
          </dl>

          {laboratoryBreakdown && laboratoryBreakdown.length > 0 && (
            <section aria-labelledby="item-details-labs-heading">
              <h3
                id="item-details-labs-heading"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Distribuição por laboratório
              </h3>
              <ul className="mt-2 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-card">
                {laboratoryBreakdown.map((entry) => (
                  <li
                    key={entry.laboratoryId}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <span className="font-semibold text-brand-navy">{entry.laboratoryName}</span>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-brand-navy">
                        <strong className="font-bold">{formatQuantity(entry.quantity)}</strong>{' '}
                        <span className="text-muted-foreground">{unitLabel}</span>
                      </span>
                      <span className="font-semibold text-brand-navy">
                        {formatCurrencyBRL(entry.totalValue)}
                      </span>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <Link
                          to={buildInventoryShortcutPath(researchGroupId, 'saidas', {
                            itemId: stockItem.inventoryItemId,
                            laboratoryId: entry.laboratoryId,
                          })}
                          className="text-primary hover:underline"
                        >
                          Registrar saída
                        </Link>
                        <Link
                          to={buildInventoryShortcutPath(researchGroupId, 'transferencias', {
                            itemId: stockItem.inventoryItemId,
                            laboratoryId: entry.laboratoryId,
                          })}
                          className="text-primary hover:underline"
                        >
                          Transferir
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="item-details-movements-heading">
            <h3
              id="item-details-movements-heading"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Histórico de movimentações
            </h3>

            {movementsQuery.isPending ? (
              <p role="status" className="mt-2 text-sm text-muted-foreground">
                Carregando movimentações do item…
              </p>
            ) : movementsQuery.isError ? (
              <p className="mt-2 text-sm text-destructive">
                Não foi possível carregar o histórico de movimentações deste item.
              </p>
            ) : movementsQuery.data.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhuma movimentação registrada para este item no escopo selecionado.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-card">
                {movementsQuery.data.slice(0, 8).map((movement) => {
                  const line = movement.items.find(
                    (movementItem) => movementItem.inventoryItemId === stockItem.inventoryItemId,
                  )

                  return (
                    <li
                      key={movement.id}
                      className="flex flex-col gap-1.5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-brand-navy">
                            {formatMovementTypeLabel(movement.movementType)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({formatMovementReasonLabel(movement.reason)})
                          </span>
                          {movement.status === 'REVERSED' && (
                            <Badge
                              variant="outline"
                              className="rounded-full border-rose-200 bg-rose-50 px-2 py-0 text-[0.7rem] font-semibold text-rose-800"
                            >
                              Estornada
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatMovementDate(movement.occurredAt)} •{' '}
                          {resolveMovementLaboratoryLabel(movement)}
                        </p>
                      </div>

                      {line && (
                        <div className="shrink-0 text-left sm:text-right">
                          <p className="font-bold text-brand-navy">
                            {formatQuantity(line.quantity)}{' '}
                            <span className="font-normal text-muted-foreground">{unitLabel}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrencyBRL(line.totalValue)}
                          </p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link
                to={buildInventoryShortcutPath(researchGroupId, 'transferencias', {
                  itemId: stockItem.inventoryItemId,
                  laboratoryId: effectiveLaboratoryId,
                })}
              >
                <ArrowLeftRight aria-hidden="true" />
                Transferir
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                to={buildInventoryShortcutPath(researchGroupId, 'saidas', {
                  itemId: stockItem.inventoryItemId,
                  laboratoryId: effectiveLaboratoryId,
                })}
              >
                <ArrowUpFromLine aria-hidden="true" />
                Registrar saída
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link
                to={buildInventoryShortcutPath(researchGroupId, 'entradas', {
                  itemId: stockItem.inventoryItemId,
                  laboratoryId: effectiveLaboratoryId,
                })}
              >
                <ArrowDownToLine aria-hidden="true" />
                Registrar entrada
              </Link>
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

