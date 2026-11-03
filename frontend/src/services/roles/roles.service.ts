import { api } from '@/lib/api-client'
import type { PermissionCatalog, Role, SaveRoleRequest } from '@/types/roles/role.types'

export const rolesService = {
  listByGroup: (researchGroupId: string) =>
    api.get<Role[]>(`/api/v1/research-groups/${researchGroupId}/roles`),
  create: (researchGroupId: string, body: SaveRoleRequest) =>
    api.post<string | undefined>(`/api/v1/research-groups/${researchGroupId}/roles`, body),
  update: (researchGroupId: string, roleId: string, body: SaveRoleRequest) =>
    api.put<void>(`/api/v1/research-groups/${researchGroupId}/roles/${roleId}`, body),
  remove: (researchGroupId: string, roleId: string) =>
    api.delete<void>(`/api/v1/research-groups/${researchGroupId}/roles/${roleId}`),
  getCatalog: () => api.get<PermissionCatalog>('/api/v1/permissions/catalog'),
}
