# myLab: orientação para agentes

## Onde buscar instruções

- Mudanças em `backend/`, contratos HTTP, banco e regras de domínio: leia [backend/AGENTS.md](backend/AGENTS.md). Ali está o catálogo dos endpoints efetivamente implementados.
- Mudanças em `frontend/`, telas, componentes, estilos e consumo da API: leia [frontend/AGENTS.md](frontend/AGENTS.md). Para criar uma tela que consome endpoints, use também [.agents/skills/implement-api-screen/SKILL.md](.agents/skills/implement-api-screen/SKILL.md).
- Mudanças que cruzam front e back: aplique ambos os arquivos; confira o contrato no controller e nos DTOs antes de escrever o cliente.
- `docs/` contém requisitos e planos de evolução. Eles dão contexto, mas os controllers e DTOs do backend determinam o que já está disponível. `README.md` e `backend/HELP.md` contêm material antigo/genérico; prefira os arquivos de configuração citados abaixo para executar o projeto.

## Executar localmente

Requisitos: Java 25, Node 24, npm e Docker com Compose. `mise.toml` fixa as versões de Java e Node e oferece as tarefas `start` e `front`.

1. Na raiz, copie `.env.example` para `.env` e defina `MARIADB_PASSWORD` e `MARIADB_ROOT_PASSWORD`. Acrescente `MARIADB_URL=jdbc:mariadb://localhost:3307/mylab` ao `.env`: o Compose publica MariaDB na porta **3307**, enquanto o valor padrão do Spring usa 3306.
2. Inicie o banco na raiz: `docker compose up -d mariadb`. O Flyway executa as migrações ao iniciar o backend.
3. Inicie o backend em outro terminal: `mise run start` na raiz; ou, no Windows, `cd backend` e `mvnw.cmd spring-boot:run`. Em Unix, use `./mvnw spring-boot:run`. API: `http://localhost:8080/api/v1`.
4. Na pasta `frontend`, copie `.env.example` para `.env`, execute `npm ci` e `npm run dev`; alternativamente, após instalar as dependências, use `mise run front` na raiz. Abra a URL exibida pelo Vite. O proxy de desenvolvimento encaminha `/api` para `http://localhost:8080`.

Verificações: `cd backend` e `mvnw.cmd test` (Windows) ou `./mvnw test` (Unix); `cd frontend` e `npm run build` / `npm run lint`. O login atual usa `VITE_AUTH_MODE=mock`; o backend não oferece endpoint de autenticação. Documentos de projeto são armazenados localmente em `backend/storage/projects`, configurável por `MYLAB_DOCUMENTS_DIR`.
