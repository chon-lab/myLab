import { Link } from 'react-router'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatIsoDate, pluralize } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useInventoryMovementsQuery } from '@/queries/inventory/inventory.queries'
import { DashboardPanel } from '@/pages/home/components/dashboard-panel'
import {
  describeMovement,
  movementLaboratories,
  movementTotalValue,
  sortByMostRecent,
} from '@/pages/home/components/movement-presenter'
import { PanelEmpty, PanelError, PanelLoading } from '@/pages/home/components/panel-feedback'
import { movementTypeLabels, type InventoryMovementType } from '@/types/inventory/inventory.types'

const RECENT_MOVEMENTS_LIMIT = 6

const movementBadgeStyles: Record<InventoryMovementType, string> = {
  ENTRY: 'bg-brand-yellow/30 text-brand-navy',
  EXIT: 'bg-primary/10 text-primary',
  TRANSFER: 'bg-muted text-muted-foreground',
}

export function RecentMovements() {
  const { id: researchGroupId } = useResearchGroup()
  const movements = useInventoryMovementsQuery(researchGroupId)
  const recent = sortByMostRecent(movements.data ?? []).slice(0, RECENT_MOVEMENTS_LIMIT)

  return (
    <DashboardPanel
      id="recent-movements-title"
      title="Movimentações recentes"
      action={
        <Link
          to={`/grupos/${researchGroupId}/estoque/entradas`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Ver histórico completo
        </Link>
      }
    >
      {movements.isPending ? (
        <PanelLoading rows={5} />
      ) : movements.isError ? (
        <PanelError message="Não foi possível carregar as movimentações." />
      ) : recent.length === 0 ? (
        <PanelEmpty message="Nenhuma movimentação registrada neste grupo." />
      ) : (
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-5">Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Laboratório</TableHead>
              <TableHead className="px-5 text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="px-5">{formatIsoDate(movement.occurredAt)}</TableCell>
                <TableCell>
                  <Badge className={cn(movementBadgeStyles[movement.movementType])}>
                    {movementTypeLabels[movement.movementType]}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-64 whitespace-normal">
                  <span className="font-semibold">{describeMovement(movement)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {pluralize(movement.items.length, 'item', 'itens')}
                    {movement.status === 'REVERSED' ? ' · Estornada' : ''}
                  </span>
                </TableCell>
                <TableCell>{movementLaboratories(movement)}</TableCell>
                <TableCell className="px-5 text-right font-semibold">
                  {formatCurrency(movementTotalValue(movement))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardPanel>
  )
}
