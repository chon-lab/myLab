# myLab: orientação para agentes

## Onde buscar instruções

- Mudanças em `backend/`, contratos HTTP, banco e regras de domínio: leia [backend/AGENTS.md](backend/AGENTS.md). Ali está o catálogo dos endpoints efetivamente implementados.
- Mudanças em `frontend/`, telas, componentes, estilos e consumo da API: leia [frontend/AGENTS.md](frontend/AGENTS.md). Para criar uma tela que consome endpoints, use também [.agents/skills/implement-api-screen/SKILL.md](.agents/skills/implement-api-screen/SKILL.md).
- Mudanças que cruzam front e back: aplique ambos os arquivos; confira o contrato no controller e nos DTOs antes de escrever o cliente.
- `docs/` contém requisitos e planos de evolução. Eles dão contexto, mas os controllers e DTOs do backend determinam o que já está disponível. `README.md` e `backend/HELP.md` contêm material antigo/genérico; prefira os arquivos de configuração citados abaixo para executar o projeto.

## Executar localmente

Requisitos: Java 25, Node 24, npm e Docker com Compose. `mise.toml` fixa as versões de Java e Node e oferece as tarefas `start` e `front`.

1. Na raiz, copie `.env.example` para `.env` e defina `MARIADB_PASSWORD`, `MARIADB_ROOT_PASSWORD` e `KEYCLOAK_ADMIN_PASSWORD`. Acrescente `MARIADB_URL=jdbc:mariadb://localhost:3307/mylab` ao `.env`: o Compose publica MariaDB na porta **3307**, enquanto o valor padrão do Spring usa 3306.
2. Inicie os serviços na raiz: `docker compose up -d mariadb minio keycloak`. Coloque a licença AIStor Free em `.secrets/minio.license` ou ajuste `MINIO_LICENSE_FILE` no `.env`. O Flyway executa as migrações ao iniciar o backend. O Keycloak sobe em `http://localhost:8081` (admin em `/admin`, console com `KEYCLOAK_ADMIN`/`KEYCLOAK_ADMIN_PASSWORD`) e importa o realm `mylab` de `infra/keycloak/realm-mylab.json` (client público `mylab-frontend`, auto-cadastro habilitado, usuário de teste `pesquisador@mylab.test` / `pesquisador`). O Keycloak **persiste no MariaDB**, em um banco separado `keycloak` (reusa `MARIADB_USER`/`MARIADB_PASSWORD`); ele cria as próprias tabelas via Liquibase no primeiro start, sem script de schema. O banco `keycloak` é criado automaticamente pelo init-script `infra/db/init/01-keycloak-db.sh` **apenas em volumes novos**; se o seu volume `mariadb_data` já existe, crie uma vez: `CREATE DATABASE IF NOT EXISTS keycloak CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;` e `GRANT ALL PRIVILEGES ON keycloak.* TO '<MARIADB_USER>'@'%';`.
3. Inicie o backend em outro terminal: `mise run start` na raiz; ou, no Windows, `cd backend` e `mvnw.cmd spring-boot:run`. Em Unix, use `./mvnw spring-boot:run`. API: `http://localhost:8080/api/v1`. O backend valida o JWT do Keycloak (resource server); sem token, `/api/v1/**` retorna 401. Ajuste o issuer por `KEYCLOAK_ISSUER_URI` se necessário.
4. Na pasta `frontend`, copie `.env.example` para `.env`, execute `npm ci` e `npm run dev`; alternativamente, após instalar as dependências, use `mise run front` na raiz. Para usar o Keycloak defina `VITE_AUTH_MODE=keycloak` (com `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`). Abra a URL exibida pelo Vite. O proxy de desenvolvimento encaminha `/api` para `http://localhost:8080`.

Verificações: `cd backend` e `mvnw.cmd test` (Windows) ou `./mvnw test` (Unix); `cd frontend` e `npm run build` / `npm run lint`. A autenticação usa Keycloak quando `VITE_AUTH_MODE=keycloak` (login por redirect, Authorization Code + PKCE) e o modo `mock` continua disponível para desenvolvimento. No primeiro login o backend resolve a `Person` pelo e-mail do JWT e a cria se não existir (provisionamento JIT); a listagem de grupos é filtrada pelos vínculos ativos do usuário. Os documentos são armazenados no bucket MinIO `mylab-documents`; os metadados ficam no MariaDB. Arquivos locais antigos de projetos continuam sendo lidos de `MYLAB_DOCUMENTS_DIR` até serem removidos.

## Autenticação ao containerizar / produção

A configuração atual do Keycloak é de **desenvolvimento** e assume front e backend rodando no **host** (por isso `localhost` nas URLs). Ao containerizar back e front para produção, três pontos mudam e precisam de tratamento próprio (fora do escopo do wiring de dev):

- **Issuer vs. rede interna.** O `iss` do token é a URL pública pela qual o navegador alcançou o Keycloak; o backend em container fala com o Keycloak por um host interno (ex.: `keycloak:8080`). Usar só `issuer-uri` com o host interno rejeita todos os tokens. O correto é fixar `KC_HOSTNAME` (URL pública) e, no backend, **desacoplar**: `jwk-set-uri` interno para buscar as chaves + validação do **issuer público**. Trocar `start-dev` por `start` com TLS e hostname reais.
- **Front é estático e as `VITE_*` são build-time.** `import.meta.env.VITE_*` é embutido no bundle no `npm run build`, não lido em runtime. Para uma imagem nginx servindo o `dist/`, injete a config em runtime (ex.: `env.js`/`config.js` via envsubst no start do container) ou faça build por ambiente.
- **URLs públicas por ambiente.** `redirectUris`/`webOrigins` do client, `MYLAB_CORS_ALLOWED_ORIGINS` e `VITE_API_URL` deixam de ser `localhost` e passam a ser o domínio público → mantenha o realm por ambiente (dev com localhost, prod com o domínio) ou com placeholders substituídos no deploy.
