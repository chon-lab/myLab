import { Globe, Mail, Pencil, Phone, Plus, Printer, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { GroupContact } from '@/types/research-groups/research-group.types'

import { toExternalUrl, withoutProtocol } from '@/pages/research-group-details/research-group-format'
import { DetailsCard } from '@/pages/research-group-details/components/details-card'

type ContactField = keyof GroupContact

const contactFields: { field: ContactField; label: string; icon: LucideIcon }[] = [
  { field: 'phone', label: 'Telefone', icon: Phone },
  { field: 'email', label: 'E-mail', icon: Mail },
  { field: 'website', label: 'Site', icon: Globe },
  { field: 'fax', label: 'Fax', icon: Printer },
]

function ContactValue({ field, value }: { field: ContactField; value: string }) {
  if (field === 'email') {
    return <a href={`mailto:${value}`} className="hover:underline">{value}</a>
  }
  if (field === 'website') {
    return (
      <a href={toExternalUrl(value)} target="_blank" rel="noreferrer" className="hover:underline">
        {withoutProtocol(value)}
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    )
  }
  return value
}

export function ContactsCard({
  contacts,
  onAddContact,
  onEditContact,
}: {
  contacts: GroupContact[]
  onAddContact: () => void
  onEditContact: (fieldPath: `contacts.${number}.${ContactField}`) => void
}) {
  const entries = contacts.flatMap((contact, index) =>
    contactFields
      .filter(({ field }) => contact[field])
      .map((item) => ({ ...item, index, value: contact[item.field] as string })),
  )

  return (
    <DetailsCard
      id="group-contacts-title"
      title="Contatos"
      action={
        <Button variant="ghost" onClick={onAddContact} className="font-semibold text-primary hover:text-primary">
          <Plus aria-hidden="true" />
          Adicionar
        </Button>
      }
    >
      {entries.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground sm:px-6">Nenhum contato cadastrado.</p>
      ) : (
        <ul className="divide-y divide-slate-200 px-5 py-2 sm:px-6">
          {entries.map(({ field, label, icon: Icon, index, value }) => (
            <li key={`${index}-${field}`} className="flex items-center gap-3 py-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">{label}</span>
                <span className="block truncate text-sm font-semibold text-brand-navy">
                  <ContactValue field={field} value={value} />
                </span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Editar ${label.toLowerCase()} ${value}`}
                onClick={() => onEditContact(`contacts.${index}.${field}`)}
                className="text-muted-foreground"
              >
                <Pencil aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </DetailsCard>
  )
}
