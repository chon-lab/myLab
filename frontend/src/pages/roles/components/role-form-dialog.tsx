import { useState } from 'react'
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { usePermissionCatalogQuery } from '@/queries/roles/roles.queries'
import { actionLabels, resourceLabel } from '@/pages/roles/permission-labels'
import { roleFormSchema, type RoleFormValues } from '@/types/roles/role.schema'
import type { PermissionAction } from '@/types/permissions/permission.types'
import type { Role, RolePermission, SaveRoleRequest } from '@/types/roles/role.types'

type PermissionMatrix = Record<string, { canRead: boolean; canWrite: boolean; canDelete: boolean }>

function toMatrix(role: Role | null): PermissionMatrix {
  const matrix: PermissionMatrix = {}
  for (const permission of role?.permissions ?? []) {
    matrix[permission.resource] = {
      canRead: permission.canRead,
      canWrite: permission.canWrite,
      canDelete: permission.canDelete,
    }
  }
  return matrix
}

function flagFor(matrix: PermissionMatrix, resource: string, action: PermissionAction) {
  const entry = matrix[resource]
  if (!entry) return false
  if (action === 'READ') return entry.canRead
  if (action === 'WRITE') return entry.canWrite
  return entry.canDelete
}

function toPermissions(matrix: PermissionMatrix): RolePermission[] {
  return Object.entries(matrix)
    .filter(([, flags]) => flags.canRead || flags.canWrite || flags.canDelete)
    .map(([resource, flags]) => ({
      resource: resource as RolePermission['resource'],
      canRead: flags.canRead,
      canWrite: flags.canWrite,
      canDelete: flags.canDelete,
    }))
}

export function RoleFormDialog({
  open,
  role,
  onOpenChange,
  onSave,
  isSaving,
}: {
  open: boolean
  role: Role | null
  onOpenChange: (open: boolean) => void
  onSave: (body: SaveRoleRequest) => void
  isSaving: boolean
}) {
  const isEditing = Boolean(role)
  const catalog = usePermissionCatalogQuery()
  const [matrix, setMatrix] = useState<PermissionMatrix>(() => toMatrix(role))
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: role?.name ?? '' },
  })
  const { control, handleSubmit } = form

  function toggle(resource: string, action: PermissionAction, checked: boolean) {
    setMatrix((current) => {
      const entry = current[resource] ?? { canRead: false, canWrite: false, canDelete: false }
      const next = { ...entry }
      if (action === 'READ') next.canRead = checked
      if (action === 'WRITE') next.canWrite = checked
      if (action === 'DELETE') next.canDelete = checked
      if (checked && action !== 'READ') next.canRead = true
      return { ...current, [resource]: next }
    })
  }

  function submit(values: RoleFormValues) {
    onSave({ name: values.name.trim(), permissions: toPermissions(matrix) })
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
            {isEditing ? 'Editar cargo' : 'Novo cargo'}
          </DialogTitle>
          <DialogDescription>
            Defina o nome do cargo e quais ações ele permite em cada recurso do grupo.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
            <Controller name="name" control={control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="role-name">Nome do cargo <span className="text-destructive">*</span></FieldLabel>
                <Input {...field} id="role-name" maxLength={255} aria-invalid={fieldState.invalid} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )} />

            <section aria-labelledby="role-permissions-title">
              <h2 id="role-permissions-title" className="mb-1 text-sm font-bold text-brand-navy">Permissões</h2>
              <p className="mb-3 text-xs text-muted-foreground">
                Marcar Editar ou Excluir habilita Ver automaticamente.
              </p>
              {catalog.isPending ? (
                <p role="status" className="text-sm text-muted-foreground">Carregando recursos…</p>
              ) : catalog.isError || !catalog.data ? (
                <p role="alert" className="text-sm text-destructive">Não foi possível carregar os recursos.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-brand-navy">Recurso</th>
                        {catalog.data.actions.map((action) => (
                          <th key={action} scope="col" className="px-3 py-2 text-center text-xs font-semibold text-brand-navy">
                            {actionLabels[action]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {catalog.data.resources.map((resource) => (
                        <tr key={resource} className="border-t border-border/80">
                          <td className="px-3 py-2 text-foreground">{resourceLabel(resource)}</td>
                          {catalog.data.actions.map((action) => (
                            <td key={action} className="px-3 py-2 text-center">
                              <Checkbox
                                checked={flagFor(matrix, resource, action)}
                                onCheckedChange={(value) => toggle(resource, action, value === true)}
                                aria-label={`${actionLabels[action]} ${resourceLabel(resource)}`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <DialogFooter className="mx-0 mb-0 gap-3 px-5 py-4 sm:px-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando…' : isEditing ? 'Salvar cargo' : 'Criar cargo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
