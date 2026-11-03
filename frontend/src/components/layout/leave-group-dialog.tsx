import { useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import { useLeaveGroupMutation } from '@/queries/invitations/invitations.queries'
import type { ResearchGroup } from '@/types/research-groups/research-group.types'

export function LeaveGroupDialog({
  group,
  onOpenChange,
  onLeft,
}: {
  group: ResearchGroup | null
  onOpenChange: (open: boolean) => void
  onLeft: () => void
}) {
  const leaveGroup = useLeaveGroupMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function confirmLeave() {
    if (!group) return
    setErrorMessage(null)
    leaveGroup.mutate(group.id, {
      onSuccess: () => {
        publishToast({ kind: 'success', title: 'Você saiu do grupo', description: `Seu vínculo com ${group.name} foi encerrado.` })
        onLeft()
      },
      onError: (error) => {
        setErrorMessage('Não foi possível sair do grupo. Tente novamente.')
        publishApiErrorToast(error)
      },
    })
  }

  return (
    <Dialog open={group !== null} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="flex max-h-dvh flex-col gap-0 p-0 sm:max-h-[90svh] sm:max-w-lg">
        <DialogHeader className="relative border-b px-6 py-5 pr-14">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-4 right-4">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Sair do grupo</DialogTitle>
          <DialogDescription>Você deixará de ter acesso aos dados deste grupo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 px-6 py-5">
          <p className="text-sm leading-relaxed text-foreground">
            Tem certeza de que deseja sair do grupo <strong>{group?.name}</strong>? Um administrador precisará convidá-lo novamente para voltar.
          </p>
          {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
        </div>
        <DialogFooter className="mx-0 mb-0 gap-3 px-6 py-4 sm:items-center">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={leaveGroup.isPending}>Cancelar</Button>
          </DialogClose>
          <Button type="button" variant="destructive" disabled={leaveGroup.isPending} onClick={confirmLeave}>
            {leaveGroup.isPending ? 'Saindo…' : 'Sair do grupo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
