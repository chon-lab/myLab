---
name: implement-api-screen
description: Implementar telas do frontend myLab que leem ou alteram dados da API do backend. Use ao criar ou modificar páginas React ligadas a endpoints; não se aplica a ajustes apenas visuais sem acesso a dados.
---

# Tela React conectada à API do myLab

Leia `frontend/AGENTS.md` para as regras obrigatórias de código, acessibilidade, Tailwind, shadcn/ui, formulários e estrutura. Leia `backend/AGENTS.md` para localizar as rotas implementadas; confira o controller, DTOs e records do módulo antes de tipar payloads, filtros e respostas. `docs/` explica o negócio, mas contém planos ainda não implementados.

Para o visual da tela, siga a seção **Cores do sistema** de `frontend/AGENTS.md`. A paleta usa azul-marinho (`brand-navy`), amarelo (`brand-yellow`) e azul para ações primárias (`primary`); `foreground` e `muted-foreground` definem a hierarquia de texto. Use classes Tailwind desses tokens, inclusive nos estados de carregamento, erro e vazio. Consulte `frontend/src/index.css` para os valores atuais e variantes de tema; não fixe cores hexadecimais nos componentes.

## Fluxo de implementação

1. Identifique o grupo/laboratório/projeto necessário para a tela e como ela receberá esses IDs pela rota ou pelo contexto existente. Não invente endpoints nem dados de sessão para obtê-los. Se a navegação atual não fornece o ID, ajuste a rota e o fluxo de seleção de forma coerente.
2. Defina tipos da API em `frontend/src/types/<modulo>/`. Para formulário, crie schema Zod no mesmo módulo e traduza os valores da UI para os enums, UUIDs, datas ISO e números esperados pelo DTO Java. Confira quais campos são obrigatórios na criação e na atualização.
3. Crie funções de requisição em `frontend/src/services/<modulo>/*.service.ts`, usando `api` de `@/lib/api-client`. Construa query strings com `URLSearchParams`, omitindo filtros vazios. O prefixo da URL é `/api/v1`; em dev, o proxy Vite encaminha `/api` para a porta 8080.
4. Em `frontend/src/queries/<modulo>/<modulo>.queries.ts`, crie query keys que incluam IDs de escopo e filtros, `queryOptions` e hooks de leitura/mutação com TanStack Query. Depois de mutações, invalide ou atualize as listas, detalhes e saldos afetados; entrada, saída, transferência e estorno também afetam o estoque.
5. Monte `frontend/src/pages/<tela>/index.tsx` e componentes locais, registre a rota em `src/app/router.tsx` sob `RequireAuth`/`AppShell` quando for uma tela interna e integre a navegação existente. Mostre carregamento, vazio, erro e sucesso. Para formulários, use React Hook Form, Zod e os componentes Field do shadcn/ui. Textos em pt-BR, HTML semântico, um `h1`, rótulos acessíveis e apenas tokens Tailwind.
6. Valide com `npm run build` e `npm run lint` em `frontend/`. Se a tela alterar dados, confira o fluxo de criação/atualização e a invalidação de cache contra o contrato real do backend.

## Casos do cliente HTTP atual

`src/lib/api-client.ts` chama `response.json()` para toda resposta bem-sucedida que não seja 204. Os controllers retornam `201 Created` com `Location` e corpo vazio; um `api.post<void>` direto falhará ao analisar JSON. Ao implementar uma criação, adapte o cliente compartilhado para aceitar resposta vazia e, se precisar do novo ID, ler `Location`, mantendo os demais consumidores compatíveis. `GET /projects/{projectId}/documents/{documentId}` retorna binário, então exponha no cliente uma operação de download autenticada que leia `Blob`/headers, sem tentar `response.json()`. Upload usa `FormData` com campo `file`; deixe o navegador definir o `Content-Type` multipart. Mantenha tratamento de erros via `ApiError` e `fieldErrors`.

O login atual é mock no frontend. Não dependa de um endpoint de autenticação inexistente nem trate as regras de autorização previstas em `docs/` como já disponíveis na API.
