import Keycloak from "keycloak-js";

import type { AuthService, Session } from "@/types/auth/auth.types";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? "",
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? "",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "",
});

let initialized = false;

export async function initKeycloak(): Promise<boolean> {
  if (initialized) {
    return Boolean(keycloak.authenticated);
  }

  initialized = true;

  const authenticated = await keycloak.init({
    onLoad: "check-sso",
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    pkceMethod: "S256",
  });

  keycloak.onTokenExpired = () => {
    void keycloak.updateToken(30);
  };

  return authenticated;
}

function toSession(): Session | null {
  if (!keycloak.authenticated || !keycloak.token) {
    return null;
  }

  const claims = keycloak.tokenParsed ?? {};

  return {
    user: {
      id: claims.sub ?? "",
      name: claims.name ?? claims.preferred_username ?? claims.email ?? "",
      email: claims.email ?? "",
    },
    accessToken: keycloak.token,
  };
}

export function createKeycloakAuthService(): AuthService {
  return {
    async getSession() {
      return toSession();
    },

    async login() {
      await keycloak.login({ redirectUri: window.location.origin });
      return toSession() as Session;
    },

    async logout() {
      await keycloak.logout({
        redirectUri: `${window.location.origin}/entrar`,
      });
    },

    getAccessToken() {
      return keycloak.token ?? null;
    },
  };
}
