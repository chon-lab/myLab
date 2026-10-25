import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatItemStatusLabel } from '@/pages/inventory-items/inventory-item-format'

export function InventoryItemStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={cn(
        'h-6 gap-1.5 rounded-full px-2.5 text-xs font-semibold',
        active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-muted-foreground',
      )}
    >
      {active && <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-600" />}
      {formatItemStatusLabel(active)}
    </Badge>
  )
}
