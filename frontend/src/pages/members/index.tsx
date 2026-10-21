import { useState, type ReactNode } from 'react'
import { CircleCheck, FileText, Pencil, Plus, Search, Trash2, UsersRound } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ApiError } from '@/lib/api-client'
import { useResearchGroup } from '@/components/layout/research-group-context'
import { MemberFormDialog } from '@/pages/members/components/member-form-dialog'
import { MemberDetailsDialog } from '@/pages/members/components/member-details-dialog'
import { RemoveMemberDialog } from '@/pages/members/components/remove-member-dialog'
import { useMembersQuery, useMemberResearchLinesQuery } from '@/queries/members/members.queries'
import type { GroupMemberListItem, MemberRole } from '@/types/members/member.types'

const roleFilters: { value: MemberRole; label: string }[] = [
  { value: 'ADMIN', label: 'Admin do grupo' },
  { value: 'RESPONSIBLE', label: 'Responsáveis' },
  { value: 'STUDENT', label: 'Estudantes' },
  { value: 'PARTNER', label: 'Parceiros' },
]

const roleLabels: Record<MemberRole, string> = {
  ADMIN: 'Admin do grupo',
  RESPONSIBLE: 'Responsável',
  STUDENT: 'Estudante',
  PARTNER: 'Parceiro',
}

function normalizeSearchText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

function cpfDigits(value: string | null) {
  return value?.replace(/\D/g, '') ?? ''
}

function maskCpf(value: string | null) {
  const digits = cpfDigits(value)
  if (digits.length !== 11) return 'Não informado'
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toLocaleUpperCase('pt-BR')
}

function roleBadgeClass(role: MemberRole | null) {
  if (role === 'ADMIN') return 'border-transparent bg-brand-navy text-white'
  if (role === 'RESPONSIBLE') return 'border-transparent bg-primary/10 text-primary'
  if (role === 'STUDENT') return 'border-transparent bg-muted text-foreground'
  if (role === 'PARTNER') return 'border-transparent bg-brand-yellow/35 text-brand-navy'
  return 'border-border bg-background text-muted-foreground'
}

function PageState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="members-title" className="max-w-2xl">
      <h1 id="members-title" className="text-2xl font-bold tracking-tight text-brand-navy">{title}</h1>
      {children}
    </section>
  )
}

function RoleBadge({ role }: { role: MemberRole | null }) {
  return (
    <Badge variant="outline" className={`h-auto rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(role)}`}>
      {role ? roleLabels[role] : 'Perfil não informado'}
    </Badge>
  )
}

function MemberActions({ member, onView, onEdit, onRemove }: {
  member: GroupMemberListItem
  onView: (member: GroupMemberListItem) => void
  onEdit: (member: GroupMemberListItem) => void
  onRemove: (member: GroupMemberListItem) => void
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon-sm" aria-label={`Ver detalhes de ${member.person.name}`} onClick={() => onView(member)}>
        <FileText aria-hidden="true" className="size-5 sm:size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label={`Editar ${member.person.name}`} onClick={() => onEdit(member)}>
        <Pencil aria-hidden="true" className="size-5 sm:size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label={`Remover ${member.person.name} do grupo`} className="text-destructive hover:text-destructive" onClick={() => onRemove(member)}>
        <Trash2 aria-hidden="true" className="size-5 sm:size-4" />
      </Button>
    </div>
  )
}
function MemberMobileCard({ member, lineNames, onView, onEdit, onRemove }: {
  member: GroupMemberListItem
  lineNames: Map<string, string>
  onView: (member: GroupMemberListItem) => void
  onEdit: (member: GroupMemberListItem) => void
  onRemove: (member: GroupMemberListItem) => void
}) {
  const linkedLines = member.membership.researchLineIds
    .map((lineId) => lineNames.get(lineId))
    .filter((name): name is string => Boolean(name))

  return (
    <li className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="bg-brand-yellow/60 text-xs font-bold text-brand-navy">
            {initials(member.person.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold text-brand-navy">
            {member.person.socialName || member.person.name}
            {member.person.socialName && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                nome social
              </span>
            )}
          </p>
        </div>
        <MemberActions member={member} onView={onView} onEdit={onEdit} onRemove={onRemove} />
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Perfil</dt>
          <dd className="mt-1"><RoleBadge role={member.membership.role} /></dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Titulação</dt>
          <dd className="mt-1 break-words text-foreground">{member.person.academicDegree || 'Não informada'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">E-mail</dt>
          <dd className="mt-1 break-all text-foreground">{member.person.email || 'Não informado'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">CPF</dt>
          <dd className="mt-1 text-foreground">{maskCpf(member.person.cpf)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-muted-foreground">Linhas de pesquisa</dt>
          <dd className="mt-1 break-words text-foreground">
            {linkedLines.length ? linkedLines.join(', ') : 'Nenhuma linha vinculada'}
          </dd>
        </div>
      </dl>
    </li>
  )
}

export function MembersPage() {
  const selectedGroup = useResearchGroup()
  const { data: members, isPending, isError, error, refetch } = useMembersQuery(selectedGroup.id)
  const { data: researchLines, isPending: linesPending, isError: linesError, refetch: refetchLines } = useMemberResearchLinesQuery(selectedGroup.id)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'ALL'>('ALL')
  const [lineFilter, setLineFilter] = useState('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<GroupMemberListItem | null>(null)
  const [memberToView, setMemberToView] = useState<GroupMemberListItem | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<GroupMemberListItem | null>(null)
  const [feedback, setFeedback] = useState<'created' | 'updated' | 'removed' | null>(null)

  if (isPending || linesPending) {
    return (
      <PageState title="Membros">
        <p role="status" className="mt-2 text-sm text-muted-foreground">Carregando os membros do grupo…</p>
      </PageState>
    )
  }

  if (isError || linesError || !members || !researchLines) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <PageState title={notFound ? 'Grupo não encontrado' : 'Não foi possível carregar os membros'}>
        <p className="mt-2 text-sm text-muted-foreground">
          {notFound
            ? 'Este grupo de pesquisa pode ter sido removido. Selecione outro grupo no menu lateral.'
            : 'Confira sua conexão e tente carregar os membros novamente.'}
        </p>
        {!notFound && (
          <Button className="mt-6" onClick={() => {
            void refetch()
            void refetchLines()
          }}>
            Tentar novamente
          </Button>
        )}
      </PageState>
    )
  }

  const lineNames = new Map(researchLines.map((line) => [line.id, line.name]))
  const lineCounts = new Map<string, number>()
  const roleCounts = new Map<MemberRole, number>(roleFilters.map(({ value }) => [value, 0]))

  for (const member of members) {
    if (member.membership.role) {
      roleCounts.set(member.membership.role, (roleCounts.get(member.membership.role) ?? 0) + 1)
    }
    for (const lineId of member.membership.researchLineIds) {
      lineCounts.set(lineId, (lineCounts.get(lineId) ?? 0) + 1)
    }
  }

  const filteredMembers = members.filter((member) => {
    const normalizedQuery = normalizeSearchText(searchQuery.trim())
    const matchingRole = roleFilter === 'ALL' || member.membership.role === roleFilter
    const matchingLine = lineFilter === 'ALL' || member.membership.researchLineIds.includes(lineFilter)
    const searchableValues = [
      member.person.name,
      member.person.socialName ?? '',
      member.person.email ?? '',
      cpfDigits(member.person.cpf),
    ]
    const digitsQuery = searchQuery.replace(/\D/g, '')
    const matchingSearch = !normalizedQuery || searchableValues.some((value) =>
      normalizeSearchText(value).includes(normalizedQuery) ||
      (digitsQuery.length > 0 && cpfDigits(value).includes(digitsQuery)),
    )

    return matchingRole && matchingLine && matchingSearch
  })

  const totalLabel = members.length === 1 ? '1 membro ativo' : `${members.length} membros ativos`

  return (
    <section aria-labelledby="members-title" className="min-w-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 id="members-title" className="text-3xl font-bold tracking-tight text-brand-navy">
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">Membros</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Pesquisadores, estudantes e parceiros vinculados ao {selectedGroup.name}.
          </p>
        </div>
        <Button
          size="lg"
          className="h-10 w-full shrink-0 px-4 font-semibold sm:w-auto"
          onClick={() => {
            setSelectedMember(null)
            setFeedback(null)
            setDialogOpen(true)
          }}
        >
          <Plus aria-hidden="true" />
          Novo membro
        </Button>
      </header>

      <div role="status" className="mt-4 empty:hidden">
        {feedback && (
          <p className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {feedback === 'created' && 'Membro cadastrado com sucesso.'}
            {feedback === 'updated' && 'Membro atualizado com sucesso.'}
            {feedback === 'removed' && 'Vínculo removido do grupo.'}
          </p>
        )}
      </div>

      <nav aria-label="Filtrar membros por perfil" className="mt-6 overflow-x-auto border-b border-border">
        <ul className="flex min-w-max items-center gap-1">
          <li>
            <button
              type="button"
              aria-pressed={roleFilter === 'ALL'}
              onClick={() => setRoleFilter('ALL')}
              className={`min-h-10 border-b-2 px-3 text-xs font-semibold transition-colors ${roleFilter === 'ALL' ? 'border-primary text-brand-navy' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              Todos <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem]">{members.length}</span>
            </button>
          </li>
          {roleFilters.map((role) => (
            <li key={role.value}>
              <button
                type="button"
                aria-pressed={roleFilter === role.value}
                onClick={() => setRoleFilter(role.value)}
                className={`min-h-10 border-b-2 px-3 text-xs font-semibold transition-colors ${roleFilter === role.value ? 'border-primary text-brand-navy' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {role.label} <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem]">{roleCounts.get(role.value) ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(16rem,1.4fr)_minmax(12rem,1fr)] sm:items-end">
        <div>
          <label htmlFor="members-search" className="block text-xs font-semibold text-brand-navy">Buscar</label>
          <InputGroup className="mt-1.5 h-10 bg-card">
            <InputGroupAddon align="inline-start" className="pl-3">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="members-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Nome, e-mail ou CPF"
              className="h-full text-sm"
            />
          </InputGroup>
        </div>
        <div>
          <label htmlFor="members-research-line" className="block text-xs font-semibold text-brand-navy">Linha de pesquisa</label>
          <Select value={lineFilter} onValueChange={setLineFilter}>
            <SelectTrigger id="members-research-line" className="mt-1.5 h-10 w-full bg-card">
              <SelectValue placeholder="Todas as linhas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as linhas</SelectItem>
              {researchLines.map((line) => (
                <SelectItem key={line.id} value={line.id}>
                  {line.name}{lineCounts.get(line.id) ? ` (${lineCounts.get(line.id)})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {members.length === 0 ? (
        <section aria-labelledby="members-empty-title" className="mt-5 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <UsersRound aria-hidden="true" className="size-5" />
          </span>
          <h2 id="members-empty-title" className="mt-4 text-base font-bold text-brand-navy">Nenhum membro cadastrado</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Cadastre pessoas para organizar os vínculos e as linhas de pesquisa do grupo.
          </p>
          <Button className="mt-5 font-semibold" onClick={() => {
            setSelectedMember(null)
            setDialogOpen(true)
          }}>
            <Plus aria-hidden="true" />
            Novo membro
          </Button>
        </section>
      ) : filteredMembers.length === 0 ? (
        <section aria-labelledby="members-no-match-title" className="mt-5 rounded-xl border border-border bg-card px-6 py-10 text-center">
          <h2 id="members-no-match-title" className="text-base font-bold text-brand-navy">Nenhum membro encontrado</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {`Não encontramos membros para os filtros selecionados. ${totalLabel}.`}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => {
            setSearchQuery('')
            setRoleFilter('ALL')
            setLineFilter('ALL')
          }}>
            Limpar filtros
          </Button>
        </section>
      ) : (
        <>
          <div className="mt-4 hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <Table className="min-w-[850px]">
              <TableHeader className="bg-muted/60">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-3 text-xs font-semibold text-brand-navy">Nome</TableHead>
                  <TableHead className="px-3 text-xs font-semibold text-brand-navy">Perfil</TableHead>
                  <TableHead className="px-3 text-xs font-semibold text-brand-navy">Titulação</TableHead>
                  <TableHead className="px-3 text-xs font-semibold text-brand-navy">E-mail</TableHead>
                  <TableHead className="px-3 text-xs font-semibold text-brand-navy">CPF</TableHead>
                  <TableHead className="px-3 text-xs font-semibold text-brand-navy">Linhas de pesquisa</TableHead>
                  <TableHead className="w-24 px-3"><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const linkedLines = member.membership.researchLineIds
                    .map((lineId) => lineNames.get(lineId))
                    .filter((name): name is string => Boolean(name))

                  return (
                    <TableRow key={member.membership.id} className="border-border/80">
                      <TableCell className="max-w-56 px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 shrink-0">
                            <AvatarFallback className="bg-brand-yellow/60 text-[0.65rem] font-bold text-brand-navy">
                              {initials(member.person.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-brand-navy">
                              {member.person.socialName || member.person.name}
                              {member.person.socialName && (
                                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold text-primary">
                                  nome social
                                </span>
                              )}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5"><RoleBadge role={member.membership.role} /></TableCell>
                      <TableCell className="px-3 py-2.5 text-xs text-foreground">{member.person.academicDegree || 'Não informada'}</TableCell>
                      <TableCell className="max-w-48 px-3 py-2.5 text-xs text-muted-foreground">
                        <span className="block truncate">{member.person.email || 'Não informado'}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-xs text-foreground">{maskCpf(member.person.cpf)}</TableCell>
                      <TableCell className="max-w-48 px-3 py-2.5 text-xs text-foreground">
                        <span className="block whitespace-normal">{linkedLines.length ? linkedLines.join(', ') : 'Nenhuma linha vinculada'}</span>
                      </TableCell>
                      <TableCell className="px-2 py-2.5">
                        <MemberActions
                          member={member}
                          onView={setMemberToView}
                          onRemove={setMemberToRemove}
                          onEdit={(selected) => {
                            setSelectedMember(selected)
                            setFeedback(null)
                            setDialogOpen(true)
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <ul aria-label="Membros do grupo" className="mt-4 space-y-3 md:hidden">
            {filteredMembers.map((member) => (
              <MemberMobileCard
                key={member.membership.id}
                member={member}
                lineNames={lineNames}
                onView={setMemberToView}
                onRemove={setMemberToRemove}
                onEdit={(selected) => {
                  setSelectedMember(selected)
                  setFeedback(null)
                  setDialogOpen(true)
                }}
              />
            ))}
          </ul>
        </>
      )}

      <MemberFormDialog
        key={dialogOpen ? selectedMember?.membership.id ?? 'new' : 'closed'}
        researchGroupId={selectedGroup.id}
        open={dialogOpen}
        member={selectedMember}
        researchLines={researchLines}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedMember(null)
        }}
        onSaved={(mode) => {
          setDialogOpen(false)
          setSelectedMember(null)
          setFeedback(mode)
        }}
      />
      <MemberDetailsDialog
        member={memberToView}
        lineNames={lineNames}
        onOpenChange={(open) => {
          if (!open) setMemberToView(null)
        }}
      />
      <RemoveMemberDialog
        researchGroupId={selectedGroup.id}
        member={memberToRemove}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null)
        }}
        onRemoved={() => {
          setMemberToRemove(null)
          setFeedback('removed')
        }}
      />
    </section>
  )
}
