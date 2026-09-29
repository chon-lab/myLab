import { useSessionQuery } from '@/queries/auth/auth.queries'

export function useAuth() {
  const { data: session, isPending } = useSessionQuery()

  return {
    session: session ?? null,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    isLoading: isPending,
  }
}
