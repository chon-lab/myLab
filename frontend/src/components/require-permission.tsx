import type { ReactNode } from 'react'

import { usePermissions } from '@/queries/permissions/permissions.queries'
import type { PermissionResource } from '@/types/permissions/permission.types'

export function RequirePermission({
  resource,
  children,
}: {
  resource: PermissionResource
  children: ReactNode
}) {
  const { can, isLoading } = usePermissions()

  if (isLoading) {
    return (
      <main className="grid min-h-[50vh] place-items-center">
        <p role="status" className="text-sm text-muted-foreground">
          Carregando…
        </p>
      </main>
    )
  }

  if (!can(resource, 'READ')) {
    return (
      <section aria-labelledby="forbidden-title" className="mx-auto max-w-md py-16 text-center">
        <h1 id="forbidden-title" className="text-2xl font-bold tracking-tight">
          Sem permissão
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Seu cargo neste grupo de pesquisa não permite acessar esta tela. Fale com um administrador
          do grupo.
        </p>
      </section>
    )
  }

  return <>{children}</>
}
