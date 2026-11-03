import { useEffect, useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useAssignablePeopleQuery,
  useInviteMemberMutation,
  useUpdateMembershipMutation,
} from '@/queries/members/members.queries'
import type {
  AssignablePerson,
  GroupMemberListItem,
  ResearchLineOption,
} from '@/types/members/member.types'
import type { Role } from '@/types/roles/role.types'

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timeout)
  }, [value, delay])

  return debounced
}

function PersonSearch({
  researchGroupId,
  open,
  selectedPerson,
  onSelect,
}: {
  researchGroupId: string
  open: boolean
  selectedPerson: AssignablePerson | null
  onSelect: (person: AssignablePerson | null) => void
}) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const { data: people, isFetching } = useAssignablePeopleQuery(
    researchGroupId,
    debouncedSearch,
    open && !selectedPerson,
  )

  if (selectedPerson) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-brand-navy">{selectedPerson.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{selectedPerson.email || 'Sem e-mail'}</span>
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
          Trocar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <InputGroup className="h-10 bg-card">
        <InputGroupAddon align="inline-start" className="pl-3">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className="h-full text-sm"
          aria-label="Buscar usuário existente"
        />
      </InputGroup>
      <ul className="max-h-56 space-y-1 overflow-y-auto" aria-label="Usuários encontrados">
        {isFetching ? (
          <li className="px-1 py-2 text-sm text-muted-foreground">Buscando…</li>
        ) : !people || people.length === 0 ? (
          <li className="px-1 py-2 text-sm text-muted-foreground">
            Nenhum usuário disponível encontrado. Usuários aparecem aqui após o primeiro acesso ao sistema.
          </li>
        ) : (
          people.map((person) => (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => onSelect(person)}
                className="flex w-full items-start gap-3 rounded-lg border border-border px-3 py-2.5 text-left text-sm hover:bg-muted/40"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-brand-navy">{person.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{person.email || 'Sem e-mail'}</span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export function MemberFormDialog({
  researchGroupId,
  open,
  member,
  researchLines,
  roles,
  onOpenChange,
  onSaved,
}: {
  researchGroupId: string
  open: boolean
  member: GroupMemberListItem | null
  researchLines: ResearchLineOption[]
  roles: Role[]
  onOpenChange: (open: boolean) => void
  onSaved: (mode: 'invited' | 'updated') => void
}) {
  const isEditing = Boolean(member)
  const inviteMember = useInviteMemberMutation(researchGroupId)
  const updateMembership = useUpdateMembershipMutation(researchGroupId)
  const [selectedPerson, setSelectedPerson] = useState<AssignablePerson | null>(null)
  const [roleId, setRoleId] = useState(member?.membership.roleId ?? '')
  const [researchLineIds, setResearchLineIds] = useState<string[]>(member?.membership.researchLineIds ?? [])
  const [formError, setFormError] = useState<string | null>(null)

  const assignableRoles = useMemo(() => roles.filter((role) => !role.fullAccess), [roles])
  const isSaving = inviteMember.isPending || updateMembership.isPending
  const canSubmit = Boolean(roleId) && (isEditing || Boolean(selectedPerson))

  async function submit() {
    setFormError(null)
    if (!roleId) {
      setFormError('Selecione um cargo para o membro.')
      return
    }

    try {
      if (isEditing && member) {
        await updateMembership.mutateAsync({
          personId: member.person.id,
          body: { roleId, researchLineIds },
        })
        onSaved('updated')
        return
      }

      if (!selectedPerson) {
        setFormError('Selecione um usuário existente para convidar.')
        return
      }

      await inviteMember.mutateAsync({ personId: selectedPerson.id, roleId, researchLineIds })
      onSaved('invited')
    } catch {
      setFormError('Não foi possível salvar. Revise as informações e tente novamente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-dvh flex-col gap-0 p-0 sm:max-h-[90svh] sm:max-w-xl"
      >
        <DialogHeader className="relative border-b px-5 py-5 pr-14 sm:px-6">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-4 right-4">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">
            {isEditing ? 'Editar vínculo' : 'Convidar membro'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere o cargo e as linhas de pesquisa vinculadas a este membro.'
              : 'Convide um usuário existente para o grupo. Ele receberá o convite e precisará aceitá-lo.'}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
            <section aria-labelledby="member-person-title">
              <h2 id="member-person-title" className="mb-3 text-sm font-bold text-brand-navy">Usuário</h2>
              {isEditing && member ? (
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                  <span className="block text-sm font-semibold text-brand-navy">
                    {member.person.socialName || member.person.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {member.person.email || 'Sem e-mail'}
                  </span>
                </div>
              ) : (
                <PersonSearch
                  researchGroupId={researchGroupId}
                  open={open}
                  selectedPerson={selectedPerson}
                  onSelect={setSelectedPerson}
                />
              )}
            </section>

            <section aria-labelledby="member-role-title" className="border-t pt-5">
              <h2 id="member-role-title" className="mb-3 text-sm font-bold text-brand-navy">Cargo</h2>
              {assignableRoles.length === 0 ? (
                <p role="alert" className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                  Não há cargos existentes neste grupo. Crie um cargo em Cargos antes de convidar membros.
                </p>
              ) : (
                <Select value={roleId} onValueChange={setRoleId}>
                  <SelectTrigger id="member-role-trigger" className="h-10 w-full" aria-label="Cargo">
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </section>

            <section aria-labelledby="member-lines-title" className="border-t pt-5">
              <h2 id="member-lines-title" className="text-sm font-bold text-brand-navy">Linhas de pesquisa</h2>
              <fieldset className="mt-3 space-y-2">
                <legend className="sr-only">Linhas de pesquisa vinculadas</legend>
                {researchLines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma linha de pesquisa cadastrada para este grupo.</p>
                ) : researchLines.map((line) => {
                  const checked = researchLineIds.includes(line.id)
                  return (
                    <label key={line.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted/40">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => setResearchLineIds((current) =>
                          value === true
                            ? [...current, line.id]
                            : current.filter((id) => id !== line.id),
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
            </section>
          </div>

          <DialogFooter className="mx-0 mb-0 gap-3 px-5 py-4 sm:px-6">
            {formError && <p role="alert" className="mr-auto text-sm text-destructive">{formError}</p>}
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving || !canSubmit}>
              {isSaving ? 'Salvando…' : isEditing ? 'Salvar vínculo' : (
                <span className="inline-flex items-center gap-1.5">
                  <Check aria-hidden="true" className="size-4" />
                  Enviar convite
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
