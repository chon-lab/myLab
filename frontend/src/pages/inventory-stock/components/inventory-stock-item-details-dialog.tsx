import { useState, type ReactNode } from 'react'
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, ChevronDown } from 'lucide-react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

function DisclosureSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches,
  )

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group rounded-xl border border-slate-200 bg-card"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-brand-navy marker:content-none [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-slate-200 px-4 py-3">{children}</div>
    </details>
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
      <DialogContent className="flex max-h-dvh flex-col gap-0 overflow-hidden p-0 sm:max-h-[90svh] sm:max-w-2xl sm:gap-4 sm:p-4">
        <DialogHeader className="shrink-0 border-b px-4 pt-12 pb-3 sm:border-0 sm:p-0">
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

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-0 sm:py-0">
          {catalogItem?.description && (
            <DisclosureSection title="Descrição do catálogo">
              <p className="text-sm leading-relaxed text-brand-navy">{catalogItem.description}</p>
            </DisclosureSection>
          )}

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-3 sm:gap-3 sm:p-4">
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
            <div className="col-span-2 border-t border-slate-200 pt-2 sm:col-span-1 sm:border-t-0 sm:pt-0">
              <dt className="text-xs font-medium text-muted-foreground">
                Valor unitário de referência
              </dt>
              <dd className="mt-1 text-base font-bold text-brand-navy">
                {catalogItem ? formatCurrencyBRL(catalogItem.referenceUnitValue) : '—'}
              </dd>
            </div>
          </dl>

          {laboratoryBreakdown && laboratoryBreakdown.length > 0 && (
            <DisclosureSection title={`Distribuição por laboratório (${laboratoryBreakdown.length})`}>
              <ul className="-mx-4 -my-3 divide-y divide-slate-200">
                {laboratoryBreakdown.map((entry) => (
                  <li
                    key={entry.laboratoryId}
                    className="flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                  >
                    <span className="font-semibold text-brand-navy">{entry.laboratoryName}</span>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="text-brand-navy">
                        <strong className="font-bold">{formatQuantity(entry.quantity)}</strong>{' '}
                        <span className="text-muted-foreground">{unitLabel}</span>
                      </span>
                      <span className="font-semibold text-brand-navy">
                        {formatCurrencyBRL(entry.totalValue)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </DisclosureSection>
          )}

          <DisclosureSection title={`Histórico de movimentações${movementsQuery.data ? ` (${movementsQuery.data.length})` : ''}`}>

            {movementsQuery.isPending ? (
              <p role="status" className="text-sm text-muted-foreground">
                Carregando movimentações do item…
              </p>
            ) : movementsQuery.isError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar o histórico de movimentações deste item.
              </p>
            ) : movementsQuery.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma movimentação registrada para este item no escopo selecionado.
              </p>
            ) : (
              <ul className="-mx-4 -my-3 divide-y divide-slate-200">
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
          </DisclosureSection>
        </div>

        <DialogFooter className="mx-0 mb-0 flex-row items-center justify-between gap-2 border-t bg-background px-4 py-3 sm:border-0 sm:bg-transparent sm:p-0">
          <div className="flex items-center gap-2 sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" size="lg" className="h-10 px-4">
                  <ArrowLeftRight aria-hidden="true" />
                  Movimentar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-60">
                <DropdownMenuItem asChild className="min-h-11 gap-3 px-3 py-2.5 text-[0.95rem]">
                  <Link to={buildInventoryShortcutPath(researchGroupId, 'entradas', {
                    itemId: stockItem.inventoryItemId,
                    laboratoryId: effectiveLaboratoryId,
                  })}>
                    <ArrowDownToLine aria-hidden="true" />
                    Registrar entrada
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="min-h-11 gap-3 px-3 py-2.5 text-[0.95rem]">
                  <Link to={buildInventoryShortcutPath(researchGroupId, 'saidas', {
                    itemId: stockItem.inventoryItemId,
                    laboratoryId: effectiveLaboratoryId,
                  })}>
                    <ArrowUpFromLine aria-hidden="true" />
                    Registrar saída
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="min-h-11 gap-3 px-3 py-2.5 text-[0.95rem]">
                  <Link to={buildInventoryShortcutPath(researchGroupId, 'transferencias', {
                    itemId: stockItem.inventoryItemId,
                    laboratoryId: effectiveLaboratoryId,
                  })}>
                    <ArrowLeftRight aria-hidden="true" />
                    Transferir
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="lg" className="h-10 px-4" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
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
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

