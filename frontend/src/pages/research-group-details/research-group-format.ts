export function formatDate(value: string | null) {
  if (!value) return null

  const [year, month, day] = value.slice(0, 10).split('-')

  return `${day}/${month}/${year}`
}

export function formatPostalCode(value: string | null) {
  if (!value) return null

  return /^\d{8}$/.test(value) ? `${value.slice(0, 5)}-${value.slice(5)}` : value
}

export function joinFilled(values: (string | null | undefined)[], separator = ', ') {
  const filled = values.filter((value): value is string => Boolean(value?.trim()))

  return filled.length > 0 ? filled.join(separator) : null
}

export function toExternalUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

export function withoutProtocol(value: string) {
  return value.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}
