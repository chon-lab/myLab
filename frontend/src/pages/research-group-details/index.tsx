import { useState, type ReactNode } from 'react'
import { Pencil, RotateCcw } from 'lucide-react'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { publishToast } from '@/lib/api-error-toasts'
import { useResearchGroupQuery } from '@/queries/research-groups/research-groups.queries'
import { AddressCard } from '@/pages/research-group-details/components/address-card'
import { ContactsCard } from '@/pages/research-group-details/components/contacts-card'
import {
  EditResearchGroupDialog,
  type EditDialogIntent,
} from '@/pages/research-group-details/components/edit-research-group-dialog'
import { IdentificationCard } from '@/pages/research-group-details/components/identification-card'

function PageState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="group-details-title" className="max-w-xl">
      <h1 id="group-details-title" className="text-2xl font-bold tracking-tight text-brand-navy">
        {title}
      </h1>
      {children}
    </section>
  )
}

export function ResearchGroupDetailsPage() {
  const selectedGroup = useResearchGroup()
  const { data: group, isPending, isError, error, refetch } = useResearchGroupQuery(selectedGroup.id)
  const [dialog, setDialog] = useState<{ open: boolean; intent: EditDialogIntent }>({
    open: false,
    intent: { mode: 'edit' },
  })

  if (isPending) {
    return (
      <PageState title="Dados do grupo">
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Carregando os dados do grupo…
        </p>
      </PageState>
    )
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404

    return (
      <PageState title={notFound ? 'Grupo não encontrado' : 'Não foi possível carregar os dados do grupo'}>
        <p className="mt-2 text-sm text-muted-foreground">
          {notFound
            ? 'Este grupo de pesquisa pode ter sido removido. Selecione outro grupo no menu lateral.'
            : 'Confira sua conexão e tente novamente.'}
        </p>
        {!notFound && (
          <Button className="mt-6" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        )}
      </PageState>
    )
  }

  function openDialog(intent: EditDialogIntent) {
    setDialog({ open: true, intent })
  }

  function showCnpqUnavailable() {
    publishToast({
      kind: 'info',
      title: 'Atualização pelo CNPq indisponível',
      description:
        'A API do myLab ainda não permite importar dados do DGP. Use “Editar dados” para fazer alterações manualmente.',
    })
  }

  return (
    <section aria-labelledby="group-details-title">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 id="group-details-title" className="text-3xl font-bold tracking-tight text-brand-navy">
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">Dados do grupo</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="lg"
            className="h-10 bg-card px-4 font-semibold"
            onClick={showCnpqUnavailable}
          >
            <RotateCcw aria-hidden="true" />
            Atualizar pelo CNPq
          </Button>
          <Button size="lg" className="h-10 px-4 font-semibold" onClick={() => openDialog({ mode: 'edit' })}>
            <Pencil aria-hidden="true" />
            Editar dados
          </Button>
        </div>
      </header>

      <p className="mt-3 text-sm text-muted-foreground">
        Informações do grupo de pesquisa, usadas como base para laboratórios, projetos, membros e estoque.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 lg:row-span-2">
          <IdentificationCard group={group} />
        </div>
        <AddressCard address={group.address} />
        <ContactsCard
          contacts={group.contacts}
          onAddContact={() => openDialog({ mode: 'add-contact' })}
          onEditContact={(focusField) => openDialog({ mode: 'edit', focusField })}
        />
      </div>

      <EditResearchGroupDialog
        group={group}
        open={dialog.open}
        intent={dialog.intent}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        onSaved={() => {
          setDialog((current) => ({ ...current, open: false }))
          publishToast({
            kind: 'success',
            title: 'Dados do grupo atualizados',
            description: 'As alterações foram salvas com sucesso.',
          })
        }}
      />
    </section>
  )
}
