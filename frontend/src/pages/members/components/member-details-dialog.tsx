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
import { useMemberDetailsQuery } from '@/queries/members/members.queries'
import type { GroupMemberListItem, MemberRole } from '@/types/members/member.types'

const roleLabels: Record<MemberRole, string> = {
  ADMIN: 'Admin do grupo',
  RESPONSIBLE: 'Responsável',
  STUDENT: 'Estudante',
  PARTNER: 'Parceiro',
}

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
  onOpenChange,
}: {
  member: GroupMemberListItem | null
  lineNames: Map<string, string>
  onOpenChange: (open: boolean) => void
}) {
  const personId = member?.person.id ?? null
  const personQuery = useMemberDetailsQuery(personId)
  const person = personQuery.data ?? member?.person
  const linkedLines = member?.membership.researchLineIds
    .map((lineId) => lineNames.get(lineId))
    .filter((name): name is string => Boolean(name)) ?? []

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
        {!member ? null : personQuery.isPending ? (
          <p role="status" className="px-6 py-5 text-sm text-muted-foreground">Carregando detalhes…</p>
        ) : personQuery.isError ? (
          <div className="space-y-3 px-6 py-5">
            <p role="alert" className="text-sm text-destructive">Não foi possível carregar os detalhes completos desta pessoa.</p>
            <Button variant="outline" onClick={() => void personQuery.refetch()}>Tentar novamente</Button>
          </div>
        ) : person ? (
          <dl className="grid gap-x-6 gap-y-5 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            <Detail label="Nome completo">{person.name}</Detail>
            <Detail label="Nome social">{person.socialName ?? ''}</Detail>
            <Detail label="Perfil no grupo">{member.membership.role ? roleLabels[member.membership.role] : 'Perfil não informado'}</Detail>
            <Detail label="Titulação acadêmica">{person.academicDegree ?? ''}</Detail>
            <Detail label="E-mail">{person.email ?? ''}</Detail>
            <Detail label="Telefone">{person.phone ?? ''}</Detail>
            <Detail label="CPF">{maskCpf(person.cpf)}</Detail>
            <Detail label="Linhas de pesquisa">{linkedLines.length ? linkedLines.join(', ') : 'Nenhuma linha vinculada'}</Detail>
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
