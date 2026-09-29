export type Credentials = {
  email: string
  password: string
  rememberMe: boolean
}

export type SessionUser = {
  id: string
  name: string
  email: string
}

export type Session = {
  user: SessionUser
  accessToken: string
}

export interface AuthService {
  getSession(): Promise<Session | null>
  login(credentials: Credentials): Promise<Session>
  logout(): Promise<void>
  getAccessToken(): string | null
}
