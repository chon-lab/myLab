import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateMemberMutation,
  useMemberDetailsQuery,
  useUpdateMembershipMutation,
  useUpdatePersonMutation,
} from '@/queries/members/members.queries'
import { memberFormSchema, type MemberFormValues } from '@/types/members/member.schema'
import type { GroupMemberListItem, MemberRole, ResearchLineOption } from '@/types/members/member.types'

const roleOptions: { value: MemberRole; label: string }[] = [
  { value: 'ADMIN', label: 'Admin do grupo' },
  { value: 'RESPONSIBLE', label: 'Responsável' },
  { value: 'STUDENT', label: 'Estudante' },
  { value: 'PARTNER', label: 'Parceiro' },
]

function toFormValues(member?: GroupMemberListItem): MemberFormValues {
  return {
    name: member?.person.name ?? '',
    socialName: member?.person.socialName ?? '',
    email: member?.person.email ?? '',
    phone: member?.person.phone ?? '',
    cpf: member?.person.cpf ?? '',
    academicDegree: member?.person.academicDegree ?? '',
    areasOfExpertiseText: member?.person.areasOfExpertise.join(', ') ?? '',
    role: member?.membership.role ?? '',
    researchLineIds: member?.membership.researchLineIds ?? [],
  }
}

function toNullable(value: string) {
  const normalized = value.trim()
  return normalized || null
}

function toAreasOfExpertise(value: string) {
  return value
    .split(/[,;\n]/)
    .map((area) => area.trim())
    .filter(Boolean)
}

export function MemberFormDialog({
  researchGroupId,
  open,
  member,
  researchLines,
  onOpenChange,
  onSaved,
}: {
  researchGroupId: string
  open: boolean
  member: GroupMemberListItem | null
  researchLines: ResearchLineOption[]
  onOpenChange: (open: boolean) => void
  onSaved: (mode: 'created' | 'updated') => void
}) {
  const isEditing = Boolean(member)
  const personQuery = useMemberDetailsQuery(open && member ? member.person.id : null)
  const createMember = useCreateMemberMutation(researchGroupId)
  const updatePerson = useUpdatePersonMutation(researchGroupId)
  const updateMembership = useUpdateMembershipMutation(researchGroupId)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: toFormValues(member ?? undefined),
  })
  const { control, handleSubmit, reset, formState: { isSubmitting } } = form
  const isSaving = isSubmitting || createMember.isPending || updatePerson.isPending || updateMembership.isPending

  useEffect(() => {
    if (personQuery.data && member) {
      reset(toFormValues({ ...member, person: personQuery.data }))
    }
  }, [member, personQuery.data, reset])

  async function submit(values: MemberFormValues) {
    setFormError(null)
    const personFields = {
      name: values.name.trim(),
      socialName: toNullable(values.socialName),
      email: toNullable(values.email),
      phone: toNullable(values.phone),
      cpf: toNullable(values.cpf),
      academicDegree: toNullable(values.academicDegree),
      areasOfExpertise: toAreasOfExpertise(values.areasOfExpertiseText),
    }

    try {
      if (!member) {
        await createMember.mutateAsync({
          ...personFields,
          role: values.role as MemberRole,
          researchLineIds: values.researchLineIds,
        })
        onSaved('created')
        return
      }

      await updatePerson.mutateAsync({
        personId: member.person.id,
        body: personFields,
      })
      await updateMembership.mutateAsync({
        personId: member.person.id,
        body: {
          ...(values.role ? { role: values.role as MemberRole } : {}),
          researchLineIds: values.researchLineIds,
        },
      })
      onSaved('updated')
    } catch {
      setFormError('Não foi possível salvar o membro. Revise as informações e tente novamente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-dvh flex-col gap-0 p-0 sm:max-h-[90svh] sm:max-w-2xl"
      >
        <DialogHeader className="relative border-b px-5 py-5 pr-14 sm:px-6">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-4 right-4">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">
            {isEditing ? 'Editar membro' : 'Novo membro'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados pessoais e o vínculo com as linhas de pesquisa.'
              : 'Cadastre uma pessoa e defina o vínculo dela com o grupo.'}
          </DialogDescription>
        </DialogHeader>

        {isEditing && personQuery.isPending ? (
          <p role="status" className="px-6 py-8 text-sm text-muted-foreground">
            Carregando os dados do membro…
          </p>
        ) : isEditing && personQuery.isError ? (
          <section className="px-6 py-8" aria-label="Erro ao carregar membro">
            <p className="text-sm text-muted-foreground">Não foi possível carregar os dados desta pessoa.</p>
            <Button variant="outline" className="mt-4" onClick={() => void personQuery.refetch()}>
              Tentar novamente
            </Button>
          </section>
        ) : (
          <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
              <section aria-labelledby="member-personal-data-title">
                <h2 id="member-personal-data-title" className="mb-4 text-sm font-bold text-brand-navy">
                  Dados pessoais
                </h2>
                <FieldGroup className="grid gap-4 sm:grid-cols-2">
                  <Controller name="name" control={control} render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="member-name">Nome completo <span className="text-destructive">*</span></FieldLabel>
                      <Input {...field} id="member-name" maxLength={255} aria-invalid={fieldState.invalid} />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )} />
                  <Controller name="socialName" control={control} render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="member-social-name">Nome social</FieldLabel>
                      <Input {...field} id="member-social-name" maxLength={255} aria-invalid={fieldState.invalid} />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )} />
                  <Controller name="cpf" control={control} render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="member-cpf">CPF</FieldLabel>
                      <Input {...field} id="member-cpf" inputMode="numeric" maxLength={14} aria-invalid={fieldState.invalid} />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )} />
                  <Controller name="academicDegree" control={control} render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="member-degree">Titulação acadêmica</FieldLabel>
                      <Input {...field} id="member-degree" maxLength={100} aria-invalid={fieldState.invalid} />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )} />
                </FieldGroup>
              </section>

              <section aria-labelledby="member-contact-title" className="border-t pt-5">
                <h2 id="member-contact-title" className="mb-4 text-sm font-bold text-brand-navy">Contato</h2>
                <FieldGroup className="grid gap-4 sm:grid-cols-2">
                  <Controller name="email" control={control} render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="member-email">E-mail</FieldLabel>
                      <Input {...field} id="member-email" type="email" maxLength={254} aria-invalid={fieldState.invalid} />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )} />
                  <Controller name="phone" control={control} render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="member-phone">Telefone</FieldLabel>
                      <Input {...field} id="member-phone" type="tel" maxLength={30} aria-invalid={fieldState.invalid} />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )} />
                </FieldGroup>
              </section>

              <section aria-labelledby="member-role-title" className="border-t pt-5">
                <h2 id="member-role-title" className="mb-4 text-sm font-bold text-brand-navy">Vínculo com o grupo</h2>
                <Controller name="role" control={control} render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="member-role-trigger">Perfil do vínculo</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="member-role-trigger" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.value === 'PARTNER' && (
                      <FieldDescription>O CPF é obrigatório para parceiros.</FieldDescription>
                    )}
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )} />
              </section>

              <section aria-labelledby="member-research-lines-title" className="border-t pt-5">
                <h2 id="member-research-lines-title" className="text-sm font-bold text-brand-navy">
                  Linhas de pesquisa
                </h2>
                <Controller name="researchLineIds" control={control} render={({ field }) => (
                  <fieldset className="mt-3 space-y-2">
                    <legend className="sr-only">Linhas de pesquisa vinculadas</legend>
                    {researchLines.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma linha de pesquisa cadastrada para este grupo.</p>
                    ) : researchLines.map((line) => {
                      const checked = field.value.includes(line.id)
                      return (
                        <label key={line.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted/40">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => field.onChange(
                              value
                                ? [...field.value, line.id]
                                : field.value.filter((id) => id !== line.id),
                            )}
                            aria-label={line.name}
                            className="mt-0.5"
                          />
                          <span className="min-w-0">
                            <span className="block font-medium text-brand-navy">{line.name}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{line.objective}</span>
                          </span>
                        </label>
                      )
                    })}
                  </fieldset>
                )} />
              </section>

              <section aria-labelledby="member-expertise-title" className="border-t pt-5">
                <h2 id="member-expertise-title" className="mb-3 text-sm font-bold text-brand-navy">Áreas de atuação</h2>
                <Controller name="areasOfExpertiseText" control={control} render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="member-expertise">Áreas de atuação</FieldLabel>
                    <Input {...field} id="member-expertise" placeholder="Ex.: Química Analítica, Eletroquímica" aria-invalid={fieldState.invalid} />
                    <FieldDescription>Separe as áreas por vírgula ou ponto e vírgula.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )} />
              </section>
            </div>

            <DialogFooter className="mx-0 mb-0 gap-3 px-5 py-4 sm:px-6">
              {formError && <p role="alert" className="mr-auto text-sm text-destructive">{formError}</p>}
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSaving}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando…' : isEditing ? 'Salvar membro' : 'Cadastrar membro'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
