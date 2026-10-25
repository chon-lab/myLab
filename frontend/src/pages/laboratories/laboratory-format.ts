import type { LaboratoryAddress, LaboratoryStatus } from '@/types/laboratories/laboratory.types'

export const laboratoryStatusLabels: Record<LaboratoryStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  MAINTENANCE: 'Em manutenção',
}

export const laboratoryStatusBadgeClasses: Record<LaboratoryStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-800',
  INACTIVE: 'bg-slate-100 text-muted-foreground',
  MAINTENANCE: 'bg-amber-50 text-amber-800',
}

export const laboratoryStatusDotClasses: Record<LaboratoryStatus, string> = {
  ACTIVE: 'bg-emerald-600',
  INACTIVE: 'bg-muted-foreground',
  MAINTENANCE: 'bg-amber-600',
}

const ignoredInitialWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

export function getLaboratoryInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word && !ignoredInitialWords.has(word.toLocaleLowerCase('pt-BR')))

  const initials = words.map((word) => word[0]).join('').slice(0, 3)
  return initials.toLocaleUpperCase('pt-BR') || 'LAB'
}

function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : value
}

export function formatLaboratoryAddress(address: LaboratoryAddress | null) {
  if (!address) return null

  const streetLine = [address.street, address.number].filter(Boolean).join(', ')
  const parts = [
    streetLine,
    address.city,
    address.postalCode ? `CEP ${formatPostalCode(address.postalCode)}` : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : null
}
