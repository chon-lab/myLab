import type { AuthService } from '@/types/auth/auth.types'
import { createMockAuthService } from '@/services/auth/mock-auth.service'

function createAuthService(): AuthService {
  const mode = import.meta.env.VITE_AUTH_MODE ?? 'mock'

  switch (mode) {
    case 'mock':
      return createMockAuthService()
    default:
      throw new Error(`VITE_AUTH_MODE não suportado: ${mode}`)
  }
}

export const authService = createAuthService()
