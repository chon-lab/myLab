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
import { useReverseInventoryExitMutation } from '@/queries/inventory/inventory.queries'
import {
  formatMovementDate,
  formatMovementReasonLabel,
} from '@/pages/inventory-stock/inventory-stock-format'
import {
  inventoryEntryReverseSchema,
  type InventoryEntryReverseFormValues,
} from '@/types/inventory/inventory-entry-reverse.schema'
import type { InventoryExitHistoryRecord } from '@/types/inventory/inventory.types'

export function InventoryExitReverseDialog({
  researchGroupId,
  exit,
  onOpenChange,
  onReversed,
}: {
  researchGroupId: string
  exit: InventoryExitHistoryRecord | null
  onOpenChange: (open: boolean) => void
  onReversed: () => void
}) {
  const reverseExit = useReverseInventoryExitMutation(researchGroupId)
  const form = useForm<InventoryEntryReverseFormValues>({
    resolver: zodResolver(inventoryEntryReverseSchema),
    defaultValues: { reason: '' },
  })
  const { reset } = form

  useEffect(() => {
    if (exit) reset({ reason: '' })
  }, [exit, reset])

  async function submit(values: InventoryEntryReverseFormValues) {
    if (!exit) return

    try {
      await reverseExit.mutateAsync({
        exitId: exit.id,
        body: { reason: values.reason.trim() },
      })
      publishToast({
        kind: 'success',
        title: 'Saída estornada',
        description: 'As quantidades voltaram ao saldo do laboratório.',
      })
      form.reset()
      onReversed()
    } catch (error) {
      publishApiErrorToast(error)
    }
  }

  return (
    <Dialog open={Boolean(exit)} onOpenChange={onOpenChange}>
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
              aria-label="Fechar estorno da saída"
              className="absolute top-3 right-3 size-10 sm:top-4 sm:right-4 sm:size-7"
              disabled={reverseExit.isPending}
              onClick={() => form.reset()}
            >
              <X aria-hidden="true" className="size-5 sm:size-4" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Estornar saída</DialogTitle>
          <DialogDescription>
            O estorno devolve ao saldo as quantidades desta saída e registra o motivo no histórico.
          </DialogDescription>
        </DialogHeader>

        {exit && (
          <form
            noValidate
            onSubmit={form.handleSubmit(submit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              <p className="break-words text-sm text-brand-navy">
                Saída por <strong>{formatMovementReasonLabel(exit.type).toLowerCase()}</strong> do laboratório{' '}
                <strong>{exit.laboratoryName}</strong>, em <strong>{formatMovementDate(exit.occurredAt)}</strong>.
              </p>
              <Field data-invalid={Boolean(form.formState.errors.reason)}>
                <FieldLabel htmlFor="inventory-exit-reversal-reason">
                  Motivo do estorno <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                  id="inventory-exit-reversal-reason"
                  rows={4}
                  maxLength={2000}
                  placeholder="Descreva por que esta saída está sendo estornada."
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
                  disabled={reverseExit.isPending}
                  onClick={() => form.reset()}
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={reverseExit.isPending}>
                <Undo2 aria-hidden="true" />
                {reverseExit.isPending ? 'Estornando…' : 'Confirmar estorno'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
