import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import {
  laboratoriesKeys,
  useDeleteLaboratoryMutation,
} from '@/queries/laboratories/laboratories.queries'
import type { Laboratory } from '@/types/laboratories/laboratory.types'

function getDeleteErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível excluir o laboratório. Tente novamente.'
  }

  if (error.status === 404) {
    return 'Este laboratório não foi encontrado ou já foi removido.'
  }

  if (error.status === 400) {
    return 'O servidor recusou a solicitação de exclusão.'
  }

  if (error.status === 409) {
    return 'Este laboratório ainda possui itens em estoque. Transfira os itens ou registre uma saída antes de excluí-lo.'
  }

  return 'Não foi possível excluir o laboratório. Tente novamente.'
}

function DeleteLaboratoryDialogBody({
  laboratory,
  onDeleted,
}: {
  laboratory: Laboratory
  onDeleted: () => void
}) {
  const queryClient = useQueryClient()
  const deleteLaboratory = useDeleteLaboratoryMutation(laboratory.researchGroupId)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function confirmDelete() {
    setDeleteError(null)
    deleteLaboratory.mutate(laboratory.id, {
      onSuccess: onDeleted,
      onError: (error) => {
        if (error instanceof ApiError && error.status === 404) {
          void queryClient.invalidateQueries({ queryKey: laboratoriesKeys.all })
        }
        setDeleteError(getDeleteErrorMessage(error))
      },
    })
  }

  return (
    <>
      <div className="space-y-3 px-6 py-5">
        <p className="text-sm leading-relaxed text-brand-navy">
          Tem certeza de que deseja excluir o laboratório{' '}
          <strong className="font-semibold">“{laboratory.name}”</strong>?
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          O laboratório deixa de aparecer nas listas do grupo. O histórico de movimentações e
          projetos ligados a ele é preservado. Para excluir, o saldo do laboratório deve estar zerado.
        </p>
        {deleteError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {deleteError}
          </p>
        )}
      </div>

      <DialogFooter className="mx-0 mb-0 gap-3 px-6 py-4 sm:items-center">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={deleteLaboratory.isPending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="button"
          variant="destructive"
          disabled={deleteLaboratory.isPending}
          onClick={confirmDelete}
        >
          {deleteLaboratory.isPending ? 'Excluindo…' : 'Excluir laboratório'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function DeleteLaboratoryDialog({
  laboratory,
  onOpenChange,
  onDeleted,
}: {
  laboratory: Laboratory | null
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}) {
  const isOpen = laboratory !== null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <DialogTitle className="text-lg font-bold text-brand-navy">
            Excluir laboratório
          </DialogTitle>
          <DialogDescription>
            Confirme a remoção deste laboratório do grupo.
          </DialogDescription>
        </DialogHeader>
        {laboratory && (
          <DeleteLaboratoryDialogBody
            key={laboratory.id}
            laboratory={laboratory}
            onDeleted={onDeleted}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
