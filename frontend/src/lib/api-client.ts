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

  return (await response.json()) as T
}

const withBody = (body: unknown) =>
  body instanceof FormData ? body : JSON.stringify(body)

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : withBody(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: withBody(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: withBody(body) }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
}
