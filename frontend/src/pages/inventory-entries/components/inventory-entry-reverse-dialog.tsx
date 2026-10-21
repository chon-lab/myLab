import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
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
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import { useReverseInventoryEntryMutation } from '@/queries/inventory/inventory.queries'
import { formatMovementDate } from '@/pages/inventory-stock/inventory-stock-format'
import {
  inventoryEntryReverseSchema,
  type InventoryEntryReverseFormValues,
} from '@/types/inventory/inventory-entry-reverse.schema'
import type { InventoryEntryHistoryRecord } from '@/types/inventory/inventory.types'

export function InventoryEntryReverseDialog({
  researchGroupId,
  entry,
  onOpenChange,
  onReversed,
}: {
  researchGroupId: string
  entry: InventoryEntryHistoryRecord | null
  onOpenChange: (open: boolean) => void
  onReversed: () => void
}) {
  const reverseEntry = useReverseInventoryEntryMutation(researchGroupId)
  const form = useForm<InventoryEntryReverseFormValues>({
    resolver: zodResolver(inventoryEntryReverseSchema),
    defaultValues: { reason: '' },
  })
  const { reset } = form

  useEffect(() => {
    if (entry) reset({ reason: '' })
  }, [entry, reset])

  async function submit(values: InventoryEntryReverseFormValues) {
    if (!entry) return

    try {
      await reverseEntry.mutateAsync({
        entryId: entry.id,
        body: { reason: values.reason.trim() },
      })
      publishToast({
        kind: 'success',
        title: 'Entrada estornada',
        description: 'O saldo e o histórico foram atualizados.',
      })
      form.reset()
      onReversed()
    } catch (error) {
      publishApiErrorToast(error)
    }
  }

  return (
    <Dialog open={Boolean(entry)} onOpenChange={onOpenChange}>
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
              aria-label="Fechar estorno da entrada"
              className="absolute top-3 right-3 size-10 sm:top-4 sm:right-4 sm:size-7"
              disabled={reverseEntry.isPending}
              onClick={() => form.reset()}
            >
              <X aria-hidden="true" className="size-5 sm:size-4" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Estornar entrada</DialogTitle>
          <DialogDescription>
            O estorno remove do saldo as quantidades desta entrada e registra o motivo no histórico.
          </DialogDescription>
        </DialogHeader>

        {entry && (
          <form
            noValidate
            onSubmit={form.handleSubmit(submit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              <p className="break-words text-sm text-brand-navy">
                Entrada de <strong>{entry.sourceName}</strong>, recebida em{' '}
                <strong>{formatMovementDate(entry.receivedAt)}</strong>.
              </p>
              <Field data-invalid={Boolean(form.formState.errors.reason)}>
                <FieldLabel htmlFor="inventory-entry-reversal-reason">
                  Motivo do estorno <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                  id="inventory-entry-reversal-reason"
                  rows={4}
                  maxLength={2000}
                  placeholder="Descreva por que esta entrada está sendo estornada."
                  aria-invalid={Boolean(form.formState.errors.reason)}
                  {...form.register('reason')}
                />
                <FieldError errors={[form.formState.errors.reason]} />
              </Field>
            </div>

            <DialogFooter className="mx-0 mb-0 gap-3 border-t px-5 py-4 sm:px-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={reverseEntry.isPending}
                  onClick={() => form.reset()}
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={reverseEntry.isPending}>
                <Undo2 aria-hidden="true" />
                {reverseEntry.isPending ? 'Estornando…' : 'Confirmar estorno'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
