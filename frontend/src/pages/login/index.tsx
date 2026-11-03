import { Navigate, useLocation, type Location } from "react-router";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoginBrandPanel } from "@/pages/login/components/login-brand-panel";
import { authService } from "@/services/auth/auth.service";
import { useAuth } from "@/queries/auth/use-auth";

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from =
    (location.state as { from?: Location } | null)?.from?.pathname ?? "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <main className="grid min-h-svh lg:grid-cols-[46fr_54fr]">
      <LoginBrandPanel />

      <section
        aria-labelledby="login-title"
        className="flex flex-col justify-center px-4 py-12 sm:px-8"
      >
        <div className="mx-auto w-full max-w-100">
          <header className="mb-8">
            <BrandLogo className="mb-10 text-brand-navy lg:hidden" />
            <h1 id="login-title" className="text-3xl font-bold tracking-tight">
              Entrar
            </h1>
          </header>

          <Button
            type="button"
            onClick={() => {
              void authService.login();
            }}
            className="h-12 w-full text-base font-semibold"
          >
            Entrar
          </Button>

          <Separator className="my-6" />

          <p className="text-sm leading-relaxed text-muted-foreground">
            Ainda não tem acesso? Peça ao administrador do seu grupo de pesquisa
            para cadastrar você como membro.
          </p>
        </div>
      </section>
    </main>
  );
}
