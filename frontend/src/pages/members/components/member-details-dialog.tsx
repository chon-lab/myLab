import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { GroupMemberListItem } from '@/types/members/member.types'

function maskCpf(value: string | null) {
  const digits = value?.replace(/\D/g, '') ?? ''
  if (digits.length !== 11) return 'Não informado'
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`
}

function Detail({ label, children }: { label: string; children: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm text-foreground">{children || 'Não informado'}</dd>
    </div>
  )
}

export function MemberDetailsDialog({
  member,
  lineNames,
  roleNames,
  onOpenChange,
}: {
  member: GroupMemberListItem | null
  lineNames: Map<string, string>
  roleNames: Map<string, string>
  onOpenChange: (open: boolean) => void
}) {
  const person = member?.person
  const linkedLines = member?.membership.researchLineIds
    .map((lineId) => lineNames.get(lineId))
    .filter((name): name is string => Boolean(name)) ?? []
  const roleId = member?.membership.roleId
  const roleName = roleId ? roleNames.get(roleId) ?? 'Cargo não encontrado' : 'Sem cargo'
  const statusLabel = member?.membership.status === 'PENDING' ? 'Convite pendente' : 'Ativo'

  return (
    <Dialog open={Boolean(member)} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="flex max-h-dvh flex-col gap-0 p-0 sm:max-h-[90svh] sm:max-w-xl">
        <DialogHeader className="relative border-b px-6 py-5 pr-14">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-4 right-4">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Detalhes do membro</DialogTitle>
          <DialogDescription>Dados pessoais e vínculo com o grupo.</DialogDescription>
        </DialogHeader>
        {person ? (
          <dl className="grid gap-x-6 gap-y-5 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            <Detail label="Nome completo">{person.name}</Detail>
            <Detail label="Nome social">{person.socialName ?? ''}</Detail>
            <Detail label="Cargo">{roleName}</Detail>
            <Detail label="Situação do vínculo">{statusLabel}</Detail>
            <Detail label="Titulação acadêmica">{person.academicDegree ?? ''}</Detail>
            <Detail label="E-mail">{person.email ?? ''}</Detail>
            <Detail label="Telefone">{person.phone ?? ''}</Detail>
            <Detail label="CPF">{maskCpf(person.cpf)}</Detail>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">Linhas de pesquisa</dt>
              <dd className="mt-1 break-words text-sm text-foreground">
                {linkedLines.length ? linkedLines.join(', ') : 'Nenhuma linha vinculada'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">Áreas de atuação</dt>
              <dd className="mt-1 break-words text-sm text-foreground">
                {person.areasOfExpertise.length ? person.areasOfExpertise.join(', ') : 'Não informadas'}
              </dd>
            </div>
          </dl>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
