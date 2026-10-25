import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Archive, Check, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api-client'
import { publishApiErrorToast } from '@/lib/api-error-toasts'
import { cn } from '@/lib/utils'
import { unitOfMeasureDescriptions } from '@/pages/inventory-items/inventory-item-format'
import { formatItemTypeLabel } from '@/pages/inventory-stock/inventory-stock-format'
import {
  inventoryKeys,
  useCreateInventoryItemMutation,
  useInventoryItemQuery,
  useUpdateInventoryItemMutation,
} from '@/queries/inventory/inventory.queries'
import {
  inventoryItemFormSchema,
  inventoryItemTypeValues,
  inventoryUnitOfMeasureValues,
  toCreateInventoryItemPayload,
  toInventoryItemFormFieldPath,
  toInventoryItemFormValues,
  toUpdateInventoryItemPayload,
  type InventoryItemFormValues,
} from '@/types/inventory/inventory-item.schema'
import type {
  InventoryItem,
  InventoryItemType,
  InventoryUnitOfMeasure,
} from '@/types/inventory/inventory.types'

export type InventoryItemSheetState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; item: InventoryItem }

const optionLabelClassName =
  'flex cursor-pointer rounded-lg border border-slate-200 bg-card text-brand-navy transition-colors hover:bg-slate-50 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60'

function getSaveErrorMessage(error: unknown, mode: 'create' | 'edit') {
  if (!(error instanceof ApiError)) {
    return mode === 'create'
      ? 'Não foi possível criar o item. Tente novamente.'
      : 'Não foi possível salvar as alterações. Tente novamente.'
  }

  if (error.status === 404) {
    return mode === 'create'
      ? 'Este grupo de pesquisa não foi encontrado. Ele pode ter sido removido.'
      : 'Este item não foi encontrado. Ele pode ter sido arquivado.'
  }

  if (error.status === 400 && Object.keys(error.fieldErrors).length > 0) {
    return 'Revise os campos destacados e tente novamente.'
  }

  if (error.status === 400) {
    return 'O servidor recusou os dados informados. Revise os campos e tente novamente.'
  }

  return mode === 'create'
    ? 'Não foi possível criar o item. Tente novamente.'
    : 'Não foi possível salvar as alterações. Tente novamente.'
}

function InventoryItemFormContent({
  researchGroupId,
  mode,
  initialItem,
  onSaved,
  onArchive,
}: {
  researchGroupId: string
  mode: 'create' | 'edit'
  initialItem?: InventoryItem
  onSaved: (mode: 'create' | 'edit') => void
  onArchive: (item: InventoryItem) => void
}) {
  const queryClient = useQueryClient()
  const detailQuery = useInventoryItemQuery(
    mode === 'edit' && initialItem ? initialItem.id : null,
    initialItem,
  )
  const effectiveItem = mode === 'edit' ? (detailQuery.data ?? initialItem) : undefined
  const isEditing = mode === 'edit'

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isDirty },
  } = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: toInventoryItemFormValues(effectiveItem),
  })

  const createItem = useCreateInventoryItemMutation(researchGroupId)
  const updateItem = useUpdateInventoryItemMutation()
  const isSubmitting = createItem.isPending || updateItem.isPending
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (detailQuery.isError) publishApiErrorToast(detailQuery.error)
  }, [detailQuery.error, detailQuery.isError])

  useEffect(() => {
    setFocus('name')
  }, [setFocus])

  useEffect(() => {
    if (isEditing && detailQuery.data && !isDirty) {
      reset(toInventoryItemFormValues(detailQuery.data))
    }
  }, [detailQuery.data, isDirty, isEditing, reset])

  if (isEditing && detailQuery.isError) {
    const isNotFound = detailQuery.error instanceof ApiError && detailQuery.error.status === 404

    return (
      <div className="space-y-4 px-7 py-6">
        <p role="alert" className="text-sm text-destructive">
          {isNotFound
            ? 'Este item não foi encontrado. Ele pode ter sido arquivado.'
            : 'Não foi possível carregar os dados atualizados deste item.'}
        </p>
        <div className="flex justify-end gap-3">
          {!isNotFound && (
            <Button type="button" variant="outline" onClick={() => void detailQuery.refetch()}>
              Tentar novamente
            </Button>
          )}
          <SheetClose asChild>
            <Button
              type="button"
              onClick={() => {
                if (isNotFound) {
                  void queryClient.invalidateQueries({ queryKey: inventoryKeys.items() })
                }
              }}
            >
              Fechar
            </Button>
          </SheetClose>
        </div>
      </div>
    )
  }

  function handleMutationError(error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.items() })
      }
      Object.entries(error.fieldErrors).forEach(([apiField, message]) => {
        setError(toInventoryItemFormFieldPath(apiField), { type: 'server', message })
      })
    }
    setFormError(getSaveErrorMessage(error, mode))
    publishApiErrorToast(error)
  }

  function submit(values: InventoryItemFormValues) {
    setFormError(null)

    if (mode === 'create') {
      createItem.mutate(toCreateInventoryItemPayload(values), {
        onSuccess: () => onSaved('create'),
        onError: handleMutationError,
      })
      return
    }

    if (!effectiveItem) return

    updateItem.mutate(
      { itemId: effectiveItem.id, body: toUpdateInventoryItemPayload(values) },
      {
        onSuccess: () => onSaved('edit'),
        onError: handleMutationError,
      },
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
        <FieldGroup>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="inventory-item-form-name">
                  Nome do item
                  <span aria-hidden="true" className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  id="inventory-item-form-name"
                  maxLength={255}
                  required
                  placeholder="Ex.: Acetonitrila grau HPLC"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="inventory-item-form-description">Descrição</FieldLabel>
                <Textarea
                  {...field}
                  id="inventory-item-form-description"
                  rows={3}
                  maxLength={2000}
                  placeholder="Para que serve, apresentação, observações."
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="itemType"
            control={control}
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label">
                  Tipo
                  <span aria-hidden="true" className="text-destructive">*</span>
                </FieldLegend>
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as InventoryItemType)}
                  disabled={isEditing}
                  aria-describedby="inventory-item-form-type-hint"
                  className="inline-flex w-fit gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1"
                >
                  {inventoryItemTypeValues.map((itemType) => (
                    <label
                      key={itemType}
                      className="cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors has-[[aria-checked=true]]:bg-card has-[[aria-checked=true]]:font-semibold has-[[aria-checked=true]]:text-brand-navy has-[[aria-checked=true]]:shadow-xs has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 has-[:disabled]:cursor-not-allowed"
                    >
                      <RadioGroupItem value={itemType} className="sr-only" />
                      {formatItemTypeLabel(itemType)}
                    </label>
                  ))}
                </RadioGroup>
                <FieldDescription id="inventory-item-form-type-hint">
                  {isEditing
                    ? 'O tipo não pode ser alterado depois do cadastro.'
                    : 'Durável volta a ser usado, como equipamentos. Consumo acaba no uso.'}
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          <Controller
            name="unitOfMeasure"
            control={control}
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label">
                  Unidade de medida
                  <span aria-hidden="true" className="text-destructive">*</span>
                </FieldLegend>
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as InventoryUnitOfMeasure)}
                  disabled={isEditing}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                >
                  {inventoryUnitOfMeasureValues.map((unit) => (
                    <label key={unit} className={cn(optionLabelClassName, 'flex-col px-3 py-2.5')}>
                      <RadioGroupItem value={unit} className="sr-only" />
                      <span className="text-sm font-bold">{unit}</span>
                      <span className="text-xs text-muted-foreground">
                        {unitOfMeasureDescriptions[unit]}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
                {isEditing && (
                  <FieldDescription>
                    A unidade não pode ser alterada depois do cadastro.
                  </FieldDescription>
                )}
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          <Controller
            name="referenceUnitValue"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="inventory-item-form-value">
                  Valor unitário de referência
                  <span aria-hidden="true" className="text-destructive">*</span>
                </FieldLabel>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground"
                  >
                    R$
                  </span>
                  <Input
                    {...field}
                    id="inventory-item-form-value"
                    inputMode="decimal"
                    required
                    placeholder="0,00"
                    aria-invalid={fieldState.invalid}
                    aria-describedby="inventory-item-form-value-hint"
                    className="pl-9 tabular-nums"
                  />
                </div>
                <FieldDescription id="inventory-item-form-value-hint">
                  Usado como sugestão ao registrar entradas.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <SheetFooter className="mt-0 flex-col gap-3 border-t px-7 py-4 sm:flex-row sm:items-center">
        {formError && (
          <p role="alert" className="text-sm text-destructive sm:mr-auto">
            {formError}
          </p>
        )}
        {isEditing && effectiveItem?.active && (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive sm:mr-auto"
            disabled={isSubmitting}
            onClick={() => onArchive(effectiveItem)}
          >
            <Archive aria-hidden="true" />
            Arquivar item
          </Button>
        )}
        <div className="flex gap-3 sm:ml-auto">
          <SheetClose asChild>
            <Button type="button" variant="outline" className="flex-1 sm:flex-none" disabled={isSubmitting}>
              Cancelar
            </Button>
          </SheetClose>
          <Button type="submit" className="flex-1 sm:flex-none" disabled={isSubmitting}>
            <Check aria-hidden="true" />
            {isSubmitting ? 'Salvando…' : 'Salvar item'}
          </Button>
        </div>
      </SheetFooter>
    </form>
  )
}

export function InventoryItemFormSheet({
  researchGroupId,
  state,
  onOpenChange,
  onSaved,
  onArchive,
}: {
  researchGroupId: string
  state: InventoryItemSheetState
  onOpenChange: (open: boolean) => void
  onSaved: (mode: 'create' | 'edit') => void
  onArchive: (item: InventoryItem) => void
}) {
  const isOpen = state.open
  const mode = state.open ? state.mode : 'create'
  const item = state.open && state.mode === 'edit' ? state.item : undefined

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[480px]"
      >
        <SheetHeader className="relative border-b px-7 py-6 pr-14">
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-5 right-5">
              <X aria-hidden="true" />
            </Button>
          </SheetClose>
          <SheetTitle className="text-xl font-bold text-brand-navy">
            {mode === 'create' ? 'Novo item' : 'Editar item'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'O item entra no catálogo. O saldo só aumenta quando você registra uma entrada.'
              : 'Atualize o nome, a descrição e o valor de referência deste item.'}
          </SheetDescription>
        </SheetHeader>
        {isOpen && (
          <InventoryItemFormContent
            key={mode === 'edit' && item ? item.id : 'create'}
            researchGroupId={researchGroupId}
            mode={mode}
            initialItem={item}
            onSaved={onSaved}
            onArchive={onArchive}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
