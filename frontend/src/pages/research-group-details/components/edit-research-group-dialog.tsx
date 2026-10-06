import { useEffect, useState, type ComponentProps } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, X } from 'lucide-react'
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldPath,
  type FieldPathValue,
} from 'react-hook-form'

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
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api-client'
import { useUpdateResearchGroupMutation } from '@/queries/research-groups/research-groups.queries'
import {
  emptyContact,
  researchGroupFormSchema,
  toFormFieldPath,
  toResearchGroupFormValues,
  toUpdateResearchGroupRequest,
  type ResearchGroupFormValues,
} from '@/types/research-groups/research-group.schema'
import type { ResearchGroup } from '@/types/research-groups/research-group.types'

type FormPath = FieldPath<ResearchGroupFormValues>
type TextFieldPath = {
  [Path in FormPath]: FieldPathValue<ResearchGroupFormValues, Path> extends string ? Path : never
}[FormPath]

export type EditDialogIntent = { mode: 'edit'; focusField?: TextFieldPath } | { mode: 'add-contact' }

function saveErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'Não foi possível salvar as alterações. Tente novamente.'
  if (error.status === 404) return 'Este grupo não foi encontrado. Ele pode ter sido removido.'
  if (error.status === 409) return 'Os dados informados conflitam com informações já cadastradas.'
  if (error.status === 400 && Object.keys(error.fieldErrors).length > 0) {
    return 'Revise os campos destacados e tente novamente.'
  }
  if (error.status === 400) return 'O servidor recusou os dados informados. Revise os campos e tente novamente.'
  return 'Não foi possível salvar as alterações. Tente novamente.'
}

function TextField({
  control,
  name,
  label,
  description,
  className,
  ...inputProps
}: {
  control: Control<ResearchGroupFormValues>
  name: TextFieldPath
  label: string
  description?: string
  className?: string
} & Omit<ComponentProps<'input'>, 'name' | 'className'>) {
  const id = `group-form-${name.replaceAll('.', '-')}`

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input {...inputProps} {...field} id={id} aria-invalid={fieldState.invalid} />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

function EditResearchGroupForm({
  group,
  intent,
  onSaved,
}: {
  group: ResearchGroup
  intent: EditDialogIntent
  onSaved: () => void
}) {
  const initialValues = toResearchGroupFormValues(group)
  const { control, handleSubmit, setError, setFocus } = useForm<ResearchGroupFormValues>({
    resolver: zodResolver(researchGroupFormSchema),
    defaultValues:
      intent.mode === 'add-contact'
        ? { ...initialValues, contacts: [...initialValues.contacts, emptyContact] }
        : initialValues,
  })
  const contacts = useFieldArray({ control, name: 'contacts' })
  const updateGroup = useUpdateResearchGroupMutation(group.id)
  const [formError, setFormError] = useState<string | null>(null)
  const initialFocus: TextFieldPath =
    intent.mode === 'add-contact'
      ? `contacts.${initialValues.contacts.length}.phone`
      : (intent.focusField ?? 'name')

  useEffect(() => {
    setFocus(initialFocus)
  }, [initialFocus, setFocus])

  function submit(values: ResearchGroupFormValues) {
    setFormError(null)
    updateGroup.mutate(toUpdateResearchGroupRequest(values, group), {
      onSuccess: onSaved,
      onError: (error) => {
        if (error instanceof ApiError) {
          Object.entries(error.fieldErrors).forEach(([apiField, message]) =>
            setError(toFormFieldPath(apiField) as FormPath, { type: 'server', message }),
          )
        }
        setFormError(saveErrorMessage(error))
      },
    })
  }

  function addContact() {
    contacts.append(emptyContact, { focusName: `contacts.${contacts.fields.length}.phone` })
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-5">
        <FieldSet>
          <FieldLegend>Identificação</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="name" label="Nome do grupo" className="sm:col-span-2" />
            <Field>
              <FieldLabel htmlFor="group-form-cnpq-id">Código no CNPq</FieldLabel>
              <Input
                id="group-form-cnpq-id"
                value={group.cnpqId}
                readOnly
                aria-describedby="group-form-cnpq-id-description"
                className="bg-muted text-muted-foreground"
              />
              <FieldDescription id="group-form-cnpq-id-description">
                Identificador do DGP; não pode ser alterado.
              </FieldDescription>
            </Field>
            <TextField control={control} name="situation" label="Situação" />
            <TextField
              control={control}
              name="formationYear"
              label="Ano de formação"
              inputMode="numeric"
              maxLength={4}
            />
            <TextField control={control} name="predominantArea" label="Área predominante" />
            <TextField control={control} name="institutionName" label="Instituição" />
            <TextField control={control} name="institutionUnit" label="Unidade" />
            <TextField
              control={control}
              name="sourceUrl"
              label="Espelho do grupo"
              type="url"
              placeholder="dgp.cnpq.br/dgp/espelhogrupo/..."
              className="sm:col-span-2"
            />
            <Controller
              name="repercussions"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                  <FieldLabel htmlFor="group-form-repercussions">Repercussões</FieldLabel>
                  <Textarea
                    {...field}
                    id="group-form-repercussions"
                    rows={4}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Endereço</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-6">
            <TextField control={control} name="address.street" label="Rua" className="sm:col-span-4" />
            <TextField control={control} name="address.number" label="Número" className="sm:col-span-2" />
            <TextField
              control={control}
              name="address.complement"
              label="Complemento"
              className="sm:col-span-3"
            />
            <TextField
              control={control}
              name="address.neighborhood"
              label="Bairro"
              className="sm:col-span-3"
            />
            <TextField control={control} name="address.city" label="Cidade" className="sm:col-span-4" />
            <TextField
              control={control}
              name="address.state"
              label="UF"
              maxLength={2}
              autoCapitalize="characters"
              className="sm:col-span-2"
            />
            <TextField
              control={control}
              name="address.postalCode"
              label="CEP"
              inputMode="numeric"
              placeholder="00000-000"
              maxLength={9}
              className="sm:col-span-3"
            />
            <TextField
              control={control}
              name="address.postOfficeBox"
              label="Caixa postal"
              className="sm:col-span-3"
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <div className="flex items-center justify-between gap-4">
            <FieldLegend className="mb-0">Contatos</FieldLegend>
            <Button type="button" variant="outline" size="sm" onClick={addContact}>
              <Plus aria-hidden="true" />
              Adicionar contato
            </Button>
          </div>
          {contacts.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum contato cadastrado.</p>
          ) : (
            <ol className="space-y-4">
              {contacts.fields.map((contact, index) => (
                <li key={contact.id} className="rounded-lg border border-slate-200 p-4">
                  <FieldSet>
                    <div className="flex items-center justify-between gap-4">
                      <FieldLegend variant="label" className="mb-0">
                        Contato {index + 1}
                      </FieldLegend>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover contato ${index + 1}`}
                        onClick={() => contacts.remove(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                      <TextField
                        control={control}
                        name={`contacts.${index}.phone`}
                        label="Telefone"
                        type="tel"
                        autoComplete="off"
                      />
                      <TextField
                        control={control}
                        name={`contacts.${index}.email`}
                        label="E-mail"
                        type="email"
                        autoComplete="off"
                      />
                      <TextField
                        control={control}
                        name={`contacts.${index}.website`}
                        label="Site"
                        type="url"
                        autoComplete="off"
                      />
                      <TextField
                        control={control}
                        name={`contacts.${index}.fax`}
                        label="Fax"
                        type="tel"
                        autoComplete="off"
                      />
                    </FieldGroup>
                  </FieldSet>
                </li>
              ))}
            </ol>
          )}
        </FieldSet>
      </div>

      <DialogFooter className="mx-0 mb-0 gap-3 px-6 py-4 sm:items-center">
        {formError && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {formError}
          </p>
        )}
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={updateGroup.isPending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={updateGroup.isPending}>
          {updateGroup.isPending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function EditResearchGroupDialog({
  group,
  open,
  intent,
  onOpenChange,
  onSaved,
}: {
  group: ResearchGroup
  open: boolean
  intent: EditDialogIntent
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="flex max-h-[90svh] flex-col gap-0 p-0 sm:max-w-3xl"
      >
        <DialogHeader className="relative border-b px-6 py-5 pr-14">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-4 right-4">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Editar dados do grupo</DialogTitle>
          <DialogDescription>
            Atualize identificação, endereço e contatos. O código no CNPq não pode ser alterado.
          </DialogDescription>
        </DialogHeader>
        <EditResearchGroupForm group={group} intent={intent} onSaved={onSaved} />
      </DialogContent>
    </Dialog>
  )
}
