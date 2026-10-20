import { useResearchGroup } from '@/components/layout/research-group-context'
import { formatCurrency } from '@/lib/format'
import { useLaboratoryStocksQuery } from '@/queries/inventory/inventory.queries'
import { useLaboratoriesQuery } from '@/queries/laboratories/laboratories.queries'
import { DashboardPanel } from '@/pages/home/components/dashboard-panel'
import { PanelEmpty, PanelError, PanelLoading } from '@/pages/home/components/panel-feedback'

export function ValueByLaboratory() {
  const { id: researchGroupId } = useResearchGroup()
  const laboratories = useLaboratoriesQuery(researchGroupId)
  const stocks = useLaboratoryStocksQuery(researchGroupId, laboratories.data ?? [])

  const isPending = laboratories.isPending || stocks.isPending
  const isError = laboratories.isError || stocks.isError

  const rows = stocks.data
    .map(({ laboratory, stock }) => ({
      id: laboratory.id,
      name: laboratory.name,
      value: stock.totalValue,
    }))
    .sort((first, second) => second.value - first.value)
  const highestValue = rows[0]?.value ?? 0

  return (
    <DashboardPanel id="value-by-laboratory-title" title="Valor por laboratório">
      {isPending ? (
        <PanelLoading rows={3} />
      ) : isError ? (
        <PanelError message="Não foi possível carregar o valor por laboratório." />
      ) : rows.length === 0 ? (
        <PanelEmpty message="Nenhum laboratório cadastrado neste grupo." />
      ) : (
        <ul className="space-y-4 p-5">
          {rows.map((row) => (
            <li key={row.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="text-foreground">{row.name}</span>
                <span className="font-bold">{formatCurrency(row.value)}</span>
              </div>
              <progress
                value={row.value}
                max={highestValue || 1}
                aria-label={`Valor em estoque de ${row.name}`}
                className="h-2 w-full appearance-none overflow-hidden rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
              />
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  )
}
