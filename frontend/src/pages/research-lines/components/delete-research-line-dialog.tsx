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
import { publishApiErrorToast } from '@/lib/api-error-toasts'
import {
  researchLinesKeys,
  useDeleteResearchLineMutation,
} from '@/queries/research-lines/research-lines.queries'
import type { ResearchLine } from '@/types/research-lines/research-line.types'

function getDeleteErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível excluir a linha de pesquisa. Tente novamente.'
  }

  if (error.status === 409) {
    return 'Não é possível excluir esta linha de pesquisa porque existem projetos ou membros vinculados a ela.'
  }

  if (error.status === 404) {
    return 'Esta linha de pesquisa não foi encontrada ou já foi removida.'
  }

  if (error.status === 400) {
    return 'O servidor recusou a solicitação de exclusão.'
  }

  return 'Não foi possível excluir a linha de pesquisa. Tente novamente.'
}

function DeleteResearchLineDialogBody({
  line,
  onDeleted,
}: {
  line: ResearchLine
  onDeleted: () => void
}) {
  const queryClient = useQueryClient()
  const deleteLine = useDeleteResearchLineMutation()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function confirmDelete() {
    setDeleteError(null)
    deleteLine.mutate(line.id, {
      onSuccess: onDeleted,
      onError: (error) => {
        if (error instanceof ApiError && error.status === 404) {
          void queryClient.invalidateQueries({ queryKey: researchLinesKeys.all })
        }
        setDeleteError(getDeleteErrorMessage(error))
        publishApiErrorToast(error)
      },
    })
  }

  return (
    <>
      <div className="space-y-3 px-6 py-5">
        <p className="text-sm leading-relaxed text-brand-navy">
          Tem certeza de que deseja excluir a linha de pesquisa{' '}
          <strong className="font-semibold">“{line.name}”</strong>?
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Esta ação não pode ser desfeita. Caso existam projetos vinculados a esta linha, a exclusão
          será bloqueada para preservar o histórico do grupo.
        </p>
        {deleteError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {deleteError}
          </p>
        )}
      </div>

      <DialogFooter className="mx-0 mb-0 gap-3 px-6 py-4 sm:items-center">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={deleteLine.isPending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="button"
          variant="destructive"
          disabled={deleteLine.isPending}
          onClick={confirmDelete}
        >
          {deleteLine.isPending ? 'Excluindo…' : 'Excluir linha'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function DeleteResearchLineDialog({
  line,
  onOpenChange,
  onDeleted,
}: {
  line: ResearchLine | null
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}) {
  const isOpen = line !== null

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
            Excluir linha de pesquisa
          </DialogTitle>
          <DialogDescription>
            Confirme a remoção desta linha de pesquisa do grupo.
          </DialogDescription>
        </DialogHeader>
        {line && (
          <DeleteResearchLineDialogBody
            key={line.id}
            line={line}
            onDeleted={onDeleted}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

