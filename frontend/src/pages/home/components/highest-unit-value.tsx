import { Lock } from 'lucide-react'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { formatCurrency, formatStockQuantity } from '@/lib/format'
import {
  useInventoryItemsQuery,
  useLaboratoryStocksQuery,
} from '@/queries/inventory/inventory.queries'
import { useLaboratoriesQuery } from '@/queries/laboratories/laboratories.queries'
import { DashboardPanel } from '@/pages/home/components/dashboard-panel'
import { PanelEmpty, PanelError, PanelLoading } from '@/pages/home/components/panel-feedback'
import { unitOfMeasureSymbols } from '@/types/inventory/inventory.types'

const HIGHEST_UNIT_VALUE_LIMIT = 3

export function HighestUnitValue() {
  const { id: researchGroupId } = useResearchGroup()
  const items = useInventoryItemsQuery(researchGroupId)
  const laboratories = useLaboratoriesQuery(researchGroupId)
  const stocks = useLaboratoryStocksQuery(researchGroupId, laboratories.data ?? [])

  const isPending = items.isPending || laboratories.isPending || stocks.isPending
  const isError = items.isError || laboratories.isError || stocks.isError

  const ranking = (items.data ?? [])
    .filter((item) => item.active)
    .map((item) => {
      const holdings = stocks.data.flatMap(({ laboratory, stock }) =>
        stock.items
          .filter((stockItem) => stockItem.inventoryItemId === item.id && stockItem.quantity > 0)
          .map((stockItem) => ({ laboratoryName: laboratory.name, quantity: stockItem.quantity })),
      )
      return { item, holdings }
    })
    .filter(({ holdings }) => holdings.length > 0)
    .sort((first, second) => second.item.referenceUnitValue - first.item.referenceUnitValue)
    .slice(0, HIGHEST_UNIT_VALUE_LIMIT)

  return (
    <DashboardPanel
      id="highest-unit-value-title"
      title="Maior valor unitário"
      action={<p className="text-xs text-muted-foreground">Guardar no armário trancado</p>}
    >
      {isPending ? (
        <PanelLoading rows={3} />
      ) : isError ? (
        <PanelError message="Não foi possível carregar os itens de maior valor." />
      ) : ranking.length === 0 ? (
        <PanelEmpty message="Nenhum item com saldo em estoque." />
      ) : (
        <ul className="divide-y px-5">
          {ranking.map(({ item, holdings }) => {
            const totalQuantity = holdings.reduce((total, holding) => total + holding.quantity, 0)
            const location =
              holdings.length === 1
                ? `${holdings[0].laboratoryName}, ${formatStockQuantity(totalQuantity, item.unitOfMeasure)}`
                : `${formatStockQuantity(totalQuantity, item.unitOfMeasure)} em ${holdings.length} laboratórios`

            return (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-yellow/30 text-brand-navy">
                  <Lock aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{location}</p>
                </div>
                <p className="shrink-0 text-sm font-bold">
                  {formatCurrency(item.referenceUnitValue)} / {unitOfMeasureSymbols[item.unitOfMeasure]}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardPanel>
  )
}
