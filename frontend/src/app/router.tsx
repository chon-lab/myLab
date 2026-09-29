import { createBrowserRouter, Navigate } from 'react-router'

import { AppShell } from '@/components/layout/app-shell'
import { RequireAuth } from '@/components/require-auth'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'

export const router = createBrowserRouter([
  { path: '/entrar', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [{ index: true, element: <HomePage /> }],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
