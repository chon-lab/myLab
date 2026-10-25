import { createBrowserRouter, Navigate } from 'react-router'

import { RequireAuth } from '@/components/require-auth'
import { HomePage } from '@/pages/home'
import { InventoryEntriesPage } from '@/pages/inventory-entries'
import { InventoryExitsPage } from '@/pages/inventory-exits'
import { InventoryItemsPage } from '@/pages/inventory-items'
import { InventoryStockPage } from '@/pages/inventory-stock'
import { LaboratoriesPage } from '@/pages/laboratories'
import { LoginPage } from '@/pages/login'
import { GroupPlaceholderRoute } from '@/pages/navigation-placeholder'
import { ResearchGroupDetailsPage } from '@/pages/research-group-details'
import { ResearchGroupIndexRoute, ResearchGroupRoute } from '@/pages/research-group-route'
import { ResearchLinesPage } from '@/pages/research-lines'
import { MembersPage } from '@/pages/members'

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
          { path: 'dados-do-grupo', element: <ResearchGroupDetailsPage /> },
          { path: 'linhas-de-pesquisa', element: <ResearchLinesPage /> },
          { path: 'membros', element: <MembersPage /> },
          { path: 'laboratorios', element: <LaboratoriesPage /> },
          { path: 'estoque/saldo', element: <InventoryStockPage /> },
          { path: 'estoque/itens', element: <InventoryItemsPage /> },
          { path: 'estoque/entradas', element: <InventoryEntriesPage /> },
          { path: 'estoque/saidas', element: <InventoryExitsPage /> },
          { path: '*', element: <GroupPlaceholderRoute /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
