import { Bell } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import {
  useAcceptInvitationMutation,
  useMyInvitationsQuery,
  useRejectInvitationMutation,
} from '@/queries/invitations/invitations.queries'
import type { Invitation } from '@/types/invitations/invitation.types'

function InvitationRow({ invitation }: { invitation: Invitation }) {
  const accept = useAcceptInvitationMutation()
  const reject = useRejectInvitationMutation()
  const isBusy = accept.isPending || reject.isPending

  function onAccept() {
    accept.mutate(invitation.membershipId, {
      onSuccess: () => publishToast({
        kind: 'success',
        title: 'Convite aceito',
        description: `Você entrou no grupo ${invitation.researchGroupName ?? ''}.`.trim(),
      }),
      onError: publishApiErrorToast,
    })
  }

  function onReject() {
    reject.mutate(invitation.membershipId, {
      onSuccess: () => publishToast({ kind: 'success', title: 'Convite recusado', description: 'O convite foi recusado.' }),
      onError: publishApiErrorToast,
    })
  }

  return (
    <li className="px-3 py-3">
      <p className="text-sm font-semibold text-brand-navy">{invitation.researchGroupName ?? 'Grupo de pesquisa'}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Convite como <span className="font-medium text-foreground">{invitation.roleName ?? 'membro'}</span>
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <Button size="sm" className="h-8 px-3" disabled={isBusy} onClick={onAccept}>
          {accept.isPending ? 'Aceitando…' : 'Aceitar'}
        </Button>
        <Button size="sm" variant="outline" className="h-8 px-3" disabled={isBusy} onClick={onReject}>
          Recusar
        </Button>
      </div>
    </li>
  )
}

export function NotificationsBell() {
  const { data: invitations } = useMyInvitationsQuery()
  const pendingCount = invitations?.length ?? 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={pendingCount > 0 ? `Notificações: ${pendingCount} convite(s) pendente(s)` : 'Notificações'}
          className="relative size-10 text-slate-500"
        >
          <Bell aria-hidden="true" className="size-5" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[0.6rem] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-3 py-2.5">Convites de grupos</DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        {pendingCount === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhum convite pendente.</p>
        ) : (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {invitations?.map((invitation) => (
              <InvitationRow key={invitation.membershipId} invitation={invitation} />
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
