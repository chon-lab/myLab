export type LaboratoryStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'

export type LaboratoryAddress = {
  street: string | null
  number: string | null
  city: string | null
  postalCode: string | null
}

export type Laboratory = {
  id: string
  researchGroupId: string
  name: string
  description: string | null
  status: LaboratoryStatus
  address: LaboratoryAddress | null
  createdAt: string
  updatedAt: string
}

export type LaboratoryAddressRequest = {
  street?: string
  number?: string
  city?: string
  postalCode?: string
}

export type CreateLaboratoryRequest = {
  name: string
  description?: string
  status: LaboratoryStatus
  address?: LaboratoryAddressRequest
}

export type UpdateLaboratoryRequest = {
  name: string
  description?: string
  status: LaboratoryStatus
  address?: LaboratoryAddressRequest
}

export type LaboratoryProjectSummary = {
  id: string
  laboratoryId: string
  name: string
}

export type LaboratoryStockSummary = {
  totalValue: number
  itemCount: number
}

export type LaboratoryMetric<T> =
  | { status: 'pending' }
  | { status: 'error' }
  | { status: 'success'; data: T }

export type LaboratoryMetrics = {
  stockByLaboratoryId: Record<string, LaboratoryMetric<LaboratoryStockSummary>>
  projectCountByLaboratoryId: Record<string, LaboratoryMetric<number>>
  stockError: unknown
  projectsError: unknown
}
