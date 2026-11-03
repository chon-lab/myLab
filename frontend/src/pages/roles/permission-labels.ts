import type { PermissionAction, PermissionResource } from '@/types/permissions/permission.types'

export const resourceLabels: Record<PermissionResource, string> = {
  RESEARCH_GROUP: 'Grupo de pesquisa',
  RESEARCH_LINE: 'Linhas de pesquisa',
  MEMBER: 'Membros',
  ROLE: 'Cargos',
  LABORATORY: 'Laboratórios',
  PROJECT: 'Projetos',
  INVENTORY_ITEM: 'Itens de estoque',
  INVENTORY_ENTRY: 'Entradas de estoque',
  INVENTORY_EXIT: 'Saídas de estoque',
  INVENTORY_TRANSFER: 'Transferências de estoque',
  INVENTORY_STOCK: 'Saldo de estoque',
}

export const actionLabels: Record<PermissionAction, string> = {
  READ: 'Ver',
  WRITE: 'Editar',
  DELETE: 'Excluir',
}

export function resourceLabel(resource: string) {
  return resourceLabels[resource as PermissionResource] ?? resource
}
