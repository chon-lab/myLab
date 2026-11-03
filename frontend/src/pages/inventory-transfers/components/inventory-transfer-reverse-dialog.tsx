import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Undo2, X } from 'lucide-react'

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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api-client'
import { publishToast } from '@/lib/api-error-toasts'
import { useReverseInventoryTransferMutation } from '@/queries/inventory/inventory.queries'
import { formatMovementDate } from '@/pages/inventory-stock/inventory-stock-format'
import {
  inventoryEntryReverseSchema,
  type InventoryEntryReverseFormValues,
} from '@/types/inventory/inventory-entry-reverse.schema'
import type { InventoryTransferHistoryRecord } from '@/types/inventory/inventory.types'

function getReverseErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'Esta transferência não foi encontrada. Ela pode ter sido removida; atualize o histórico.'
    }
    if (error.status === 400 && /already reversed/i.test(error.message)) {
      return 'Esta transferência já foi estornada. O histórico foi atualizado.'
    }
    if (error.status === 400) {
      const itemName = /sufficient stock for item '(.+)'\./.exec(error.message)?.[1]
      if (itemName) {
        return `O laboratório de destino não tem mais saldo suficiente de ${itemName} para devolver à origem.`
      }
      return 'A API recusou o estorno. Revise o motivo e tente novamente.'
    }
  }

  return 'Não foi possível estornar a transferência. Tente novamente.'
}

export function InventoryTransferReverseDialog({
  researchGroupId,
  transfer,
  onOpenChange,
  onReversed,
}: {
  researchGroupId: string
  transfer: InventoryTransferHistoryRecord | null
  onOpenChange: (open: boolean) => void
  onReversed: () => void
}) {
  const reverseTransfer = useReverseInventoryTransferMutation(researchGroupId)
  const form = useForm<InventoryEntryReverseFormValues>({
    resolver: zodResolver(inventoryEntryReverseSchema),
    defaultValues: { reason: '' },
  })
  const { reset } = form
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (transfer) reset({ reason: '' })
  }, [transfer, reset])

  function handleOpenChange(open: boolean) {
    if (!open) setFormError(null)
    onOpenChange(open)
  }

  async function submit(values: InventoryEntryReverseFormValues) {
    if (!transfer) return
    setFormError(null)

    try {
      await reverseTransfer.mutateAsync({
        transferId: transfer.id,
        body: { reason: values.reason.trim() },
      })
      publishToast({
        kind: 'success',
        title: 'Transferência estornada',
        description: 'Os itens voltaram ao laboratório de origem.',
      })
      form.reset()
      onReversed()
    } catch (error) {
      setFormError(getReverseErrorMessage(error))
    }
  }

  return (
    <Dialog open={Boolean(transfer)} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-dvh flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-h-[90svh] sm:max-w-lg sm:rounded-xl"
      >
        <DialogHeader className="relative shrink-0 border-b px-5 py-5 pr-14 sm:px-6">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Fechar estorno da transferência"
              className="absolute top-3 right-3 size-10 sm:top-4 sm:right-4 sm:size-7"
              disabled={reverseTransfer.isPending}
              onClick={() => form.reset()}
            >
              <X aria-hidden="true" className="size-5 sm:size-4" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Estornar transferência</DialogTitle>
          <DialogDescription>
            O estorno devolve os itens ao laboratório de origem e registra o motivo no histórico.
          </DialogDescription>
        </DialogHeader>

        {transfer && (
          <form
            noValidate
            onSubmit={form.handleSubmit(submit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              <p className="break-words text-sm text-brand-navy">
                Transferência de <strong>{transfer.sourceLaboratoryName}</strong> para{' '}
                <strong>{transfer.destinationLaboratoryName}</strong>, em{' '}
                <strong>{formatMovementDate(transfer.transferredAt)}</strong>.
              </p>
              <Field data-invalid={Boolean(form.formState.errors.reason)}>
                <FieldLabel htmlFor="inventory-transfer-reversal-reason">
                  Motivo do estorno <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                  id="inventory-transfer-reversal-reason"
                  rows={4}
                  maxLength={2000}
                  placeholder="Descreva por que esta transferência está sendo estornada."
                  aria-invalid={Boolean(form.formState.errors.reason)}
                  {...form.register('reason')}
                />
                <FieldError errors={[form.formState.errors.reason]} />
              </Field>
            </div>

            <DialogFooter className="mx-0 mb-0 flex-row flex-wrap items-center justify-end gap-3 border-t px-5 py-4 sm:px-6">
              {formError && <p role="alert" className="w-full min-w-0 text-sm text-destructive">{formError}</p>}
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={reverseTransfer.isPending}
                  onClick={() => form.reset()}
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={reverseTransfer.isPending}>
                <Undo2 aria-hidden="true" />
                {reverseTransfer.isPending ? 'Estornando…' : 'Confirmar estorno'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
