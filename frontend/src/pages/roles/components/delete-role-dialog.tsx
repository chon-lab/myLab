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
import { ApiError } from '@/lib/api-client'
import { publishApiErrorToast } from '@/lib/api-error-toasts'
import { useDeleteRoleMutation } from '@/queries/roles/roles.queries'
import type { Role } from '@/types/roles/role.types'

function getDeleteErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível excluir o cargo. Tente novamente.'
  }
  if (error.status === 409) {
    return 'Não é possível excluir este cargo porque há membros vinculados a ele ou ele é protegido.'
  }
  if (error.status === 404) {
    return 'Este cargo não foi encontrado ou já foi removido.'
  }
  return 'Não foi possível excluir o cargo. Tente novamente.'
}

function DeleteRoleDialogBody({
  researchGroupId,
  role,
  onDeleted,
}: {
  researchGroupId: string
  role: Role
  onDeleted: () => void
}) {
  const deleteRole = useDeleteRoleMutation(researchGroupId)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function confirmDelete() {
    setDeleteError(null)
    deleteRole.mutate(role.id, {
      onSuccess: onDeleted,
      onError: (error) => {
        setDeleteError(getDeleteErrorMessage(error))
        publishApiErrorToast(error)
      },
    })
  }

  return (
    <>
      <div className="space-y-3 px-6 py-5">
        <p className="text-sm leading-relaxed text-brand-navy">
          Tem certeza de que deseja excluir o cargo{' '}
          <strong className="font-semibold">“{role.name}”</strong>?
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Esta ação não pode ser desfeita. Cargos vinculados a membros não podem ser excluídos.
        </p>
        {deleteError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {deleteError}
          </p>
        )}
      </div>

      <DialogFooter className="mx-0 mb-0 gap-3 px-6 py-4 sm:items-center">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={deleteRole.isPending}>Cancelar</Button>
        </DialogClose>
        <Button type="button" variant="destructive" disabled={deleteRole.isPending} onClick={confirmDelete}>
          {deleteRole.isPending ? 'Excluindo…' : 'Excluir cargo'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function DeleteRoleDialog({
  researchGroupId,
  role,
  onOpenChange,
  onDeleted,
}: {
  researchGroupId: string
  role: Role | null
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}) {
  return (
    <Dialog open={role !== null} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-dvh flex-col gap-0 p-0 sm:max-h-[90svh] sm:max-w-lg"
      >
        <DialogHeader className="relative border-b px-6 py-5 pr-14">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-4 right-4">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Excluir cargo</DialogTitle>
          <DialogDescription>Confirme a remoção deste cargo do grupo.</DialogDescription>
        </DialogHeader>
        {role && (
          <DeleteRoleDialogBody
            key={role.id}
            researchGroupId={researchGroupId}
            role={role}
            onDeleted={onDeleted}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
