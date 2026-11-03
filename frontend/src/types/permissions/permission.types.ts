export type PermissionResource =
  | 'RESEARCH_GROUP'
  | 'RESEARCH_LINE'
  | 'MEMBER'
  | 'ROLE'
  | 'LABORATORY'
  | 'PROJECT'
  | 'INVENTORY_ITEM'
  | 'INVENTORY_ENTRY'
  | 'INVENTORY_EXIT'
  | 'INVENTORY_TRANSFER'
  | 'INVENTORY_STOCK'

export type PermissionAction = 'READ' | 'WRITE' | 'DELETE'

export type ResourcePermission = {
  resource: PermissionResource
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}

export type MyPermissions = {
  researchGroupId: string
  roleName: string | null
  fullAccess: boolean
  permissions: ResourcePermission[]
}
