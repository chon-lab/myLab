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
import { formatCurrencyBRL, formatUnitOfMeasure } from '@/pages/inventory-stock/inventory-stock-format'
import {
  useCreateInventoryEntryMutation,
  useInventoryItemsQuery,
  useInventoryLaboratoriesQuery,
} from '@/queries/inventory/inventory.queries'
import type { InventoryEntrySource } from '@/types/inventory/inventory.types'
import {
  getActiveInventoryItems,
  inventoryEntryFormSchema,
  parseInventoryDecimal,
  toCreateInventoryEntryRequest,
  type InventoryEntryFormValues,
} from '@/types/inventory/inventory-entry.schema'

function getLocalDateInputValue() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function createDefaultValues(): InventoryEntryFormValues {
  return {
    laboratoryId: '',
    source: 'PURCHASE',
    purchaseType: '',
    sourceName: '',
    receivedAt: getLocalDateInputValue(),
    notes: '',
    items: [
      {
        inventoryItemId: '',
        unitOfMeasure: '',
        quantity: '',
        historicalUnitValue: '',
        batchNumber: '',
        manufacturer: '',
        expirationDate: '',
      },
    ],
  }
}

function getFormErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível registrar a entrada. Tente novamente.'
  }

  if (error.status === 404) {
    return 'O grupo, laboratório ou item selecionado não foi encontrado. Atualize os dados e tente novamente.'
  }
  if (error.status === 409) {
    return 'A entrada conflita com dados existentes. Revise as informações e tente novamente.'
  }
  if (error.status === 400) {
    return Object.keys(error.fieldErrors).length > 0
      ? 'Revise os campos destacados e tente novamente.'
      : 'A API recusou os dados informados. Revise a origem, os itens e os valores.'
  }

  return 'Não foi possível registrar a entrada. Tente novamente.'
}

function toFormFieldPath(apiField: string) {
  return apiField
    .replace(/^request\./, '')
    .replace(/\[(\d+)\]/g, '.$1')
}

export function InventoryEntryFormDialog({
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
  const itemsQuery = useInventoryItemsQuery(researchGroupId)
  const laboratoriesQuery = useInventoryLaboratoriesQuery(researchGroupId)
  const createEntry = useCreateInventoryEntryMutation(researchGroupId)
  const activeItems = useMemo(() => getActiveInventoryItems(itemsQuery.data), [itemsQuery.data])
  const laboratories = useMemo(() => laboratoriesQuery.data ?? [], [laboratoriesQuery.data])
  const [formError, setFormError] = useState<string | null>(null)
  const wasOpen = useRef(false)
  const preselectionApplied = useRef(false)
  const form = useForm<InventoryEntryFormValues>({
    resolver: zodResolver(inventoryEntryFormSchema),
    defaultValues: createDefaultValues(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })
  const { control, handleSubmit, setError, setFocus, setValue, clearErrors, reset, formState } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const source = useWatch({ control, name: 'source' })
  const purchaseType = useWatch({ control, name: 'purchaseType' })
  const lineValues = useWatch({ control, name: 'items' }) ?? []
  const totalValue = lineValues.reduce((sum, line) => {
    const quantity = parseInventoryDecimal(line?.quantity ?? '')
    const unitValue = parseInventoryDecimal(line?.historicalUnitValue ?? '')
    return sum + (quantity ?? 0) * (unitValue ?? 0)
  }, 0)
  const isSaving = formState.isSubmitting || createEntry.isPending
  const isLoadingOptions = itemsQuery.isPending || laboratoriesQuery.isPending
  const optionsError = itemsQuery.isError || laboratoriesQuery.isError

  useEffect(() => {
    if (!open) {
      wasOpen.current = false
      preselectionApplied.current = false
      return
    }
    if (wasOpen.current) return

    wasOpen.current = true
    setFormError(null)
    reset(createDefaultValues())
  }, [open, reset])

  useEffect(() => {
    if (!open || preselectionApplied.current || !itemsQuery.isSuccess || !laboratoriesQuery.isSuccess) return

    const matchingLaboratory = laboratories.find(
      (laboratory) => laboratory.id === preselectedLaboratoryId,
    )
    const matchingItem = activeItems.find((item) => item.id === preselectedItemId)
    if (matchingLaboratory) {
      setValue('laboratoryId', matchingLaboratory.id, { shouldValidate: true })
    }
    if (matchingItem) {
      setValue('items.0.inventoryItemId', matchingItem.id, { shouldValidate: true })
      setValue('items.0.unitOfMeasure', matchingItem.unitOfMeasure)
    }
    preselectionApplied.current = true
  }, [activeItems, itemsQuery.isSuccess, laboratories, laboratoriesQuery.isSuccess, open, preselectedItemId, preselectedLaboratoryId, setValue])

  async function submit(values: InventoryEntryFormValues) {
    setFormError(null)

    const invalidFractionalLine = values.items.findIndex((line) => {
      const quantity = parseInventoryDecimal(line.quantity)
      return Boolean(
        quantity !== null &&
        line.unitOfMeasure &&
        !['M', 'KG', 'L'].includes(line.unitOfMeasure) &&
        !Number.isInteger(quantity),
      )
    })

    if (invalidFractionalLine >= 0) {
      setError(`items.${invalidFractionalLine}.quantity`, {
        type: 'validate',
        message: 'Esta unidade aceita somente quantidades inteiras.',
      })
      setFocus(`items.${invalidFractionalLine}.quantity`)
      return
    }

    try {
      await createEntry.mutateAsync(toCreateInventoryEntryRequest(values))
      onCreated()
      reset(createDefaultValues())
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.fieldErrors).forEach(([apiField, message]) => {
          setError(toFormFieldPath(apiField) as FieldPath<InventoryEntryFormValues>, {
            type: 'server',
            message,
          })
        })
      }
      setFormError(getFormErrorMessage(error))
      publishApiErrorToast(error)
    }
  }

  function handleSourceChange(value: InventoryEntrySource) {
    form.setValue('source', value, { shouldDirty: true, shouldValidate: true })
    if (value === 'DONATION') {
      form.setValue('purchaseType', '', { shouldDirty: true, shouldValidate: true })
      clearErrors('purchaseType')
    }
  }

  function handleItemChange(index: number, itemId: string) {
    const selectedItem = activeItems.find((item) => item.id === itemId)
    setValue(`items.${index}.inventoryItemId`, itemId, { shouldDirty: true, shouldValidate: true })
    setValue(`items.${index}.unitOfMeasure`, selectedItem?.unitOfMeasure ?? '', {
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
              aria-label="Fechar registro de entrada"
              className="absolute top-3 right-3 size-10 sm:top-4 sm:right-4 sm:size-7"
            >
              <X aria-hidden="true" className="size-5 sm:size-4" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Registrar entrada</DialogTitle>
          <DialogDescription>
            Informe a origem, o laboratório de destino e os itens que chegaram ao estoque.
          </DialogDescription>
        </DialogHeader>

        {isLoadingOptions ? (
          <p role="status" className="px-5 py-8 text-sm text-muted-foreground sm:px-6">
            Carregando itens ativos e laboratórios do grupo…
          </p>
        ) : optionsError ? (
          <section className="px-5 py-8 sm:px-6" aria-label="Erro ao carregar dados da entrada">
            <p role="alert" className="text-sm text-destructive">
              Não foi possível carregar os itens ou laboratórios deste grupo.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void Promise.all([itemsQuery.refetch(), laboratoriesQuery.refetch()])}
            >
              Tentar novamente
            </Button>
          </section>
        ) : laboratories.length === 0 || activeItems.length === 0 ? (
          <section className="px-5 py-8 sm:px-6" aria-label="Dados necessários indisponíveis">
            <p className="text-sm font-semibold text-brand-navy">
              {laboratories.length === 0
                ? 'Cadastre um laboratório neste grupo antes de registrar a entrada.'
                : 'Não há itens ativos no catálogo para adicionar à entrada.'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              A entrada só pode usar laboratórios do grupo e itens ativos do catálogo.
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
                  <section aria-labelledby="inventory-entry-origin-title">
                    <h2 id="inventory-entry-origin-title" className="mb-4 text-sm font-bold text-brand-navy">
                      Origem e recebimento
                    </h2>
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                      <Controller name="source" control={control} render={({ fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="inventory-entry-source">Origem <span className="text-destructive">*</span></FieldLabel>
                          <Select value={source} onValueChange={(value) => handleSourceChange(value as InventoryEntrySource)}>
                            <SelectTrigger id="inventory-entry-source" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Selecione a origem" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PURCHASE" className="min-h-11 px-3 py-2.5">Compra</SelectItem>
                              <SelectItem value="DONATION" className="min-h-11 px-3 py-2.5">Doação</SelectItem>
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />

                      {source === 'PURCHASE' && (
                        <Controller name="purchaseType" control={control} render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="inventory-entry-purchase-type">Tipo da compra <span className="text-destructive">*</span></FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger id="inventory-entry-purchase-type" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FUNDING" className="min-h-11 px-3 py-2.5">Fomento</SelectItem>
                                <SelectItem value="OTHER" className="min-h-11 px-3 py-2.5">Outra origem</SelectItem>
                              </SelectContent>
                            </Select>
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )} />
                      )}

                      <Controller name="sourceName" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                          <FieldLabel htmlFor="inventory-entry-source-name">Fornecedor, doador ou agência <span className="text-destructive">*</span></FieldLabel>
                          <Input {...field} id="inventory-entry-source-name" maxLength={255} placeholder="Ex.: nome do fornecedor ou agência de fomento" aria-invalid={fieldState.invalid} />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />

                      <Controller name="laboratoryId" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="inventory-entry-laboratory">Laboratório de destino <span className="text-destructive">*</span></FieldLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="inventory-entry-laboratory" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Selecione um laboratório" />
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

                      <Controller name="receivedAt" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="inventory-entry-date">Data de recebimento <span className="text-destructive">*</span></FieldLabel>
                          <Input {...field} id="inventory-entry-date" type="date" aria-invalid={fieldState.invalid} />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />

                      <Controller name="notes" control={control} render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                          <FieldLabel htmlFor="inventory-entry-notes">Observações</FieldLabel>
                          <Textarea {...field} id="inventory-entry-notes" rows={3} maxLength={4000} placeholder="Informações adicionais sobre o recebimento" aria-invalid={fieldState.invalid} />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )} />
                    </FieldGroup>
                  </section>

                  <section aria-labelledby="inventory-entry-items-title" className="border-t pt-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 id="inventory-entry-items-title" className="text-sm font-bold text-brand-navy">
                          Itens recebidos <span className="text-destructive">*</span>
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Informe a quantidade e o valor unitário histórico de cada item.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={fields.length >= 200}
                        onClick={() => append({
                          inventoryItemId: '',
                          unitOfMeasure: '',
                          quantity: '',
                          historicalUnitValue: '',
                          batchNumber: '',
                          manufacturer: '',
                          expirationDate: '',
                        })}
                      >
                        <Plus aria-hidden="true" className="size-5 sm:size-4" />
                        Adicionar item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {fields.map((field, index) => {
                        const selectedItem = activeItems.find((item) => item.id === lineValues[index]?.inventoryItemId)
                        const alreadySelected = new Set(
                          lineValues
                            .map((line, lineIndex) => lineIndex !== index ? line?.inventoryItemId : '')
                            .filter(Boolean),
                        )

                        return (
                          <fieldset key={field.id} className="min-w-0 rounded-xl border border-slate-200 bg-card p-4">
                            <legend className="sr-only">Item {index + 1}</legend>
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <h3 className="text-sm font-semibold text-brand-navy">Item {index + 1}</h3>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Remover item ${index + 1}`}
                                className="size-10 sm:size-7"
                                onClick={() => remove(index)}
                              >
                                <Trash2 aria-hidden="true" className="size-5 sm:size-4" />
                              </Button>
                            </div>

                            <FieldGroup className="grid gap-4 sm:grid-cols-2">
                              <Controller name={`items.${index}.inventoryItemId`} control={control} render={({ fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                                  <FieldLabel htmlFor={`inventory-entry-item-${index}`}>Item do catálogo <span className="text-destructive">*</span></FieldLabel>
                                  <Select value={lineValues[index]?.inventoryItemId ?? ''} onValueChange={(value) => handleItemChange(index, value)}>
                                    <SelectTrigger id={`inventory-entry-item-${index}`} className="h-10 w-full" aria-invalid={fieldState.invalid}>
                                      <SelectValue placeholder="Selecione um item ativo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {activeItems.map((item) => (
                                        <SelectItem key={item.id} value={item.id} disabled={alreadySelected.has(item.id)} className="min-h-11 px-3 py-2.5">
                                          {item.name} · {formatUnitOfMeasure(item.unitOfMeasure)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              )} />

                              <Controller name={`items.${index}.quantity`} control={control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={`inventory-entry-quantity-${index}`}>Quantidade {selectedItem && `(${formatUnitOfMeasure(selectedItem.unitOfMeasure)})`} <span className="text-destructive">*</span></FieldLabel>
                                  <Input {...field} id={`inventory-entry-quantity-${index}`} type="text" inputMode="decimal" maxLength={20} placeholder="0" aria-invalid={fieldState.invalid} />
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              )} />

                              <Controller name={`items.${index}.historicalUnitValue`} control={control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={`inventory-entry-unit-value-${index}`}>Valor unitário nesta entrada <span className="text-destructive">*</span></FieldLabel>
                                  <div className="relative">
                                    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">R$</span>
                                    <Input {...field} id={`inventory-entry-unit-value-${index}`} type="text" inputMode="decimal" maxLength={20} className="pl-9" placeholder="0,00" aria-invalid={fieldState.invalid} />
                                  </div>
                                  {selectedItem && (
                                    <FieldDescription>
                                      Informe o preço de uma unidade recebida. Referência atual do catálogo: {formatCurrencyBRL(selectedItem.referenceUnitValue)}.
                                    </FieldDescription>
                                  )}
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              )} />

                              <Controller name={`items.${index}.batchNumber`} control={control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={`inventory-entry-batch-${index}`}>Lote <span className="text-xs font-normal text-muted-foreground">(opcional)</span></FieldLabel>
                                  <Input {...field} id={`inventory-entry-batch-${index}`} maxLength={100} aria-invalid={fieldState.invalid} />
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              )} />

                              <Controller name={`items.${index}.manufacturer`} control={control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={`inventory-entry-manufacturer-${index}`}>Fabricante <span className="text-xs font-normal text-muted-foreground">(opcional)</span></FieldLabel>
                                  <Input {...field} id={`inventory-entry-manufacturer-${index}`} maxLength={255} aria-invalid={fieldState.invalid} />
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              )} />

                              <Controller name={`items.${index}.expirationDate`} control={control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={`inventory-entry-expiration-${index}`}>Validade <span className="text-xs font-normal text-muted-foreground">(opcional)</span></FieldLabel>
                                  <Input {...field} id={`inventory-entry-expiration-${index}`} type="date" aria-invalid={fieldState.invalid} />
                                  <FieldError errors={[fieldState.error]} />
                                </Field>
                              )} />
                            </FieldGroup>
                          </fieldset>
                        )
                      })}
                    </div>
                    {formState.errors.items?.root?.message && (
                      <p role="alert" className="mt-2 text-sm text-destructive">{formState.errors.items.root.message}</p>
                    )}
                  </section>
                </div>

                <aside aria-labelledby="inventory-entry-summary-title" className="h-fit rounded-xl border border-amber-200 bg-amber-50 p-4 lg:sticky lg:top-0">
                  <h2 id="inventory-entry-summary-title" className="text-sm font-bold text-brand-navy">Resumo da entrada</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-muted-foreground">Origem</dt>
                      <dd className="text-right font-medium text-brand-navy">
                        {source === 'DONATION' ? 'Doação' : purchaseType === 'FUNDING' ? 'Fomento' : 'Compra'}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-muted-foreground">Itens</dt>
                      <dd className="text-right font-medium text-brand-navy">
                        {fields.length} {fields.length === 1 ? 'item' : 'itens'}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3 border-t border-amber-200 pt-3">
                      <dt className="font-semibold text-brand-navy">Valor histórico total</dt>
                      <dd className="text-right font-bold text-brand-navy">{formatCurrencyBRL(totalValue)}</dd>
                    </div>
                  </dl>
                  <FieldDescription className="mt-3">
                    O valor é calculado pela quantidade multiplicada pelo valor unitário de cada item.
                  </FieldDescription>
                </aside>
              </div>
            </div>

            <DialogFooter className="mx-0 mb-0 flex-row flex-wrap items-center justify-between gap-3 border-t bg-background px-5 py-3 sm:flex-nowrap sm:px-6">
              {formError && <p role="alert" className="w-full min-w-0 text-sm text-destructive sm:mr-auto sm:w-auto">{formError}</p>}
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSaving}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Registrando…' : 'Registrar entrada'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
