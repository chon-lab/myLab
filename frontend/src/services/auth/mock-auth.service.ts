import type { AuthService, Credentials, Session } from '@/types/auth/auth.types'

const STORAGE_KEY = 'mylab.session'
const LATENCY_MS = 600

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function nameFromEmail(email: string) {
  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function readStoredSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

export function createMockAuthService(): AuthService {
  return {
    async getSession() {
      return readStoredSession()
    },

    async login({ email, password, rememberMe }: Credentials) {
      await wait(LATENCY_MS)

      if (password.length < 6) {
        throw new Error('E-mail ou senha inválidos.')
      }

      const session: Session = {
        user: { id: crypto.randomUUID(), name: nameFromEmail(email), email },
        accessToken: `mock-${crypto.randomUUID()}`,
      }

      clearStoredSession()
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem(STORAGE_KEY, JSON.stringify(session))

      return session
    },

    async logout() {
      clearStoredSession()
    },

    getAccessToken() {
      return readStoredSession()?.accessToken ?? null
    },
  }
}
