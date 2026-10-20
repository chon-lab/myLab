export type AppToast = {
  id: number
  kind: 'error' | 'success' | 'info'
  title: string
  description: string
}

type AppToastListener = (toast: AppToast) => void

const listeners = new Set<AppToastListener>()
let nextToastId = 0

export function subscribeApiErrorToasts(listener: AppToastListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function publishApiErrorToast(error: unknown) {
  const fieldErrors =
    typeof error === 'object' && error !== null && 'fieldErrors' in error &&
    typeof error.fieldErrors === 'object' && error.fieldErrors !== null
      ? error.fieldErrors as Record<string, string>
      : {}
  const fieldErrorMessages = Object.entries(fieldErrors).map(([field, message]) => `${field}: ${message}`)
  const hasFieldErrors = fieldErrorMessages.length > 0
  const description =
    error instanceof Error
      ? [error.message, ...fieldErrorMessages].filter(Boolean).join('\n')
      : 'Confira sua conexão e tente novamente.'

  publishToast({
    kind: 'error',
    title: hasFieldErrors ? 'Revise os campos destacados' : 'Não foi possível concluir a solicitação',
    description,
  })
}

export function publishToast(toast: Omit<AppToast, 'id'>) {
  const appToast: AppToast = {
    ...toast,
    id: ++nextToastId,
  }

  listeners.forEach((listener) => listener(appToast))
}
