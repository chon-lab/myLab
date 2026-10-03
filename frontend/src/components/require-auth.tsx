import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuth } from '@/queries/auth/use-auth'

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="grid min-h-svh place-items-center">
        <p role="status" className="text-sm text-muted-foreground">
          Carregando…
        </p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/entrar" replace state={{ from: location }} />
  }

  return <Outlet />
}
