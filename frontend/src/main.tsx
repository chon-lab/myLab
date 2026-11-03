import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";
import { router } from "@/routes/router";
import { RouterProvider } from "react-router";
import { ApiErrorToaster } from "@/components/layout/api-error-toaster";
import { initKeycloak } from "@/services/auth/keycloak-auth.service";

async function bootstrap() {
  await initKeycloak();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ApiErrorToaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

bootstrap();
