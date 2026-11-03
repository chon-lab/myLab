import type { PermissionAction, PermissionResource } from '@/types/permissions/permission.types'

export type RolePermission = {
  resource: PermissionResource
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}

export type Role = {
  id: string
  researchGroupId: string
  name: string
  fullAccess: boolean
  permissions: RolePermission[]
  createdAt: string
  updatedAt: string
}

export type PermissionCatalog = {
  resources: PermissionResource[]
  actions: PermissionAction[]
}

export type SaveRoleRequest = {
  name: string
  permissions: RolePermission[]
}
