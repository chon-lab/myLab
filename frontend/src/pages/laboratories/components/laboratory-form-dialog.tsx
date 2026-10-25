import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

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
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api-client'
import { publishApiErrorToast } from '@/lib/api-error-toasts'
import { laboratoryStatusLabels } from '@/pages/laboratories/laboratory-format'
import {
  laboratoriesKeys,
  useCreateLaboratoryMutation,
  useLaboratoryQuery,
  useUpdateLaboratoryMutation,
} from '@/queries/laboratories/laboratories.queries'
import {
  laboratoryFormSchema,
  laboratoryStatusValues,
  toLaboratoryFormFieldPath,
  toLaboratoryFormValues,
  toLaboratoryPayload,
  type LaboratoryFormValues,
} from '@/types/laboratories/laboratory.schema'
import type { Laboratory, LaboratoryStatus } from '@/types/laboratories/laboratory.types'

export type LaboratoryDialogState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; laboratory: Laboratory }

function getSaveErrorMessage(error: unknown, mode: 'create' | 'edit') {
  if (!(error instanceof ApiError)) {
    return mode === 'create'
      ? 'Não foi possível criar o laboratório. Tente novamente.'
      : 'Não foi possível salvar as alterações. Tente novamente.'
  }

  if (error.status === 404) {
    return mode === 'create'
      ? 'Este grupo de pesquisa não foi encontrado. Ele pode ter sido removido.'
      : 'Este laboratório não foi encontrado. Ele pode ter sido removido.'
  }

  if (error.message.includes('updatedAt must not move backwards')) {
    return 'A data de atualização do laboratório está inconsistente. Reinicie o backend e tente salvar novamente.'
  }

  if (error.status === 400 && Object.keys(error.fieldErrors).length > 0) {
    return 'Revise os campos destacados e tente novamente.'
  }

  if (error.status === 400) {
    return 'O servidor recusou os dados informados. Revise os campos e tente novamente.'
  }

  return mode === 'create'
    ? 'Não foi possível criar o laboratório. Tente novamente.'
    : 'Não foi possível salvar as alterações. Tente novamente.'
}

function LaboratoryFormContent({
  researchGroupId,
  mode,
  initialLaboratory,
  onSaved,
}: {
  researchGroupId: string
  mode: 'create' | 'edit'
  initialLaboratory?: Laboratory
  onSaved: (mode: 'create' | 'edit') => void
}) {
  const queryClient = useQueryClient()
  const detailQuery = useLaboratoryQuery(
    mode === 'edit' && initialLaboratory ? initialLaboratory.id : null,
    initialLaboratory,
  )
  const effectiveLaboratory =
    mode === 'edit' ? (detailQuery.data ?? initialLaboratory) : undefined

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isDirty },
  } = useForm<LaboratoryFormValues>({
    resolver: zodResolver(laboratoryFormSchema),
    defaultValues: toLaboratoryFormValues(effectiveLaboratory),
  })

  const createLaboratory = useCreateLaboratoryMutation(researchGroupId)
  const updateLaboratory = useUpdateLaboratoryMutation()
  const isSubmitting = createLaboratory.isPending || updateLaboratory.isPending
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (detailQuery.isError) publishApiErrorToast(detailQuery.error)
  }, [detailQuery.error, detailQuery.isError])

  useEffect(() => {
    setFocus('name')
  }, [setFocus])

  useEffect(() => {
    if (mode === 'edit' && detailQuery.data && !isDirty) {
      reset(toLaboratoryFormValues(detailQuery.data))
    }
  }, [detailQuery.data, isDirty, mode, reset])

  if (mode === 'edit' && detailQuery.isError) {
    const isNotFound = detailQuery.error instanceof ApiError && detailQuery.error.status === 404

    return (
      <div className="space-y-4 px-6 py-6">
        <p role="alert" className="text-sm text-destructive">
          {isNotFound
            ? 'Este laboratório não foi encontrado. Ele pode ter sido removido.'
            : 'Não foi possível carregar os dados atualizados deste laboratório.'}
        </p>
        <DialogFooter className="mx-0 mb-0 px-0 py-0">
          {!isNotFound && (
            <Button type="button" variant="outline" onClick={() => void detailQuery.refetch()}>
              Tentar novamente
            </Button>
          )}
          <DialogClose asChild>
            <Button
              type="button"
              onClick={() => {
                if (isNotFound) {
                  void queryClient.invalidateQueries({ queryKey: laboratoriesKeys.all })
                }
              }}
            >
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </div>
    )
  }

  function handleMutationError(error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        void queryClient.invalidateQueries({ queryKey: laboratoriesKeys.all })
      }
      Object.entries(error.fieldErrors).forEach(([apiField, message]) => {
        setError(toLaboratoryFormFieldPath(apiField), { type: 'server', message })
      })
    }
    setFormError(getSaveErrorMessage(error, mode))
  }

  function submit(values: LaboratoryFormValues) {
    setFormError(null)
    const payload = toLaboratoryPayload(values)

    if (mode === 'create') {
      createLaboratory.mutate(payload, {
        onSuccess: () => onSaved('create'),
        onError: handleMutationError,
      })
      return
    }

    if (!effectiveLaboratory) return

    updateLaboratory.mutate(
      { id: effectiveLaboratory.id, body: payload },
      {
        onSuccess: () => onSaved('edit'),
        onError: handleMutationError,
      },
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <FieldGroup>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="laboratory-form-name">Nome do laboratório</FieldLabel>
                <Input
                  {...field}
                  id="laboratory-form-name"
                  maxLength={255}
                  placeholder="Ex.: Laboratório de Síntese Orgânica"
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
                <FieldLabel htmlFor="laboratory-form-description">Descrição</FieldLabel>
                <Textarea
                  {...field}
                  id="laboratory-form-description"
                  rows={3}
                  maxLength={1000}
                  placeholder="O que é feito neste laboratório."
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="laboratory-form-status">Situação</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as LaboratoryStatus)}
                >
                  <SelectTrigger
                    id="laboratory-form-status"
                    className="h-10 w-full sm:w-60"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    {laboratoryStatusValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {laboratoryStatusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>

        <FieldSet>
          <FieldLegend className="text-sm font-semibold text-brand-navy">Endereço</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <Controller
              name="street"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="laboratory-form-street">Logradouro</FieldLabel>
                  <Input
                    {...field}
                    id="laboratory-form-street"
                    maxLength={255}
                    placeholder="Ex.: Bloco B, sala 214, Av. Universitária"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="number"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="laboratory-form-number">Número</FieldLabel>
                  <Input
                    {...field}
                    id="laboratory-form-number"
                    maxLength={30}
                    placeholder="Ex.: 1500"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="city"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="laboratory-form-city">Cidade</FieldLabel>
                  <Input
                    {...field}
                    id="laboratory-form-city"
                    maxLength={120}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="postalCode"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="laboratory-form-postal-code">CEP</FieldLabel>
                  <Input
                    {...field}
                    id="laboratory-form-postal-code"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="00000-000"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      </div>

      <DialogFooter className="mx-0 mb-0 gap-3 px-6 py-4 sm:items-center">
        {formError && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {formError}
          </p>
        )}
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : mode === 'create'
              ? 'Criar laboratório'
              : 'Salvar alterações'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function LaboratoryFormDialog({
  researchGroupId,
  state,
  onOpenChange,
  onSaved,
}: {
  researchGroupId: string
  state: LaboratoryDialogState
  onOpenChange: (open: boolean) => void
  onSaved: (mode: 'create' | 'edit') => void
}) {
  const isOpen = state.open
  const mode = state.open ? state.mode : 'create'
  const laboratory = state.open && state.mode === 'edit' ? state.laboratory : undefined

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="flex max-h-dvh flex-col gap-0 p-0 sm:max-h-[90svh] sm:max-w-2xl"
      >
        <DialogHeader className="relative border-b px-6 py-5 pr-14">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-4 right-4">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">
            {mode === 'create' ? 'Novo laboratório' : 'Editar laboratório'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Cadastre um espaço do grupo onde os itens ficam guardados e os projetos acontecem.'
              : 'Atualize o nome, a descrição, a situação e o endereço deste laboratório.'}
          </DialogDescription>
        </DialogHeader>
        {isOpen && (
          <LaboratoryFormContent
            key={mode === 'edit' && laboratory ? laboratory.id : 'create'}
            researchGroupId={researchGroupId}
            mode={mode}
            initialLaboratory={laboratory}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
