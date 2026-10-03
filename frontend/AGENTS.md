# myLab Frontend: regras do projeto

SPA em **React + Vite + TypeScript**, acessada somente após login (sem SSR). Node **24 LTS** (definido no `mise.toml` da raiz).
Gerenciador de pacotes: **npm**.

## Regras obrigatórias

1. **HTML semântico sempre.** Use `header`, `nav`, `main`, `section`, `aside`, `footer`, `form`, `label`, `ul/li`, `h1…h6` conforme o conteúdo.
   - Nada de `div` clicável: ações usam `<button>` e navegação usa `<a>`/`<Link>`.
   - Todo campo tem `<label>` associado; ícones decorativos levam `aria-hidden="true"`; botões só com ícone levam `aria-label`.
   - Cada página tem um único `<h1>`; seções usam `aria-labelledby` apontando para seu título.
2. **Estilo só com Tailwind.** Nada de CSS modules, styled-components ou `style={{}}`.
   - Cores e fontes são tokens em `src/index.css` (`bg-brand-navy`, `bg-brand-yellow`, `bg-primary`, `text-muted-foreground`…). Não use hex solto nos componentes.
   - Combine classes com `cn()` de `@/lib/utils`.
3. **Todo acesso a dados passa pelo TanStack Query.**
   - `services/<modulo>/*.service.ts`: funções puras que chamam a API via `api` de `@/lib/api-client`.
   - `queries/<modulo>/<modulo>.queries.ts`: fábrica de query keys (`<modulo>Keys`), `queryOptions` e hooks `useXxxQuery` / `useXxxMutation`.
   - Componentes **nunca** chamam `fetch`/`api` diretamente nem usam `useEffect` para buscar dados.
   - Mutations atualizam ou invalidam o cache pelas query keys do módulo.
4. **Componentes complexos vêm do shadcn/ui**: form/field, dialog, select, combobox, table, dropdown, tabs, toast, date picker etc.
   - Adicione com `npx shadcn@latest add <componente>` em `src/components/ui/`. Não reimplemente.
   - Não edite a lógica dos arquivos de `components/ui`; customize via `className`.
5. **Nenhum comentário no código.** Nada de `//`, `/* */`, `{/* */}` ou JSDoc em arquivos `.ts`, `.tsx`, `.css` e de configuração.
   - O código deve se explicar por nomes claros de variáveis, funções e componentes.
   - Contexto, decisões e pendências vão para este arquivo, para `../docs/` ou para a descrição do commit/PR.
6. **Formulários**: `react-hook-form` + `zod` (schema em `types/<modulo>/*.schema.ts`) com os componentes `Field` do shadcn.

## Estrutura

```
src/
  app/                    router
  components/             componentes globais: ui/ (shadcn), layout/, require-auth, brand-logo
  lib/                    api-client, query-client, utils
  services/<modulo>/      *.service.ts
  queries/<modulo>/       <modulo>.queries.ts e hooks derivados (ex.: use-auth.ts)
  types/<modulo>/         *.types.ts e *.schema.ts (zod)
  pages/<tela>/
    index.tsx             componente principal da tela, exportado como <Tela>Page
    components/           componentes usados só por essa tela
```

- Módulos seguem o domínio: `auth`, `research-groups`, `people`, `laboratories`, `projects`, `inventory`…
- Um componente vai para `src/components/` só quando é usado por mais de uma página; senão fica em `pages/<tela>/components/`.

- Imports sempre pelo alias `@/`.
- Textos da interface em português (pt-BR).

## Autenticação

- As telas dependem apenas da interface `AuthService` (`types/auth/auth.types.ts`) e dos hooks de `queries/auth/`.
- Hoje, com `VITE_AUTH_MODE=mock`, aceita qualquer e-mail válido com senha de 6+ caracteres.
- Futuro: **Keycloak**.
  - `keycloak-js` com Authorization Code + PKCE entra como nova implementação de `AuthService`.
  - A tela de login migra para um tema Keycloakify.
  - Por isso `LoginForm` e `LoginBrandPanel` são apenas de apresentação: sem lógica de auth dentro.
- O backend (`/api/v1/...`, porta 8080) é acessado via proxy do Vite em dev; erros seguem `ApiErrorResponse` e viram `ApiError`.

## Comandos

- `npm run dev`: servidor de desenvolvimento (proxy `/api` → `localhost:8080`)
- `npm run build`: typecheck + build
- `npm run lint`: oxlint
