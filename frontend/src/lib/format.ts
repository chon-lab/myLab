import { unitOfMeasureSymbols, type InventoryUnitOfMeasure } from '@/types/inventory/inventory.types'

const currencyFormatter =new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const quantityFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 })

const dateFormatter = new Intl.DateTimeFormat('pt-BR')

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatQuantity(value: number) {
  return quantityFormatter.format(value)
}

export function formatIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

export function pluralize(count: number, singular: string, plural: string) {
  return `${formatQuantity(count)} ${count === 1 ? singular : plural}`
}

export function formatStockQuantity(quantity: number, unit: InventoryUnitOfMeasure) {
  if (unit === 'UN') return pluralize(quantity, 'unidade', 'unidades')
  if (unit === 'CX') return pluralize(quantity, 'caixa', 'caixas')
  if (unit === 'KIT') return pluralize(quantity, 'kit', 'kits')
  return `${formatQuantity(quantity)} ${unitOfMeasureSymbols[unit]}`
}
