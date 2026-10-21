import { FileText } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  buildInventoryShortcutPath,
  formatCurrencyBRL,
  formatItemTypeLabel,
  formatQuantity,
  formatUnitOfMeasure,
  resolveItemEffectiveLaboratoryId,
  resolveItemSubtitle,
} from '@/pages/inventory-stock/inventory-stock-format'
import type {
  InventoryItem,
  InventoryLaboratoryStockBreakdown,
  InventoryStockItem,
} from '@/types/inventory/inventory.types'

export function InventoryStockCard({
  researchGroupId,
  item,
  catalogItem,
  selectedLaboratoryId,
  selectedLaboratoryName,
  laboratoryBreakdown,
  onInspect,
}: {
  researchGroupId: string
  item: InventoryStockItem
  catalogItem?: InventoryItem
  selectedLaboratoryId: string | null
  selectedLaboratoryName: string | null
  laboratoryBreakdown?: InventoryLaboratoryStockBreakdown[]
  onInspect: (item: InventoryStockItem) => void
}) {
  const unitLabel = formatUnitOfMeasure(item.unitOfMeasure)
  const effectiveLaboratoryId = resolveItemEffectiveLaboratoryId(
    selectedLaboratoryId,
    laboratoryBreakdown,
  )
  const subtitle = resolveItemSubtitle(
    selectedLaboratoryName,
    laboratoryBreakdown,
    catalogItem,
  )

  return (
    <article className="rounded-xl border border-slate-200 bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-brand-navy">{item.itemName}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-brand-navy"
        >
          {formatItemTypeLabel(item.itemType)}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50/80 p-3">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Quantidade</dt>
          <dd className="mt-0.5 text-sm font-bold text-brand-navy">
            {formatQuantity(item.quantity)}{' '}
            <span className="font-normal text-muted-foreground">{unitLabel}</span>
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-xs font-medium text-muted-foreground">Valor total</dt>
          <dd className="mt-0.5 text-sm font-bold text-brand-navy">
            {formatCurrencyBRL(item.totalValue)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <Link
            to={buildInventoryShortcutPath(researchGroupId, 'saidas', {
              itemId: item.inventoryItemId,
              laboratoryId: effectiveLaboratoryId,
            })}
            className="text-primary hover:underline"
          >
            Registrar saída
          </Link>
          <Link
            to={buildInventoryShortcutPath(researchGroupId, 'transferencias', {
              itemId: item.inventoryItemId,
              laboratoryId: effectiveLaboratoryId,
            })}
            className="text-primary hover:underline"
          >
            Transferir
          </Link>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-brand-navy"
          aria-label={`Ver detalhes de ${item.itemName}`}
          onClick={() => onInspect(item)}
        >
          <FileText aria-hidden="true" className="size-5 sm:size-4" />
        </Button>
      </div>
    </article>
  )
}

