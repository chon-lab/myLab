import { Pencil } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { InventoryItemStatusBadge } from '@/pages/inventory-items/components/inventory-item-status-badge'
import {
  formatCurrencyBRL,
  formatItemTypeLabel,
} from '@/pages/inventory-stock/inventory-stock-format'
import type { InventoryItem } from '@/types/inventory/inventory.types'

export function InventoryItemsTable({
  items,
  onEdit,
}: {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-xs">
      <Table aria-label="Catálogo de itens">
        <TableHeader className="bg-slate-50/70">
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="px-5 py-3 text-xs font-semibold text-muted-foreground">
              Item
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">
              Tipo
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">
              Unidade
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
              Valor de referência
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">
              Situação
            </TableHead>
            <TableHead className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className={cn('border-slate-100', !item.active && 'text-muted-foreground')}
            >
              <TableCell className="max-w-80 px-5 py-3.5 whitespace-normal">
                <p
                  className={cn(
                    'text-sm font-bold break-words',
                    item.active ? 'text-brand-navy' : 'text-muted-foreground',
                  )}
                >
                  {item.name}
                </p>
                {item.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </TableCell>

              <TableCell className="px-4 py-3.5">
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-brand-navy"
                >
                  {formatItemTypeLabel(item.itemType)}
                </Badge>
              </TableCell>

              <TableCell className="px-4 py-3.5 text-sm font-medium text-brand-navy">
                {item.unitOfMeasure}
              </TableCell>

              <TableCell className="px-4 py-3.5 text-right text-sm font-bold text-brand-navy tabular-nums">
                {formatCurrencyBRL(item.referenceUnitValue)}
              </TableCell>

              <TableCell className="px-4 py-3.5">
                <InventoryItemStatusBadge active={item.active} />
              </TableCell>

              <TableCell className="px-5 py-3.5 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-brand-navy"
                  aria-label={`Editar ${item.name}`}
                  onClick={() => onEdit(item)}
                >
                  <Pencil aria-hidden="true" className="size-5 sm:size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
