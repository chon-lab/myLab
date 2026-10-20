import { Download, Upload } from 'lucide-react'
import { Link } from 'react-router'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { Button } from '@/components/ui/button'
import { HighestUnitValue } from '@/pages/home/components/highest-unit-value'
import { KpiStrip } from '@/pages/home/components/kpi-strip'
import { RecentMovements } from '@/pages/home/components/recent-movements'
import { ValueByLaboratory } from '@/pages/home/components/value-by-laboratory'

export function HomePage() {
  const group = useResearchGroup()
  const basePath = `/grupos/${group.id}`

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-navy">
            <mark className="inline-block rotate-[-0.7deg] bg-brand-yellow px-3 text-brand-navy">
              Painel do grupo
            </mark>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Resumo do estoque e das movimentações dos laboratórios do {group.name}.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to={`${basePath}/estoque/entradas`}>
              <Download aria-hidden="true" />
              Registrar entrada
            </Link>
          </Button>
          <Button asChild>
            <Link to={`${basePath}/estoque/saidas`}>
              <Upload aria-hidden="true" />
              Registrar saída
            </Link>
          </Button>
        </div>
      </header>

      <KpiStrip />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <RecentMovements />
        <div className="space-y-6">
          <ValueByLaboratory />
          <HighestUnitValue />
        </div>
      </div>
    </div>
  )
}
