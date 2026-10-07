import { Link2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { ResearchGroup } from '@/types/research-groups/research-group.types'

import { formatDate, toExternalUrl, withoutProtocol } from '@/pages/research-group-details/research-group-format'
import { DetailsCard, DetailsList } from '@/pages/research-group-details/components/details-card'

export function IdentificationCard({ group }: { group: ResearchGroup }) {
  const items = [
    { label: 'Nome do grupo', value: group.name },
    { label: 'Código no CNPq', value: group.cnpqId },
    {
      label: 'Situação',
      value: (
        <Badge className="h-auto gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold whitespace-normal text-emerald-800">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-600" />
          {group.situation}
        </Badge>
      ),
    },
    { label: 'Ano de formação', value: group.formationYear },
    { label: 'Área predominante', value: group.predominantArea },
    { label: 'Instituição', value: group.institutionName },
    { label: 'Unidade', value: group.institutionUnit },
    { label: 'Última atualização no DGP', value: formatDate(group.lastSubmittedAt) },
    {
      label: 'Espelho do grupo',
      value: group.sourceUrl && (
        <a
          href={toExternalUrl(group.sourceUrl)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          <Link2 aria-hidden="true" className="size-4 shrink-0" />
          <span className="break-all">{withoutProtocol(group.sourceUrl)}</span>
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      ),
    },
  ]

  return (
    <DetailsCard id="group-identification-title" title="Identificação">
      <DetailsList items={items} />
      <section
        aria-labelledby="group-repercussions-title"
        className="border-t border-slate-200 px-4 py-4 sm:px-5"
      >
        <h3 id="group-repercussions-title" className="text-xs font-semibold text-muted-foreground">
          Repercussões
        </h3>
        <p className="mt-1.5 text-sm leading-5 whitespace-pre-line text-brand-navy">
          {group.repercussions || (
            <span className="text-muted-foreground">Nenhuma repercussão cadastrada.</span>
          )}
        </p>
      </section>
    </DetailsCard>
  )
}
