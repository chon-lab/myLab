import { Pencil } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InventoryItemStatusBadge } from '@/pages/inventory-items/components/inventory-item-status-badge'
import {
  formatCurrencyBRL,
  formatItemTypeLabel,
} from '@/pages/inventory-stock/inventory-stock-format'
import type { InventoryItem } from '@/types/inventory/inventory.types'

export function InventoryItemCard({
  item,
  onEdit,
}: {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
}) {
  const titleId = `inventory-item-title-${item.id}`

  return (
    <article
      aria-labelledby={titleId}
      className="rounded-xl border border-slate-200 bg-card p-4 shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={titleId} className="text-sm font-bold break-words text-brand-navy">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground hover:text-brand-navy"
          aria-label={`Editar ${item.name}`}
          onClick={() => onEdit(item)}
        >
          <Pencil aria-hidden="true" className="size-5 sm:size-4" />
        </Button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Tipo</dt>
          <dd className="mt-1">
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-brand-navy"
            >
              {formatItemTypeLabel(item.itemType)}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Unidade</dt>
          <dd className="mt-1 text-sm font-medium text-brand-navy">{item.unitOfMeasure}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Valor de referência</dt>
          <dd className="mt-1 text-sm font-bold text-brand-navy tabular-nums">
            {formatCurrencyBRL(item.referenceUnitValue)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Situação</dt>
          <dd className="mt-1">
            <InventoryItemStatusBadge active={item.active} />
          </dd>
        </div>
      </dl>
    </article>
  )
}
