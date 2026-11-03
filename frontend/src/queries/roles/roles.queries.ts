import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { permissionsKeys } from '@/queries/permissions/permissions.queries'
import { rolesService } from '@/services/roles/roles.service'
import type { SaveRoleRequest } from '@/types/roles/role.types'

export const rolesKeys = {
  all: ['roles'] as const,
  listByGroup: (researchGroupId: string) => [...rolesKeys.all, 'list', researchGroupId] as const,
  catalog: () => [...rolesKeys.all, 'catalog'] as const,
}

export const rolesByGroupQueryOptions = (researchGroupId: string) =>
  queryOptions({
    queryKey: rolesKeys.listByGroup(researchGroupId),
    queryFn: () => rolesService.listByGroup(researchGroupId),
  })

export const permissionCatalogQueryOptions = () =>
  queryOptions({
    queryKey: rolesKeys.catalog(),
    queryFn: () => rolesService.getCatalog(),
    staleTime: 60 * 60 * 1000,
  })

export function useRolesQuery(researchGroupId: string) {
  return useQuery(rolesByGroupQueryOptions(researchGroupId))
}

export function usePermissionCatalogQuery() {
  return useQuery(permissionCatalogQueryOptions())
}

function useInvalidateRoles(researchGroupId: string) {
  const queryClient = useQueryClient()

  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: rolesKeys.listByGroup(researchGroupId) }),
    queryClient.invalidateQueries({ queryKey: permissionsKeys.mine(researchGroupId) }),
  ])
}

export function useCreateRoleMutation(researchGroupId: string) {
  const invalidate = useInvalidateRoles(researchGroupId)

  return useMutation({
    mutationFn: (body: SaveRoleRequest) => rolesService.create(researchGroupId, body),
    onSuccess: invalidate,
  })
}

export function useUpdateRoleMutation(researchGroupId: string) {
  const invalidate = useInvalidateRoles(researchGroupId)

  return useMutation({
    mutationFn: ({ roleId, body }: { roleId: string; body: SaveRoleRequest }) =>
      rolesService.update(researchGroupId, roleId, body),
    onSuccess: invalidate,
  })
}

export function useDeleteRoleMutation(researchGroupId: string) {
  const invalidate = useInvalidateRoles(researchGroupId)

  return useMutation({
    mutationFn: (roleId: string) => rolesService.remove(researchGroupId, roleId),
    onSuccess: invalidate,
  })
}
