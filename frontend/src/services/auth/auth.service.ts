import type { AuthService } from "@/types/auth/auth.types";
import { createKeycloakAuthService } from "@/services/auth/keycloak-auth.service";

function createAuthService(): AuthService {
  return createKeycloakAuthService();
}

export const authService = createAuthService();
