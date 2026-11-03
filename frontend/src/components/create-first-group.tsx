import { type ComponentProps } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, type Control } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-client'
import { useCreateResearchGroupMutation } from '@/queries/research-groups/research-groups.queries'
import {
  createResearchGroupFormSchema,
  toCreateResearchGroupRequest,
  type CreateResearchGroupFormValues,
} from '@/types/research-groups/create-research-group.schema'

export function CreateFirstGroup() {
  const navigate = useNavigate()
  const createGroup = useCreateResearchGroupMutation()

  const { control, handleSubmit } = useForm<CreateResearchGroupFormValues>({
    resolver: zodResolver(createResearchGroupFormSchema),
    defaultValues: {
      cnpqId: '',
      name: '',
      situation: '',
      formationYear: '',
      predominantArea: '',
      institutionName: '',
    },
  })

  function onSubmit(values: CreateResearchGroupFormValues) {
    createGroup.mutate(toCreateResearchGroupRequest(values), {
      onSuccess: (id) => navigate(`/grupos/${id}/painel`),
    })
  }

  const errorMessage =
    createGroup.error instanceof ApiError
      ? createGroup.error.message
      : createGroup.error
        ? 'Não foi possível criar o grupo. Tente novamente.'
        : undefined

  return (
    <div className="grid place-items-center py-6">
      <section aria-labelledby="create-group-title" className="w-full max-w-xl">
        <header className="mb-6 text-center">
          <h1 id="create-group-title" className="text-2xl font-bold tracking-tight">
            Crie seu grupo de pesquisa
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Preencha os dados abaixo para criar um grupo de pesquisa — você entra como
            administrador dele.
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-slate-200 bg-card p-6">
          <FieldGroup className="gap-4">
            <TextField control={control} name="name" label="Nome do grupo" />
            <TextField control={control} name="cnpqId" label="Identificador no CNPq" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={control} name="situation" label="Situação" />
              <TextField
                control={control}
                name="formationYear"
                label="Ano de formação"
                inputMode="numeric"
              />
            </div>
            <TextField control={control} name="predominantArea" label="Área predominante" />
            <TextField control={control} name="institutionName" label="Instituição" />

            {errorMessage && (
              <p role="alert" className="text-sm text-destructive">
                {errorMessage}
              </p>
            )}

            <div className="mt-2 flex justify-end">
              <Button type="submit" disabled={createGroup.isPending}>
                {createGroup.isPending ? 'Criando…' : 'Criar grupo'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </section>
    </div>
  )
}

function TextField({
  control,
  name,
  label,
  ...inputProps
}: {
  control: Control<CreateResearchGroupFormValues>
  name: keyof CreateResearchGroupFormValues
  label: string
} & Omit<ComponentProps<'input'>, 'name'>) {
  const id = `create-group-${name}`

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input {...inputProps} {...field} id={id} aria-invalid={fieldState.invalid} />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
