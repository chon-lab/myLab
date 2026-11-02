import { useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm, useWatch, type FieldPath } from 'react-hook-form'
import { Plus, Trash2, X } from 'lucide-react'

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
  formatMovementReasonLabel,
  formatQuantity,
  formatUnitOfMeasure,
} from '@/pages/inventory-stock/inventory-stock-format'
import {
  useCreateInventoryExitMutation,
  useInventoryLaboratoriesQuery,
  useInventoryStockQuery,
} from '@/queries/inventory/inventory.queries'
import type { InventoryExitType, InventoryStockItem } from '@/types/inventory/inventory.types'
import { parseInventoryDecimal } from '@/types/inventory/inventory-entry.schema'
import {
  inventoryExitFormSchema,
  toCreateInventoryExitRequest,
  type InventoryExitFormValues,
} from '@/types/inventory/inventory-exit.schema'

const exitTypes: InventoryExitType[] = ['CONSUMPTION', 'DISPOSAL', 'LOSS']

function getLocalDateInputValue() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function createEmptyLine(): InventoryExitFormValues['items'][number] {
  return { inventoryItemId: '', unitOfMeasure: '', quantity: '' }
}

function createDefaultValues(): InventoryExitFormValues {
  return {
    type: 'CONSUMPTION',
    laboratoryId: '',
    occurredAt: getLocalDateInputValue(),
    notes: '',
    items: [createEmptyLine()],
  }
}

function getInsufficientBalanceMessage(stockItem: InventoryStockItem | undefined) {
  if (!stockItem) return 'Este item não tem saldo no laboratório selecionado.'
  return `Saldo insuficiente. Disponível: ${formatQuantity(stockItem.quantity)} ${formatUnitOfMeasure(stockItem.unitOfMeasure)}.`
}

function getFormErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível registrar a saída. Tente novamente.'
  }

  if (error.status === 404) {
    return 'O grupo, laboratório ou item selecionado não foi encontrado. Atualize os dados e tente novamente.'
  }
  if (error.status === 409) {
    return 'O saldo mudou enquanto a saída era registrada. Revise as quantidades e tente novamente.'
  }
  if (error.status === 400) {
    return Object.keys(error.fieldErrors).length > 0
      ? 'Revise os campos destacados e tente novamente.'
      : 'A API recusou os dados informados. Revise o laboratório, os itens e as quantidades.'
  }

  return 'Não foi possível registrar a saída. Tente novamente.'
}

function getInsufficientStockItemName(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 400) return null
  return /^Insufficient stock for item '(.+)'\./.exec(error.message)?.[1] ?? null
}

function toFormFieldPath(apiField: string) {
  return apiField
    .replace(/^request\./, '')
    .replace(/\[(\d+)\]/g, '.$1')
}

export function InventoryExitFormDialog({
  researchGroupId,
  open,
  preselectedItemId,
  preselectedLaboratoryId,
  onOpenChange,
  onCreated,
}: {
  researchGroupId: string
  open: boolean
  preselectedItemId: string | null
  preselectedLaboratoryId: string | null
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const laboratoriesQuery = useInventoryLaboratoriesQuery(researchGroupId)
  const createExit = useCreateInventoryExitMutation(researchGroupId)
  const [formError, setFormError] = useState<string | null>(null)
  const wasOpen = useRef(false)
  const laboratoryPreselectionApplied = useRef(false)
  const itemPreselectionApplied = useRef(false)
  const form = useForm<InventoryExitFormValues>({
    resolver: zodResolver(inventoryExitFormSchema),
    defaultValues: createDefaultValues(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })
  const { control, handleSubmit, setError, setFocus, setValue, clearErrors, reset, formState } = form
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'items' })
  const type = useWatch({ control, name: 'type' })
  const laboratoryId = useWatch({ control, name: 'laboratoryId' })
  const lineValues = useWatch({ control, name: 'items' }) ?? []
  const stockQuery = useInventoryStockQuery(researchGroupId, laboratoryId, Boolean(laboratoryId))

  const laboratories = useMemo(() => laboratoriesQuery.data ?? [], [laboratoriesQuery.data])
  const availableItems = useMemo(
    () => (stockQuery.data?.items ?? []).filter((stockItem) => stockItem.quantity > 0),
    [stockQuery.data],
  )
  const stockByItemId = useMemo(
    () => new Map(availableItems.map((stockItem) => [stockItem.inventoryItemId, stockItem])),
    [availableItems],
  )
  const selectedLaboratory = laboratories.find((laboratory) => laboratory.id === laboratoryId)

  const lineBalanceErrors = lineValues.map((line) => {
    if (!line?.inventoryItemId) return null
    const quantity = parseInventoryDecimal(line.quantity ?? '')
    if (quantity === null || quantity <= 0) return null
    const stockItem = stockByItemId.get(line.inventoryItemId)
    return !stockItem || quantity > stockItem.quantity ? getInsufficientBalanceMessage(stockItem) : null
  })
  const estimatedCost = lineValues.reduce((sum, line) => {
    const stockItem = stockByItemId.get(line?.inventoryItemId ?? '')
    const quantity = parseInventoryDecimal(line?.quantity ?? '')
    if (!stockItem || quantity === null) return sum
    return sum + (stockItem.totalValue / stockItem.quantity) * quantity
  }, 0)
  const isSaving = formState.isSubmitting || createExit.isPending
  const isLoadingOptions = laboratoriesQuery.isPending
  const optionsError = laboratoriesQuery.isError

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
      (laboratory) => laboratory.id === preselectedLaboratoryId,
    )
    if (matchingLaboratory) {
      setValue('laboratoryId', matchingLaboratory.id, { shouldValidate: true })
    } else {
      itemPreselectionApplied.current = true
    }
    laboratoryPreselectionApplied.current = true
  }, [laboratories, laboratoriesQuery.isSuccess, open, preselectedLaboratoryId, setValue])

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

  async function submit(values: InventoryExitFormValues) {
    setFormError(null)

    const exceededLines = lineBalanceErrors
      .map((message, index) => ({ message, index }))
      .filter((line): line is { message: string; index: number } => line.message !== null)

    if (exceededLines.length > 0) {
      exceededLines.forEach(({ message, index }) => {
        setError(`items.${index}.quantity`, { type: 'validate', message })
      })
      setFocus(`items.${exceededLines[0].index}.quantity`)
      setFormError('Há itens com quantidade acima do saldo disponível.')
      return
    }

    try {
      await createExit.mutateAsync(toCreateInventoryExitRequest(values))
      onCreated()
      reset(createDefaultValues())
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.fieldErrors).forEach(([apiField, message]) => {
          setError(toFormFieldPath(apiField) as FieldPath<InventoryExitFormValues>, {
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
        setFormError('O saldo do laboratório mudou. Revise as quantidades destacadas.')
        return
      }

      setFormError(getFormErrorMessage(error))
      publishApiErrorToast(error)
    }
  }

  function handleLaboratoryChange(value: string) {
    setValue('laboratoryId', value, { shouldDirty: true, shouldValidate: true })
    replace([createEmptyLine()])
    clearErrors('items')
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
              aria-label="Fechar registro de saída"
              className="absolute top-3 right-3 size-10 sm:top-4 sm:right-4 sm:size-7"
            >
              <X aria-hidden="true" className="size-5 sm:size-4" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Registrar saída</DialogTitle>
          <DialogDescription>
            Informe o motivo, o laboratório de origem e os itens que deixaram o estoque.
          </DialogDescription>
        </DialogHeader>

        {isLoadingOptions ? (
          <p role="status" className="px-5 py-8 text-sm text-muted-foreground sm:px-6">
            Carregando laboratórios do grupo…
          </p>
        ) : optionsError ? (
          <section className="px-5 py-8 sm:px-6" aria-label="Erro ao carregar dados da saída">
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
        ) : laboratories.length === 0 ? (
          <section className="px-5 py-8 sm:px-6" aria-label="Dados necessários indisponíveis">
            <p className="text-sm font-semibold text-brand-navy">
              Cadastre um laboratório neste grupo antes de registrar a saída.
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
                  <section aria-labelledby="inventory-exit-details-title">
                    <h2 id="inventory-exit-details-title" className="mb-4 text-sm font-bold text-brand-navy">
                      Dados da saída
                    </h2>
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                      <Controller name="type" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="inventory-exit-type">Motivo <span className="text-destructive">*</span></FieldLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="inventory-exit-type" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Selecione o motivo" />
                            </SelectTrigger>
                            <SelectContent>
                              {exitTypes.map((exitType) => (
                                <SelectItem key={exitType} value={exitType} className="min-h-11 px-3 py-2.5">
                                  {formatMovementReasonLabel(exitType)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />

                      <Controller name="occurredAt" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="inventory-exit-date">Data da saída <span className="text-destructive">*</span></FieldLabel>
                          <Input {...field} id="inventory-exit-date" type="date" aria-invalid={fieldState.invalid} />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />

                      <Controller name="laboratoryId" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                          <FieldLabel htmlFor="inventory-exit-laboratory">Laboratório de origem <span className="text-destructive">*</span></FieldLabel>
                          <Select value={field.value} onValueChange={handleLaboratoryChange}>
                            <SelectTrigger id="inventory-exit-laboratory" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Selecione um laboratório" />
                            </SelectTrigger>
                            <SelectContent>
                              {laboratories.map((laboratory) => (
                                <SelectItem key={laboratory.id} value={laboratory.id} className="min-h-11 px-3 py-2.5">{laboratory.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldDescription>Os itens e o saldo disponível dependem do laboratório escolhido.</FieldDescription>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />

                      <Controller name="notes" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                          <FieldLabel htmlFor="inventory-exit-notes">Observações</FieldLabel>
                          <Textarea {...field} id="inventory-exit-notes" rows={3} maxLength={4000} placeholder="Ex.: experimento, responsável ou motivo do descarte" aria-invalid={fieldState.invalid} />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />
                    </FieldGroup>
                  </section>

                  <section aria-labelledby="inventory-exit-items-title" className="border-t pt-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 id="inventory-exit-items-title" className="text-sm font-bold text-brand-navy">
                          Itens retirados <span className="text-destructive">*</span>
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          A quantidade não pode ultrapassar o saldo do laboratório.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!laboratoryId || fields.length >= Math.min(200, availableItems.length)}
                        onClick={() => append(createEmptyLine())}
                      >
                        <Plus aria-hidden="true" className="size-5 sm:size-4" />
                        Adicionar item
                      </Button>
                    </div>

                    {!laboratoryId ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-muted-foreground">
                        Selecione o laboratório de origem para ver os itens com saldo.
                      </p>
                    ) : stockQuery.isPending ? (
                      <p role="status" className="rounded-xl border border-slate-200 px-4 py-6 text-center text-sm text-muted-foreground">
                        Carregando saldo do laboratório…
                      </p>
                    ) : stockQuery.isError ? (
                      <div className="rounded-xl border border-slate-200 px-4 py-6 text-center">
                        <p role="alert" className="text-sm text-destructive">Não foi possível carregar o saldo deste laboratório.</p>
                        <Button type="button" variant="outline" className="mt-4" onClick={() => void stockQuery.refetch()}>
                          Tentar novamente
                        </Button>
                      </div>
                    ) : availableItems.length === 0 ? (
                      <p className="rounded-xl border border-slate-200 px-4 py-6 text-center text-sm text-muted-foreground">
                        Este laboratório não tem itens com saldo.
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
                                    <FieldLabel htmlFor={`inventory-exit-item-${index}`}>Item <span className="text-destructive">*</span></FieldLabel>
                                    <Select value={lineValues[index]?.inventoryItemId ?? ''} onValueChange={(value) => handleItemChange(index, value)}>
                                      <SelectTrigger id={`inventory-exit-item-${index}`} className="h-10 w-full" aria-invalid={fieldState.invalid}>
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
                                    <FieldLabel htmlFor={`inventory-exit-quantity-${index}`}>Quantidade {stockItem && `(${formatUnitOfMeasure(stockItem.unitOfMeasure)})`} <span className="text-destructive">*</span></FieldLabel>
                                    <Input {...quantityField} id={`inventory-exit-quantity-${index}`} type="text" inputMode="decimal" maxLength={20} placeholder="0" aria-invalid={fieldState.invalid || Boolean(balanceError)} />
                                    {stockItem && !fieldState.error && !balanceError && (
                                      <FieldDescription>
                                        Disponível: {formatQuantity(stockItem.quantity)} {formatUnitOfMeasure(stockItem.unitOfMeasure)}
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

                <aside aria-labelledby="inventory-exit-summary-title" className="h-fit rounded-xl border border-amber-200 bg-amber-50 p-4 lg:sticky lg:top-0">
                  <h2 id="inventory-exit-summary-title" className="text-sm font-bold text-brand-navy">Resumo da saída</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-muted-foreground">Motivo</dt>
                      <dd className="text-right font-medium text-brand-navy">{formatMovementReasonLabel(type)}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-muted-foreground">Laboratório</dt>
                      <dd className="min-w-0 break-words text-right font-medium text-brand-navy">{selectedLaboratory?.name ?? '—'}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-muted-foreground">Itens</dt>
                      <dd className="text-right font-medium text-brand-navy">
                        {fields.length} {fields.length === 1 ? 'item' : 'itens'}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3 border-t border-amber-200 pt-3">
                      <dt className="font-semibold text-brand-navy">Custo estimado</dt>
                      <dd className="text-right font-bold text-brand-navy">{formatCurrencyBRL(estimatedCost)}</dd>
                    </div>
                  </dl>
                  <FieldDescription className="mt-3">
                    Estimativa pelo custo médio atual do laboratório. O valor final é calculado pelo sistema ao registrar.
                  </FieldDescription>
                </aside>
              </div>
            </div>

            <DialogFooter className="mx-0 mb-0 flex-row flex-wrap items-center justify-between gap-3 border-t bg-background px-5 py-3 sm:flex-nowrap sm:px-6">
              {formError && <p role="alert" className="w-full min-w-0 text-sm text-destructive sm:mr-auto sm:w-auto">{formError}</p>}
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSaving}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving || !laboratoryId || availableItems.length === 0}>
                {isSaving ? 'Registrando…' : 'Registrar saída'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
