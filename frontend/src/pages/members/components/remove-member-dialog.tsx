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
import { useUpdateMembershipMutation } from '@/queries/members/members.queries'
import type { GroupMemberListItem } from '@/types/members/member.types'

export function RemoveMemberDialog({
  researchGroupId,
  member,
  onOpenChange,
  onRemoved,
}: {
  researchGroupId: string
  member: GroupMemberListItem | null
  onOpenChange: (open: boolean) => void
  onRemoved: () => void
}) {
  const updateMembership = useUpdateMembershipMutation(researchGroupId)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function removeMember() {
    if (!member) return
    setErrorMessage(null)
    try {
      await updateMembership.mutateAsync({
        personId: member.person.id,
        body: { active: false },
      })
      onRemoved()
    } catch {
      setErrorMessage('Não foi possível remover o vínculo. Tente novamente.')
    }
  }

  return (
    <Dialog open={Boolean(member)} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="flex max-h-dvh flex-col gap-0 p-0 sm:max-h-[90svh] sm:max-w-lg">
        <DialogHeader className="relative border-b px-6 py-5 pr-14">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-4 right-4">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Remover membro do grupo</DialogTitle>
          <DialogDescription>O cadastro pessoal será mantido; somente o vínculo ativo com este grupo será encerrado.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 px-6 py-5">
          <p className="text-sm leading-relaxed text-foreground">
            Confirma a remoção de <strong>{member?.person.socialName || member?.person.name}</strong> deste grupo?
          </p>
          {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
        </div>
        <DialogFooter className="mx-0 mb-0 gap-3 px-6 py-4 sm:items-center">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={updateMembership.isPending}>Cancelar</Button>
          </DialogClose>
          <Button type="button" variant="destructive" disabled={updateMembership.isPending} onClick={() => void removeMember()}>
            {updateMembership.isPending ? 'Removendo…' : 'Remover do grupo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
