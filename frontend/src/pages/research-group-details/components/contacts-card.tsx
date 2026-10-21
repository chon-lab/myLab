import { useState } from "react"
import {
  Globe,
  Mail,
  Pencil,
  Phone,
  Plus,
  Printer,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { GroupContact } from "@/types/research-groups/research-group.types"

import {
  toExternalUrl,
  withoutProtocol,
} from "@/pages/research-group-details/research-group-format"
import { DetailsCard } from "@/pages/research-group-details/components/details-card"

type ContactField = keyof GroupContact

const contactFields: {
  field: ContactField
  label: string
  icon: LucideIcon
}[] = [
  { field: "phone", label: "Telefone", icon: Phone },
  { field: "email", label: "E-mail", icon: Mail },
  { field: "website", label: "Site", icon: Globe },
  { field: "fax", label: "Fax", icon: Printer },
]

function ContactValue({
  field,
  value,
}: {
  field: ContactField
  value: string
}) {
  if (field === "email") {
    return (
      <a
        href={`mailto:${value}`}
        className="hover:underline"
      >
        {value}
      </a>
    )
  }
  if (field === "website") {
    return (
      <a
        href={toExternalUrl(value)}
        target="_blank"
        rel="noreferrer"
        className="hover:underline"
      >
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
  const [showAllContacts, setShowAllContacts] = useState(false)

  return (
    <DetailsCard
      id="group-contacts-title"
      title="Contatos"
      action={
        <Button
          variant="ghost"
          onClick={onAddContact}
          className="font-semibold text-primary hover:text-primary"
        >
          <Plus aria-hidden="true" />
          Adicionar
        </Button>
      }
    >
      {contacts.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground sm:px-6">
          Nenhum contato cadastrado.
        </p>
      ) : (
        <>
          <ul className="grid gap-2.5 px-3 py-3 sm:px-4">
          {contacts.map((contact, index) => {
            const populatedFields = contactFields.filter(
              ({ field }) => contact[field],
            )
            const primaryField = populatedFields[0]
            const primaryValue = primaryField
              ? contact[primaryField.field] as string
              : "Nenhuma informação cadastrada"

            return (
              <li key={index} className="flex min-w-0 items-center gap-4 rounded-lg border border-slate-200 bg-card px-3 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  {primaryField ? <primaryField.icon aria-hidden="true" className="size-4" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-muted-foreground">Contato {index + 1}{primaryField ? ` · ${primaryField.label}` : ""}</span>
                  <span className="block truncate text-sm font-semibold text-brand-navy" title={primaryValue}>
                    {primaryField ? <ContactValue field={primaryField.field} value={primaryValue} /> : primaryValue}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {populatedFields.length} {populatedFields.length === 1 ? "campo" : "campos"}
                </span>
              </li>
            )
          })}
          </ul>
          <div className="border-t border-slate-200 px-4 py-2.5 sm:px-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllContacts(true)}
              className="px-0 font-semibold text-primary hover:text-primary"
            >
              Ver todos os contatos
            </Button>
          </div>
          <Dialog open={showAllContacts} onOpenChange={setShowAllContacts}>
            <DialogContent className="flex max-h-dvh flex-col gap-0 overflow-hidden p-4 sm:max-h-[80vh] sm:max-w-6xl">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-lg font-bold text-brand-navy">Contatos do grupo</DialogTitle>
                <DialogDescription>
                  {contacts.length} {contacts.length === 1 ? "contato cadastrado" : "contatos cadastrados"}.
                </DialogDescription>
              </DialogHeader>
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {contacts.map((contact, index) => {
                  const populatedFields = contactFields.filter(({ field }) => contact[field])

                  return (
                    <li key={index}>
                      <section aria-labelledby={`group-contact-modal-${index + 1}-title`} className="overflow-hidden rounded-lg border border-slate-200">
                        <header className="border-b border-slate-200 bg-muted/20 px-3 py-2">
                          <h3 id={`group-contact-modal-${index + 1}-title`} className="text-sm font-semibold text-brand-navy">
                            Contato {index + 1}
                          </h3>
                        </header>
                        {populatedFields.length === 0 ? (
                          <p className="px-3 py-3 text-sm text-muted-foreground">Nenhuma informação cadastrada.</p>
                        ) : (
                          <ul className="grid gap-x-4 px-3 sm:grid-cols-2">
                            {populatedFields.map(({ field, label, icon: Icon }) => {
                              const value = contact[field] as string

                              return (
                                <li key={field} className="flex min-w-0 items-center gap-2 border-b border-slate-200 py-2 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
                                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                                    <Icon aria-hidden="true" className="size-4" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-xs text-muted-foreground">{label}</span>
                                    <span className={`block text-sm font-semibold text-brand-navy ${field === "email" || field === "website" ? "break-all" : "break-words"}`}>
                                      <ContactValue field={field} value={value} />
                                    </span>
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Editar ${label.toLowerCase()} do contato ${index + 1}`}
                                    onClick={() => {
                                      setShowAllContacts(false)
                                      onEditContact(`contacts.${index}.${field}`)
                                    }}
                                    className="size-8 shrink-0 text-muted-foreground"
                                  >
                                    <Pencil aria-hidden="true" />
                                  </Button>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </section>
                    </li>
                  )
                })}
              </ul>
            </DialogContent>
          </Dialog>
        </>
      )}
    </DetailsCard>
  )
}
