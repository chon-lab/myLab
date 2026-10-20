import { Eye } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

export function InventoryStockTable({
  researchGroupId,
  items,
  totalValue,
  catalogById,
  selectedLaboratoryId,
  selectedLaboratoryName,
  breakdownsByItemId,
  onInspect,
}: {
  researchGroupId: string
  items: InventoryStockItem[]
  totalValue: number
  catalogById: Record<string, InventoryItem>
  selectedLaboratoryId: string | null
  selectedLaboratoryName: string | null
  breakdownsByItemId?: Record<string, InventoryLaboratoryStockBreakdown[]>
  onInspect: (item: InventoryStockItem) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-xs">
      <Table aria-label="Saldo do estoque">
        <TableHeader className="bg-slate-50/70">
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="px-5 py-3 text-xs font-semibold text-muted-foreground">
              Item
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">
              Tipo
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
              Quantidade
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
              Valor total
            </TableHead>
            <TableHead className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => {
            const unitLabel = formatUnitOfMeasure(item.unitOfMeasure)
            const catalogItem = catalogById[item.inventoryItemId]
            const laboratoryBreakdown = breakdownsByItemId?.[item.inventoryItemId]
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
              <TableRow key={item.inventoryItemId} className="border-slate-100">
                <TableCell className="px-5 py-3.5">
                  <p className="text-sm font-bold text-brand-navy">{item.itemName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
                </TableCell>

                <TableCell className="px-4 py-3.5">
                  <Badge
                    variant="outline"
                    className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-brand-navy"
                  >
                    {formatItemTypeLabel(item.itemType)}
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-3.5 text-right text-sm">
                  <span className="font-bold text-brand-navy">{formatQuantity(item.quantity)}</span>{' '}
                  <span className="text-muted-foreground">{unitLabel}</span>
                </TableCell>

                <TableCell className="px-4 py-3.5 text-right text-sm font-bold text-brand-navy">
                  {formatCurrencyBRL(item.totalValue)}
                </TableCell>

                <TableCell className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center justify-end gap-4">
                    <Link
                      to={buildInventoryShortcutPath(researchGroupId, 'saidas', {
                        itemId: item.inventoryItemId,
                        laboratoryId: effectiveLaboratoryId,
                      })}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Registrar saída
                    </Link>
                    <Link
                      to={buildInventoryShortcutPath(researchGroupId, 'transferencias', {
                        itemId: item.inventoryItemId,
                        laboratoryId: effectiveLaboratoryId,
                      })}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Transferir
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-brand-navy"
                      aria-label={`Ver detalhes de ${item.itemName}`}
                      onClick={() => onInspect(item)}
                    >
                      <Eye aria-hidden="true" className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>

        <TableFooter className="border-t border-slate-200 bg-slate-50/70">
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={3} className="px-5 py-3.5 text-sm font-bold text-brand-navy">
              {items.length} {items.length === 1 ? 'item com saldo' : 'itens com saldo'}
            </TableCell>
            <TableCell className="px-4 py-3.5 text-right text-sm font-bold text-brand-navy">
              {formatCurrencyBRL(totalValue)}
            </TableCell>
            <TableCell className="px-5 py-3.5" />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

