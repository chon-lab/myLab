import { useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm, useWatch, type FieldPath } from 'react-hook-form'
import { ArrowRight, Plus, Trash2, X } from 'lucide-react'

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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError } from '@/lib/api-client'
import { publishApiErrorToast } from '@/lib/api-error-toasts'
import {
  formatCurrencyBRL,
  formatQuantity,
  formatUnitOfMeasure,
} from '@/pages/inventory-stock/inventory-stock-format'
import {
  useCreateInventoryTransferMutation,
  useInventoryLaboratoriesQuery,
  useInventoryStockQuery,
} from '@/queries/inventory/inventory.queries'
import type { InventoryStockItem } from '@/types/inventory/inventory.types'
import { parseInventoryDecimal } from '@/types/inventory/inventory-entry.schema'
import {
  inventoryTransferFormSchema,
  toCreateInventoryTransferRequest,
  type InventoryTransferFormValues,
} from '@/types/inventory/inventory-transfer.schema'

function getLocalDateInputValue() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function createEmptyLine(): InventoryTransferFormValues['items'][number] {
  return { inventoryItemId: '', unitOfMeasure: '', quantity: '' }
}

function createDefaultValues(): InventoryTransferFormValues {
  return {
    sourceLaboratoryId: '',
    destinationLaboratoryId: '',
    transferredAt: getLocalDateInputValue(),
    notes: '',
    items: [createEmptyLine()],
  }
}

function getInsufficientBalanceMessage(stockItem: InventoryStockItem | undefined) {
  if (!stockItem) return 'Este item não tem saldo no laboratório de origem.'
  return `Saldo insuficiente na origem. Disponível: ${formatQuantity(stockItem.quantity)} ${formatUnitOfMeasure(stockItem.unitOfMeasure)}.`
}

function getFormErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível registrar a transferência. Tente novamente.'
  }

  if (error.status === 404) {
    return 'O grupo, laboratório ou item selecionado não foi encontrado. Atualize os dados e tente novamente.'
  }
  if (error.status === 409) {
    return 'O saldo mudou enquanto a transferência era registrada. Revise as quantidades e tente novamente.'
  }
  if (error.status === 400 && /must be different/i.test(error.message)) {
    return 'O laboratório de destino deve ser diferente da origem.'
  }
  if (error.status === 400) {
    return Object.keys(error.fieldErrors).length > 0
      ? 'Revise os campos destacados e tente novamente.'
      : 'A API recusou os dados informados. Revise os laboratórios, os itens e as quantidades.'
  }

  return 'Não foi possível registrar a transferência. Tente novamente.'
}

function getInsufficientStockItemName(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 400) return null
  return /^Insufficient stock in source laboratory for item '(.+)'\./.exec(error.message)?.[1] ?? null
}

function toFormFieldPath(apiField: string) {
  return apiField
    .replace(/^request\./, '')
    .replace(/\[(\d+)\]/g, '.$1')
}

export function InventoryTransferFormDialog({
  researchGroupId,
  open,
  preselectedItemId,
  preselectedSourceLaboratoryId,
  onOpenChange,
  onCreated,
}: {
  researchGroupId: string
  open: boolean
  preselectedItemId: string | null
  preselectedSourceLaboratoryId: string | null
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const laboratoriesQuery = useInventoryLaboratoriesQuery(researchGroupId)
  const createTransfer = useCreateInventoryTransferMutation(researchGroupId)
  const [formError, setFormError] = useState<string | null>(null)
  const wasOpen = useRef(false)
  const laboratoryPreselectionApplied = useRef(false)
  const itemPreselectionApplied = useRef(false)
  const form = useForm<InventoryTransferFormValues>({
    resolver: zodResolver(inventoryTransferFormSchema),
    defaultValues: createDefaultValues(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })
  const { control, handleSubmit, setError, setFocus, setValue, clearErrors, reset, formState } = form
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'items' })
  const sourceLaboratoryId = useWatch({ control, name: 'sourceLaboratoryId' })
  const destinationLaboratoryId = useWatch({ control, name: 'destinationLaboratoryId' })
  const lineValues = useWatch({ control, name: 'items' }) ?? []
  const stockQuery = useInventoryStockQuery(researchGroupId, sourceLaboratoryId, Boolean(sourceLaboratoryId))

  const laboratories = useMemo(() => laboratoriesQuery.data ?? [], [laboratoriesQuery.data])
  const availableItems = useMemo(
    () => (stockQuery.data?.items ?? []).filter((stockItem) => stockItem.quantity > 0),
    [stockQuery.data],
  )
  const stockByItemId = useMemo(
    () => new Map(availableItems.map((stockItem) => [stockItem.inventoryItemId, stockItem])),
    [availableItems],
  )
  const sourceLaboratory = laboratories.find((laboratory) => laboratory.id === sourceLaboratoryId)
  const destinationLaboratory = laboratories.find((laboratory) => laboratory.id === destinationLaboratoryId)

  const lineBalanceErrors = lineValues.map((line) => {
    if (!line?.inventoryItemId) return null
    const quantity = parseInventoryDecimal(line.quantity ?? '')
    if (quantity === null || quantity <= 0) return null
    const stockItem = stockByItemId.get(line.inventoryItemId)
    return !stockItem || quantity > stockItem.quantity ? getInsufficientBalanceMessage(stockItem) : null
  })
  const estimatedValue = lineValues.reduce((sum, line) => {
    const stockItem = stockByItemId.get(line?.inventoryItemId ?? '')
    const quantity = parseInventoryDecimal(line?.quantity ?? '')
    if (!stockItem || quantity === null) return sum
    return sum + (stockItem.totalValue / stockItem.quantity) * quantity
  }, 0)
  const isSaving = formState.isSubmitting || createTransfer.isPending

  useEffect(() => {
    if (!open) {
      wasOpen.current = false
      laboratoryPreselectionApplied.current = false
      itemPreselectionApplied.current = false
      return
    }
    if (wasOpen.current) return

    wasOpen.current = true
    setFormError(null)
    reset(createDefaultValues())
  }, [open, reset])

  useEffect(() => {
    if (!open || laboratoryPreselectionApplied.current || !laboratoriesQuery.isSuccess) return

    const matchingLaboratory = laboratories.find(
      (laboratory) => laboratory.id === preselectedSourceLaboratoryId,
    )
    if (matchingLaboratory) {
      setValue('sourceLaboratoryId', matchingLaboratory.id, { shouldValidate: true })
    } else {
      itemPreselectionApplied.current = true
    }
    laboratoryPreselectionApplied.current = true
  }, [laboratories, laboratoriesQuery.isSuccess, open, preselectedSourceLaboratoryId, setValue])

  useEffect(() => {
    if (
      !open ||
      itemPreselectionApplied.current ||
      !laboratoryPreselectionApplied.current ||
      !stockQuery.isSuccess
    ) return

    const matchingItem = stockByItemId.get(preselectedItemId ?? '')
    if (matchingItem) {
      setValue('items.0.inventoryItemId', matchingItem.inventoryItemId, { shouldValidate: true })
      setValue('items.0.unitOfMeasure', matchingItem.unitOfMeasure)
    }
    itemPreselectionApplied.current = true
  }, [open, preselectedItemId, setValue, stockByItemId, stockQuery.isSuccess])

  async function submit(values: InventoryTransferFormValues) {
    setFormError(null)

    const exceededLines = lineBalanceErrors
      .map((message, index) => ({ message, index }))
      .filter((line): line is { message: string; index: number } => line.message !== null)

    if (exceededLines.length > 0) {
      exceededLines.forEach(({ message, index }) => {
        setError(`items.${index}.quantity`, { type: 'validate', message })
      })
      setFocus(`items.${exceededLines[0].index}.quantity`)
      setFormError('Há itens com quantidade acima do saldo da origem.')
      return
    }

    try {
      await createTransfer.mutateAsync(toCreateInventoryTransferRequest(values))
      onCreated()
      reset(createDefaultValues())
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.fieldErrors).forEach(([apiField, message]) => {
          setError(toFormFieldPath(apiField) as FieldPath<InventoryTransferFormValues>, {
            type: 'server',
            message,
          })
        })
      }

      const insufficientItemName = getInsufficientStockItemName(error)
      if (insufficientItemName) {
        const refreshedStock = await stockQuery.refetch()
        const lineIndex = values.items.findIndex(
          (line) => stockByItemId.get(line.inventoryItemId)?.itemName === insufficientItemName,
        )
        if (lineIndex >= 0) {
          const refreshedItem = refreshedStock.data?.items.find(
            (stockItem) => stockItem.inventoryItemId === values.items[lineIndex].inventoryItemId,
          )
          setError(`items.${lineIndex}.quantity`, {
            type: 'server',
            message: getInsufficientBalanceMessage(
              refreshedItem && refreshedItem.quantity > 0 ? refreshedItem : undefined,
            ),
          })
        }
        setFormError('O saldo da origem mudou. Revise as quantidades destacadas.')
        return
      }

      setFormError(getFormErrorMessage(error))
      if (!(error instanceof ApiError) || error.status >= 500) publishApiErrorToast(error)
    }
  }

  function handleSourceChange(value: string) {
    setValue('sourceLaboratoryId', value, { shouldDirty: true, shouldValidate: true })
    if (destinationLaboratoryId === value) {
      setValue('destinationLaboratoryId', '', { shouldDirty: true })
    }
    replace([createEmptyLine()])
    clearErrors(['items', 'destinationLaboratoryId'])
  }

  function handleItemChange(index: number, itemId: string) {
    const stockItem = stockByItemId.get(itemId)
    setValue(`items.${index}.inventoryItemId`, itemId, { shouldDirty: true, shouldValidate: true })
    setValue(`items.${index}.unitOfMeasure`, stockItem?.unitOfMeasure ?? '', {
      shouldDirty: true,
      shouldValidate: true,
    })
    clearErrors(`items.${index}.quantity`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-dvh flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-h-[90svh] sm:max-w-5xl sm:gap-0 sm:rounded-xl"
      >
        <DialogHeader className="relative shrink-0 border-b px-5 py-5 pr-14 sm:px-6">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Fechar transferência"
              className="absolute top-3 right-3 size-10 sm:top-4 sm:right-4 sm:size-7"
            >
              <X aria-hidden="true" className="size-5 sm:size-4" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Transferir entre laboratórios</DialogTitle>
          <DialogDescription>
            Mova itens com saldo de um laboratório para outro do mesmo grupo.
          </DialogDescription>
        </DialogHeader>

        {laboratoriesQuery.isPending ? (
          <p role="status" className="px-5 py-8 text-sm text-muted-foreground sm:px-6">
            Carregando laboratórios do grupo…
          </p>
        ) : laboratoriesQuery.isError ? (
          <section className="px-5 py-8 sm:px-6" aria-label="Erro ao carregar dados da transferência">
            <p role="alert" className="text-sm text-destructive">
              Não foi possível carregar os laboratórios deste grupo.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void laboratoriesQuery.refetch()}
            >
              Tentar novamente
            </Button>
          </section>
        ) : laboratories.length < 2 ? (
          <section className="px-5 py-8 sm:px-6" aria-label="Dados necessários indisponíveis">
            <p className="text-sm font-semibold text-brand-navy">
              É preciso ter ao menos dois laboratórios no grupo para transferir itens.
            </p>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="mt-4">Fechar</Button>
            </DialogClose>
          </section>
        ) : (
          <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
                <div className="min-w-0 space-y-6">
                  <section aria-labelledby="inventory-transfer-details-title">
                    <h2 id="inventory-transfer-details-title" className="mb-4 text-sm font-bold text-brand-navy">
                      Dados da transferência
                    </h2>
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                      <Controller name="sourceLaboratoryId" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="inventory-transfer-source">Laboratório de origem <span className="text-destructive">*</span></FieldLabel>
                          <Select value={field.value} onValueChange={handleSourceChange}>
                            <SelectTrigger id="inventory-transfer-source" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Selecione a origem" />
                            </SelectTrigger>
                            <SelectContent>
                              {laboratories.map((laboratory) => (
                                <SelectItem key={laboratory.id} value={laboratory.id} className="min-h-11 px-3 py-2.5">{laboratory.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />

                      <Controller name="destinationLaboratoryId" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="inventory-transfer-destination">Laboratório de destino <span className="text-destructive">*</span></FieldLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="inventory-transfer-destination" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Selecione o destino" />
                            </SelectTrigger>
                            <SelectContent>
                              {laboratories.map((laboratory) => (
                                <SelectItem key={laboratory.id} value={laboratory.id} disabled={laboratory.id === sourceLaboratoryId} className="min-h-11 px-3 py-2.5">{laboratory.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />

                      <Controller name="transferredAt" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="inventory-transfer-date">Data da transferência <span className="text-destructive">*</span></FieldLabel>
                          <Input {...field} id="inventory-transfer-date" type="date" aria-invalid={fieldState.invalid} />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />

                      <Controller name="notes" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                          <FieldLabel htmlFor="inventory-transfer-notes">Observações</FieldLabel>
                          <Textarea {...field} id="inventory-transfer-notes" rows={3} maxLength={4000} placeholder="Ex.: motivo da transferência ou responsável pelo transporte" aria-invalid={fieldState.invalid} />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />
                    </FieldGroup>
                  </section>

                  <section aria-labelledby="inventory-transfer-items-title" className="border-t pt-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 id="inventory-transfer-items-title" className="text-sm font-bold text-brand-navy">
                          Itens transferidos <span className="text-destructive">*</span>
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          A quantidade não pode ultrapassar o saldo do laboratório de origem.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!sourceLaboratoryId || fields.length >= Math.min(200, availableItems.length)}
                        onClick={() => append(createEmptyLine())}
                      >
                        <Plus aria-hidden="true" className="size-5 sm:size-4" />
                        Adicionar item
                      </Button>
                    </div>

                    {!sourceLaboratoryId ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-muted-foreground">
                        Selecione o laboratório de origem para ver os itens com saldo.
                      </p>
                    ) : stockQuery.isPending ? (
                      <p role="status" className="rounded-xl border border-slate-200 px-4 py-6 text-center text-sm text-muted-foreground">
                        Carregando saldo da origem…
                      </p>
                    ) : stockQuery.isError ? (
                      <div className="rounded-xl border border-slate-200 px-4 py-6 text-center">
                        <p role="alert" className="text-sm text-destructive">Não foi possível carregar o saldo da origem.</p>
                        <Button type="button" variant="outline" className="mt-4" onClick={() => void stockQuery.refetch()}>
                          Tentar novamente
                        </Button>
                      </div>
                    ) : availableItems.length === 0 ? (
                      <p className="rounded-xl border border-slate-200 px-4 py-6 text-center text-sm text-muted-foreground">
                        O laboratório de origem não tem itens com saldo.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {fields.map((field, index) => {
                          const stockItem = stockByItemId.get(lineValues[index]?.inventoryItemId ?? '')
                          const balanceError = lineBalanceErrors[index]
                          const alreadySelected = new Set(
                            lineValues
                              .map((line, lineIndex) => lineIndex !== index ? line?.inventoryItemId : '')
                              .filter(Boolean),
                          )

                          return (
                            <fieldset
                              key={field.id}
                              className={balanceError
                                ? 'min-w-0 rounded-xl border border-rose-200 bg-rose-50/40 p-4'
                                : 'min-w-0 rounded-xl border border-slate-200 bg-card p-4'}
                            >
                              <legend className="sr-only">Item {index + 1}</legend>
                              <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold text-brand-navy">Item {index + 1}</h3>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Remover item ${index + 1}`}
                                  className="size-10 sm:size-7"
                                  disabled={fields.length === 1}
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 aria-hidden="true" className="size-5 sm:size-4" />
                                </Button>
                              </div>

                              <FieldGroup className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
                                <Controller name={`items.${index}.inventoryItemId`} control={control} render={({ fieldState }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`inventory-transfer-item-${index}`}>Item <span className="text-destructive">*</span></FieldLabel>
                                    <Select value={lineValues[index]?.inventoryItemId ?? ''} onValueChange={(value) => handleItemChange(index, value)}>
                                      <SelectTrigger id={`inventory-transfer-item-${index}`} className="h-10 w-full" aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Selecione um item com saldo" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableItems.map((item) => (
                                          <SelectItem key={item.inventoryItemId} value={item.inventoryItemId} disabled={alreadySelected.has(item.inventoryItemId)} className="min-h-11 px-3 py-2.5">
                                            {item.itemName} · {formatQuantity(item.quantity)} {formatUnitOfMeasure(item.unitOfMeasure)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FieldError errors={[fieldState.error]} />
                                  </Field>
                                )} />

                                <Controller name={`items.${index}.quantity`} control={control} render={({ field: quantityField, fieldState }) => (
                                  <Field data-invalid={fieldState.invalid || Boolean(balanceError)}>
                                    <FieldLabel htmlFor={`inventory-transfer-quantity-${index}`}>Quantidade {stockItem && `(${formatUnitOfMeasure(stockItem.unitOfMeasure)})`} <span className="text-destructive">*</span></FieldLabel>
                                    <Input {...quantityField} id={`inventory-transfer-quantity-${index}`} type="text" inputMode="decimal" maxLength={20} placeholder="0" aria-invalid={fieldState.invalid || Boolean(balanceError)} />
                                    {stockItem && !fieldState.error && !balanceError && (
                                      <FieldDescription>
                                        Disponível na origem: {formatQuantity(stockItem.quantity)} {formatUnitOfMeasure(stockItem.unitOfMeasure)}
                                      </FieldDescription>
                                    )}
                                    <FieldError errors={[fieldState.error ?? (balanceError ? { message: balanceError } : undefined)]} />
                                  </Field>
                                )} />
                              </FieldGroup>
                            </fieldset>
                          )
                        })}
                      </div>
                    )}
                    {formState.errors.items?.root?.message && (
                      <p role="alert" className="mt-2 text-sm text-destructive">{formState.errors.items.root.message}</p>
                    )}
                  </section>
                </div>

                <aside aria-labelledby="inventory-transfer-summary-title" className="h-fit rounded-xl border border-amber-200 bg-amber-50 p-4 lg:sticky lg:top-0">
                  <h2 id="inventory-transfer-summary-title" className="text-sm font-bold text-brand-navy">Resumo da transferência</h2>
                  <p className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-brand-navy">
                    <span className="min-w-0 break-words">{sourceLaboratory?.name ?? 'Origem'}</span>
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    <span className="sr-only">para</span>
                    <span className="min-w-0 break-words">{destinationLaboratory?.name ?? 'Destino'}</span>
                  </p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-muted-foreground">Itens</dt>
                      <dd className="text-right font-medium text-brand-navy">
                        {fields.length} {fields.length === 1 ? 'item' : 'itens'}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3 border-t border-amber-200 pt-3">
                      <dt className="font-semibold text-brand-navy">Valor estimado</dt>
                      <dd className="text-right font-bold text-brand-navy">{formatCurrencyBRL(estimatedValue)}</dd>
                    </div>
                  </dl>
                  <FieldDescription className="mt-3">
                    Estimativa pelo custo médio atual da origem. O valor final é calculado pelo sistema, e o total do estoque do grupo não muda.
                  </FieldDescription>
                </aside>
              </div>
            </div>

            <DialogFooter className="mx-0 mb-0 flex-row flex-wrap items-center justify-between gap-3 border-t bg-background px-5 py-3 sm:flex-nowrap sm:px-6">
              {formError && <p role="alert" className="w-full min-w-0 text-sm text-destructive sm:mr-auto sm:w-auto">{formError}</p>}
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSaving}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving || !sourceLaboratoryId || availableItems.length === 0}>
                {isSaving ? 'Transferindo…' : 'Confirmar transferência'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
