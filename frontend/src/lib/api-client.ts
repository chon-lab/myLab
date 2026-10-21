import { publishToast } from '@/lib/api-error-toasts'
import { authService } from '@/services/auth/auth.service'

export type ApiErrorResponse = {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fieldErrors: Record<string, string>
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function toApiError(response: Response) {
  const body = (await response.json().catch(() => null)) as Partial<ApiErrorResponse> | null
  return new ApiError(
    response.status,
    body?.message ?? response.statusText ?? 'Erro inesperado.',
    body?.fieldErrors ?? {},
  )
}

function publishSuccessMessages(body: unknown) {
  if (typeof body !== 'object' || body === null) return

  const response = body as { message?: unknown; messages?: unknown }
  const messages = [
    ...(typeof response.message === 'string' ? [response.message] : []),
    ...(Array.isArray(response.messages)
      ? response.messages.filter((message): message is string => typeof message === 'string')
      : []),
  ].map((message) => message.trim()).filter(Boolean)

  if (messages.length > 0) {
    publishToast({
      kind: 'success',
      title: 'Mensagem da API',
      description: messages.join('\n'),
    })
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = authService.getAccessToken()

  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T

  const text = await response.text()

  if (!text) {
    const location = response.headers.get('Location')
    const createdId = location?.split('/').filter(Boolean).pop()
    return (createdId ?? undefined) as T
  }

  const body = JSON.parse(text) as unknown
  publishSuccessMessages(body)
  return body as T
}

const withBody = (body: unknown) =>
  body instanceof FormData ? body : JSON.stringify(body)

export const api = {
  get: <T>(path: string) => request<T>(path),
  download: async (path: string) => {
    const headers = new Headers()
    const token = authService.getAccessToken()

    if (token) headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${BASE_URL}${path}`, { headers })
    if (!response.ok) throw await toApiError(response)
    return response.blob()
  },
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : withBody(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: withBody(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: withBody(body) }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
}
