import { queryOptions, useQuery } from '@tanstack/react-query'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { permissionsService } from '@/services/permissions/permissions.service'
import type {
  PermissionAction,
  PermissionResource,
} from '@/types/permissions/permission.types'

export const permissionsKeys = {
  all: ['permissions'] as const,
  mine: (researchGroupId: string) => [...permissionsKeys.all, 'mine', researchGroupId] as const,
}

export function myPermissionsQueryOptions(researchGroupId: string) {
  return queryOptions({
    queryKey: permissionsKeys.mine(researchGroupId),
    queryFn: () => permissionsService.getMine(researchGroupId),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePermissions() {
  const group = useResearchGroup()
  const { data, isPending } = useQuery(myPermissionsQueryOptions(group.id))

  function can(resource: PermissionResource, action: PermissionAction) {
    if (!data) return false
    if (data.fullAccess) return true

    const permission = data.permissions.find((item) => item.resource === resource)
    if (!permission) return false

    switch (action) {
      case 'READ':
        return permission.canRead
      case 'WRITE':
        return permission.canWrite
      case 'DELETE':
        return permission.canDelete
    }
  }

  return {
    can,
    roleName: data?.roleName ?? null,
    fullAccess: data?.fullAccess ?? false,
    isLoading: isPending,
  }
}
