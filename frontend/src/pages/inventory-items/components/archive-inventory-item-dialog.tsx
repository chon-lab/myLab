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
  inventoryKeys,
  useArchiveInventoryItemMutation,
} from '@/queries/inventory/inventory.queries'
import type { InventoryItem } from '@/types/inventory/inventory.types'

function getArchiveErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível arquivar o item. Tente novamente.'
  }

  if (error.status === 404) {
    return 'Este item não foi encontrado ou já foi arquivado.'
  }

  if (error.status === 400) {
    return 'O servidor recusou o arquivamento deste item.'
  }

  return 'Não foi possível arquivar o item. Tente novamente.'
}

function ArchiveInventoryItemDialogBody({
  item,
  onArchived,
}: {
  item: InventoryItem
  onArchived: () => void
}) {
  const queryClient = useQueryClient()
  const archiveItem = useArchiveInventoryItemMutation()
  const [archiveError, setArchiveError] = useState<string | null>(null)

  function confirmArchive() {
    setArchiveError(null)
    archiveItem.mutate(item.id, {
      onSuccess: onArchived,
      onError: (error) => {
        if (error instanceof ApiError && error.status === 404) {
          void queryClient.invalidateQueries({ queryKey: inventoryKeys.items() })
        }
        setArchiveError(getArchiveErrorMessage(error))
        publishApiErrorToast(error)
      },
    })
  }

  return (
    <>
      <div className="space-y-3 px-6 py-5">
        <p className="text-sm leading-relaxed text-brand-navy">
          Tem certeza de que deseja arquivar o item{' '}
          <strong className="font-semibold">“{item.name}”</strong>?
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          O item sai do catálogo e não aparece nas novas movimentações. O histórico de entradas,
          saídas e transferências é preservado.
        </p>
        {archiveError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {archiveError}
          </p>
        )}
      </div>

      <DialogFooter className="mx-0 mb-0 gap-3 px-6 py-4 sm:items-center">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={archiveItem.isPending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="button"
          variant="destructive"
          disabled={archiveItem.isPending}
          onClick={confirmArchive}
        >
          {archiveItem.isPending ? 'Arquivando…' : 'Arquivar item'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function ArchiveInventoryItemDialog({
  item,
  onOpenChange,
  onArchived,
}: {
  item: InventoryItem | null
  onOpenChange: (open: boolean) => void
  onArchived: () => void
}) {
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
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
          <DialogTitle className="text-lg font-bold text-brand-navy">Arquivar item</DialogTitle>
          <DialogDescription>Confirme a remoção deste item do catálogo do grupo.</DialogDescription>
        </DialogHeader>
        {item && (
          <ArchiveInventoryItemDialogBody key={item.id} item={item} onArchived={onArchived} />
        )}
      </DialogContent>
    </Dialog>
  )
}
