import { useState, type ReactNode } from 'react'
import { Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useResearchGroup } from '@/components/layout/research-group-context'
import { publishToast } from '@/lib/api-error-toasts'
import {
  useCreateRoleMutation,
  useRolesQuery,
  useUpdateRoleMutation,
} from '@/queries/roles/roles.queries'
import { DeleteRoleDialog } from '@/pages/roles/components/delete-role-dialog'
import { RoleFormDialog } from '@/pages/roles/components/role-form-dialog'
import { resourceLabel } from '@/pages/roles/permission-labels'
import type { Role, SaveRoleRequest } from '@/types/roles/role.types'

function PageState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="roles-title" className="max-w-2xl">
      <h1 id="roles-title" className="text-2xl font-bold tracking-tight text-brand-navy">{title}</h1>
      {children}
    </section>
  )
}

function permissionsSummary(role: Role) {
  if (role.fullAccess) return 'Acesso total'
  const resources = role.permissions
    .filter((permission) => permission.canRead || permission.canWrite || permission.canDelete)
    .map((permission) => resourceLabel(permission.resource))
  return resources.length ? resources.join(', ') : 'Sem permissões'
}

export function RolesPage() {
  const group = useResearchGroup()
  const { data: roles, isPending, isError, refetch } = useRolesQuery(group.id)
  const createRole = useCreateRoleMutation(group.id)
  const updateRole = useUpdateRoleMutation(group.id)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  if (isPending) {
    return (
      <PageState title="Cargos">
        <p role="status" className="mt-2 text-sm text-muted-foreground">Carregando os cargos do grupo…</p>
      </PageState>
    )
  }

  if (isError || !roles) {
    return (
      <PageState title="Não foi possível carregar os cargos">
        <p className="mt-2 text-sm text-muted-foreground">Confira sua conexão e tente novamente.</p>
        <Button className="mt-6" onClick={() => void refetch()}>Tentar novamente</Button>
      </PageState>
    )
  }

  function openCreate() {
    setSelectedRole(null)
    setDialogOpen(true)
  }

  function openEdit(role: Role) {
    setSelectedRole(role)
    setDialogOpen(true)
  }

  function handleSave(body: SaveRoleRequest) {
    const onSuccess = (mode: 'created' | 'updated') => {
      setDialogOpen(false)
      setSelectedRole(null)
      publishToast({
        kind: 'success',
        title: mode === 'created' ? 'Cargo criado' : 'Cargo atualizado',
        description: mode === 'created' ? 'O novo cargo já pode ser atribuído a membros.' : 'As permissões do cargo foram atualizadas.',
      })
    }

    if (selectedRole) {
      updateRole.mutate({ roleId: selectedRole.id, body }, { onSuccess: () => onSuccess('updated') })
      return
    }
    createRole.mutate(body, { onSuccess: () => onSuccess('created') })
  }

  return (
    <section aria-labelledby="roles-title" className="min-w-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 id="roles-title" className="text-3xl font-bold tracking-tight text-brand-navy">
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">Cargos</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Defina os cargos e as permissões de acesso dos membros do {group.name}.
          </p>
        </div>
        <Button size="lg" className="h-10 w-full shrink-0 px-4 font-semibold sm:w-auto" onClick={openCreate}>
          <Plus aria-hidden="true" />
          Novo cargo
        </Button>
      </header>

      {roles.length === 0 ? (
        <section aria-labelledby="roles-empty-title" className="mt-6 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <h2 id="roles-empty-title" className="mt-4 text-base font-bold text-brand-navy">Nenhum cargo cadastrado</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Crie cargos para controlar o que cada membro pode acessar no grupo.
          </p>
          <Button className="mt-5 font-semibold" onClick={openCreate}>
            <Plus aria-hidden="true" />
            Novo cargo
          </Button>
        </section>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
          <Table className="min-w-[640px]">
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-3 text-xs font-semibold text-brand-navy">Cargo</TableHead>
                <TableHead className="px-3 text-xs font-semibold text-brand-navy">Permissões</TableHead>
                <TableHead className="w-24 px-3"><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} className="border-border/80">
                  <TableCell className="px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                      {role.name}
                      {role.fullAccess && (
                        <Badge variant="outline" className="rounded-full border-transparent bg-brand-navy px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                          Admin
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-xs text-muted-foreground">
                    <span className="block whitespace-normal">{permissionsSummary(role)}</span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${role.name}`}
                        disabled={role.fullAccess}
                        onClick={() => openEdit(role)}
                      >
                        <Pencil aria-hidden="true" className="size-5 sm:size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir ${role.name}`}
                        className="text-destructive hover:text-destructive"
                        disabled={role.fullAccess}
                        onClick={() => setRoleToDelete(role)}
                      >
                        <Trash2 aria-hidden="true" className="size-5 sm:size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RoleFormDialog
        key={dialogOpen ? selectedRole?.id ?? 'new' : 'closed'}
        open={dialogOpen}
        role={selectedRole}
        isSaving={createRole.isPending || updateRole.isPending}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedRole(null)
        }}
        onSave={handleSave}
      />
      <DeleteRoleDialog
        researchGroupId={group.id}
        role={roleToDelete}
        onOpenChange={(open) => {
          if (!open) setRoleToDelete(null)
        }}
        onDeleted={() => {
          setRoleToDelete(null)
          publishToast({ kind: 'success', title: 'Cargo removido', description: 'O cargo foi excluído do grupo.' })
        }}
      />
    </section>
  )
}
