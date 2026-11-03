import { createBrowserRouter, Navigate } from "react-router";

import { RequireAuth } from "@/components/require-auth";
import { RequirePermission } from "@/components/require-permission";
import { HomePage } from "@/pages/home";
import { InventoryEntriesPage } from "@/pages/inventory-entries";
import { InventoryExitsPage } from "@/pages/inventory-exits";
import { InventoryItemsPage } from "@/pages/inventory-items";
import { InventoryStockPage } from "@/pages/inventory-stock";
import { LaboratoriesPage } from "@/pages/laboratories";
import { LoginPage } from "@/pages/login";
import { GroupPlaceholderRoute } from "@/pages/navigation-placeholder";
import { ResearchGroupDetailsPage } from "@/pages/research-group-details";
import {
  NewResearchGroupRoute,
  ResearchGroupIndexRoute,
  ResearchGroupRoute,
} from "@/routes/research-group";
import { ResearchLinesPage } from "@/pages/research-lines";
import { MembersPage } from "@/pages/members";
import { RolesPage } from "@/pages/roles";
import { ProjectsPage } from "@/pages/projects";
import { InventoryTransfersPage } from "@/pages/inventory-transfers";

export const router = createBrowserRouter([
  { path: "/entrar", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <ResearchGroupIndexRoute /> },
      { path: "novo-grupo", element: <NewResearchGroupRoute /> },
      {
        path: "grupos/:researchGroupId",
        element: <ResearchGroupRoute />,
        children: [
          { index: true, element: <Navigate to="painel" replace /> },
          { path: "painel", element: <HomePage /> },
          {
            path: "dados-do-grupo",
            element: (
              <RequirePermission resource="RESEARCH_GROUP">
                <ResearchGroupDetailsPage />
              </RequirePermission>
            ),
          },
          {
            path: "linhas-de-pesquisa",
            element: (
              <RequirePermission resource="RESEARCH_LINE">
                <ResearchLinesPage />
              </RequirePermission>
            ),
          },
          {
            path: "membros",
            element: (
              <RequirePermission resource="MEMBER">
                <MembersPage />
              </RequirePermission>
            ),
          },
          {
            path: "cargos",
            element: (
              <RequirePermission resource="ROLE">
                <RolesPage />
              </RequirePermission>
            ),
          },
          {
            path: "laboratorios",
            element: (
              <RequirePermission resource="LABORATORY">
                <LaboratoriesPage />
              </RequirePermission>
            ),
          },
          {
            path: "projetos",
            element: (
              <RequirePermission resource="PROJECT">
                <ProjectsPage />
              </RequirePermission>
            ),
          },
          {
            path: "estoque/saldo",
            element: (
              <RequirePermission resource="INVENTORY_STOCK">
                <InventoryStockPage />
              </RequirePermission>
            ),
          },
          {
            path: "estoque/itens",
            element: (
              <RequirePermission resource="INVENTORY_ITEM">
                <InventoryItemsPage />
              </RequirePermission>
            ),
          },
          {
            path: "estoque/entradas",
            element: (
              <RequirePermission resource="INVENTORY_ENTRY">
                <InventoryEntriesPage />
              </RequirePermission>
            ),
          },
          {
            path: "estoque/saidas",
            element: (
              <RequirePermission resource="INVENTORY_EXIT">
                <InventoryExitsPage />
              </RequirePermission>
            ),
          },
          {
            path: "estoque/transferencias",
            element: (
              <RequirePermission resource="INVENTORY_TRANSFER">
                <InventoryTransfersPage />
              </RequirePermission>
            ),
          },
          { path: "*", element: <GroupPlaceholderRoute /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
