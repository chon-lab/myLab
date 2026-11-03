import { api } from '@/lib/api-client'
import type { MyPermissions } from '@/types/permissions/permission.types'

export const permissionsService = {
  getMine: (researchGroupId: string) =>
    api.get<MyPermissions>(`/api/v1/me/research-groups/${researchGroupId}/permissions`),
}
