import { createBrowserRouter, Navigate } from 'react-router'

import { RequireAuth } from '@/components/require-auth'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { GroupPlaceholderRoute } from '@/pages/navigation-placeholder'
import { ResearchGroupIndexRoute, ResearchGroupRoute } from '@/pages/research-group-route'

export const router = createBrowserRouter([
  { path: '/entrar', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <ResearchGroupIndexRoute /> },
      {
        path: 'grupos/:researchGroupId',
        element: <ResearchGroupRoute />,
        children: [
          { index: true, element: <Navigate to="painel" replace /> },
          { path: 'painel', element: <HomePage /> },
          { path: '*', element: <GroupPlaceholderRoute /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
