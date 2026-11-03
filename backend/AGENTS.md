# myLab Backend: contrato implementado

API Spring Boot 4 / Java 25, com arquitetura hexagonal (`domain`, `application`, adaptadores REST/JPA), MariaDB e migrações Flyway. Use `../docs/myLab.md`, `../docs/estoque-v1-plano.md` e `../docs/estoque-saidas-transferencias-plano.md` para contexto de negócio. Esses documentos são planos; o catálogo abaixo foi conferido nos controllers de `src/main/java/com/mylab/backend/**/infrastructure/adapters/in/rest/` e descreve as rotas implementadas.

## Convenções HTTP

- Prefixo `/api/v1`. IDs são UUID; datas de negócio são `YYYY-MM-DD`; corpos de escrita usam JSON, salvo upload de documento.
- `GET` de coleção retorna lista JSON, exceto estoque, que retorna objeto agregado. `POST` de criação retorna `201 Created`, cabeçalho `Location` e corpo vazio. `PUT`, `PATCH`, `DELETE` e `POST .../reverse` retornam `204 No Content`.
- Erros tratados usam `ApiErrorResponse`: `timestamp`, `status`, `error`, `message`, `path`, `fieldErrors`. Validação e dados inválidos retornam 400; recurso inexistente, 404; conflitos de dados podem retornar 409. Consulte os exception handlers para casos específicos.
- Em rotas aninhadas, o ID do recurso pai define o escopo. Use os nomes exatos dos parâmetros de consulta indicados abaixo. Os DTOs em `infrastructure/adapters/in/rest/dto` e records em `application/dto` são a referência para campos e validação.

## Autenticação e autorização

Autenticação é via **Keycloak** (resource server OAuth2/JWT). Todo `/api/v1/**` exige um token válido — sem token, `401`; autenticado mas sem permissão, `403`. O módulo `auth` concentra isso.

A autorização dos endpoints **escopados por grupo** é aplicada pelo `PermissionInterceptor` (`auth/infrastructure/web`), dirigido por anotação — **não** por inferência de URL:

- **Regra obrigatória:** todo controller que expõe endpoints escopados a um grupo **precisa** declarar `@RequiredPermission(resource = PermissionResource.X)` (um recurso por controller, no nível da classe; um método pode sobrescrever). **Sem a anotação, a rota não é protegida** (fail-open) — ao criar um controller novo escopado por grupo, lembre-se de anotá-lo.
- A **ação** é derivada do método HTTP: `GET`/`HEAD` → `READ`, `POST`/`PUT`/`PATCH` → `WRITE`, `DELETE` → `DELETE`.
- O **grupo** é resolvido: pelo path nas rotas aninhadas (`/research-groups/{groupId}/...`); via `GroupResolver` (carrega a entidade pra achar o grupo) nas rotas por-id (`/laboratories/{id}`, `/projects/{id}`, `/inventory/entries/{id}/...` etc.). Se o grupo não puder ser resolvido, a rota não é checada.
- O cargo **Admin** do grupo tem `full_access` (passa em tudo). Cargos custom precisam da permissão `(resource, action)` correspondente; o catálogo de recursos/ações é o enum `PermissionResource`/`PermissionAction` (módulo `role`), exposto em `GET /api/v1/permissions/catalog`.
- Endpoints **não** escopados por grupo **não** levam a anotação: `GET /api/v1/me`, `GET /api/v1/permissions/catalog`, `GET /api/v1/me/research-groups/{id}/permissions`, as rotas `/api/v1/me/invitations*` e `POST /api/v1/me/research-groups/{id}/leave` (cada uma valida que o vínculo pertence ao usuário logado), e as coleções `GET`/`POST /api/v1/research-groups` (a listagem é filtrada pelos vínculos ativos do usuário; a criação faz o bootstrap do grupo + cargo Admin `ACTIVE` para o criador).
- Cargos são gerenciados em `/api/v1/research-groups/{id}/roles` (CRUD); o cargo do membro é definido pelo `roleId` no `PATCH` de membro. O `Person` do usuário logado é resolvido pelo e-mail do JWT (criado no 1º acesso — provisionamento JIT).

## Grupos de pesquisa

| Método e rota | Função |
| --- | --- |
| `GET /research-groups` | Lista grupos. |
| `GET /research-groups/{id}` | Obtém grupo. |
| `POST /research-groups` | Cria grupo; corpo `CreateResearchGroupRequest`. |
| `PUT /research-groups/{id}` | Atualiza grupo; corpo `UpdateResearchGroupRequest`. |
| `DELETE /research-groups/{id}` | Remove grupo. |

Na criação, `cnpqId`, `name`, `situation`, `predominantArea` e `institutionName` são obrigatórios. Há dados opcionais de instituição, endereço e contatos. `cnpqId` é informado só na criação. Resposta `ResearchGroupResponse` contém ID, dados cadastrais, endereço, contatos e datas de criação/atualização.

## Linhas de pesquisa

| Método e rota | Função |
| --- | --- |
| `GET /research-groups/{researchGroupId}/research-lines` | Lista linhas do grupo. |
| `POST /research-groups/{researchGroupId}/research-lines` | Cria linha; `CreateResearchLineRequest`. |
| `GET /research-lines/{id}` | Obtém linha. |
| `PUT /research-lines/{id}` | Atualiza linha; `UpdateResearchLineRequest`. |
| `DELETE /research-lines/{id}` | Remove linha. |

Corpos de criação/atualização exigem `name` e `objective`; aceitam `keywords` e `knowledgeAreas`. `ResearchLineResponse` inclui `researchGroupId`.

## Pessoas e vínculos com grupos

| Método e rota | Função |
| --- | --- |
| `GET /research-groups/{researchGroupId}/people` | Lista pessoas do grupo (membros ativos e pendentes). |
| `GET /research-groups/{researchGroupId}/assignable-people` | Busca pessoas do sistema ainda não vinculadas ao grupo, para convidar; `?search=` filtra por nome/e-mail. Resposta `AssignablePersonResponse` expõe só `id`, `name`, `email`, `academicDegree` (sem CPF/telefone). |
| `GET /people/{id}` | Obtém pessoa. |
| `PUT /people/{id}` | Atualiza pessoa; `UpdatePersonRequest`. |
| `DELETE /people/{id}` | Remove pessoa. |
| `GET /research-groups/{researchGroupId}/members` | Lista vínculos do grupo (status `ACTIVE` e `PENDING`). |
| `POST /research-groups/{researchGroupId}/members` | Convida um usuário existente; cria o vínculo como `PENDING`; `CreateGroupMemberRequest` exige `personId` e `roleId` (cargo), aceita `researchLineIds`. |
| `PATCH /research-groups/{researchGroupId}/members/{personId}` | Atualiza vínculo pelo ID da pessoa no grupo; `UpdateGroupMemberRequest` aceita `status`, `roleId` e `researchLineIds`. |
| `GET /people/{personId}/members` | Lista vínculos da pessoa. |
| `GET /members/{id}` | Obtém vínculo pelo ID próprio. |

Não há mais cadastro manual de pessoa: a `Person` é criada por provisionamento JIT no 1º login (Keycloak) e o admin apenas convida usuários existentes. Vínculo: nasce `PENDING` ao convidar; se já existe uma linha `INACTIVE` para a mesma pessoa+grupo, ela é reaproveitada (reconvite) em vez de duplicar; `ACTIVE`/`PENDING` existentes retornam 409. O estado do vínculo é o enum `MembershipStatus` (`PENDING`/`ACTIVE`/`INACTIVE`) — **substituiu o antigo boolean `active`** (migração V23). `GroupMemberResponse` traz `id`, `personId`, `researchGroupId`, `status`, `role`, `roleId`, linhas e timestamps. O enum `role` (perfil ADMIN/RESPONSIBLE/STUDENT/PARTNER) ficou **legado**: não é mais usado na UI nem exigido na criação. Não existe `DELETE /members` (remover = `PATCH` com `status=INACTIVE`).

Convites e saída (escopo `/me`, sem `@RequiredPermission` — cada rota valida que o vínculo é do usuário logado): `GET /api/v1/me/invitations` lista os convites `PENDING` do usuário (com nome do grupo e do cargo); `POST /api/v1/me/invitations/{membershipId}/accept` (PENDING→ACTIVE) e `.../reject` (PENDING→INACTIVE); `POST /api/v1/me/research-groups/{groupId}/leave` (ACTIVE→INACTIVE, preserva a linha). Um vínculo `PENDING` não tem permissão alguma até ser aceito.

## Laboratórios, projetos e documentos

| Método e rota | Função |
| --- | --- |
| `GET /research-groups/{researchGroupId}/laboratories` | Lista laboratórios do grupo. |
| `POST /research-groups/{researchGroupId}/laboratories` | Cria laboratório; `CreateLaboratoryRequest`. |
| `GET /laboratories/{id}` | Obtém laboratório. |
| `PUT /laboratories/{id}` | Atualiza laboratório; `UpdateLaboratoryRequest`. |
| `DELETE /laboratories/{id}` | Remove laboratório. |
| `GET /laboratories/{laboratoryId}/projects` | Lista projetos do laboratório. |
| `POST /laboratories/{laboratoryId}/projects` | Cria projeto; `CreateProjectRequest`. |
| `GET /projects/{id}` | Obtém projeto, incluindo metadados de documentos. |
| `PUT /projects/{id}` | Atualiza projeto; `UpdateProjectRequest`. |
| `DELETE /projects/{id}` | Remove projeto. |
| `POST /projects/{projectId}/documents` | Upload `multipart/form-data`, campo `file`. |
| `GET /projects/{projectId}/documents/{documentId}` | Baixa o arquivo binário, com `Content-Disposition: attachment`. |
| `DELETE /projects/{projectId}/documents/{documentId}` | Remove documento. |

Laboratório: `name` obrigatório, `description`, `status` e `address` opcionais na criação; atualização exige `status`. Status: `ACTIVE`, `INACTIVE`, `MAINTENANCE`. `DELETE` arquiva o laboratório somente quando todos os itens têm saldo zerado; com estoque disponível, retorna 409 e exige saída ou transferência antes da exclusão. As movimentações históricas permanecem consultáveis. Projeto: criação exige `researchLineId`, `name`, `objective`, `startDate`; aceita `description`, `status`, `endDate`, `knowledgeAreas`. Atualização exige `name`, `objective`, `status`, `startDate`; não altera `researchLineId`. Status: `EM_ANDAMENTO`, `CONCLUIDO`, `CANCELADO`, `SUSPENSO`. O upload está limitado a 20 MB pela configuração Spring; os binários ficam no MinIO e os metadados em `project_document`. Não há rota própria para listar documentos: os metadados vêm em `ProjectResponse.documents`.

## Catálogo de itens de estoque

| Método e rota | Função |
| --- | --- |
| `GET /research-groups/{groupId}/inventory/items` | Lista itens do catálogo do grupo. |
| `POST /research-groups/{groupId}/inventory/items` | Cria item; `CreateInventoryItemRequest`. |
| `GET /inventory/items/{id}` | Obtém item. |
| `PUT /inventory/items/{id}` | Atualiza item; `UpdateInventoryItemRequest`. |
| `DELETE /inventory/items/{id}` | Arquiva o item, preservando catálogo, saldo e histórico; repetir a exclusão de item já arquivado retorna sucesso sem alterar os dados. |

Criação exige `name`, `itemType`, `unitOfMeasure`, `referenceUnitValue`; aceita `description`. Atualização permite `name`, `description` e `referenceUnitValue`. `InventoryItemResponse` inclui `active`. O catálogo e o detalhe incluem itens arquivados. Arquivar impede novas entradas, mas mantém histórico e saldo; saídas e transferências podem consumir ou mover saldo de item arquivado, respeitando o saldo disponível. Tipos: `CONSUMABLE`, `PERMANENT`; unidades: `UN`, `CX`, `KIT`, `M`, `KG`, `L`. Quantidades fracionárias só para `M`, `KG`, `L`.

## Entradas, saídas, transferências e saldo

| Método e rota | Função |
| --- | --- |
| `GET /research-groups/{groupId}/inventory/entries` | Histórico de entradas; filtros `laboratoryId`, `source`, `inventoryItemId`, `dateFrom`, `dateTo`. |
| `POST /research-groups/{groupId}/inventory/entries` | Registra entrada; `CreateInventoryEntryRequest`. |
| `GET /inventory/entries/{entryId}` | Detalhe da entrada. |
| `POST /inventory/entries/{entryId}/reverse` | Estorna entrada; corpo `{ "reason": "..." }`. |
| `GET /inventory/entries/{entryId}/documents` | Lista metadados dos documentos da entrada; os mesmos metadados vêm em `GET /inventory/entries/{entryId}`. |
| `POST /inventory/entries/{entryId}/documents` | Cria documento somente com metadados; corpo `CreateInventoryEntryDocumentRequest` com pelo menos um campo entre `documentNumber`, `issuer` e `documentDate`. |
| `POST /inventory/entries/{entryId}/documents/file` | Cria documento com arquivo e metadados opcionais; `multipart/form-data`, campo obrigatório `file`, campos opcionais `documentNumber`, `issuer`, `documentDate`. |
| `GET /inventory/entries/{entryId}/documents/{documentId}` | Obtém metadados do documento. |
| `PUT /inventory/entries/{entryId}/documents/{documentId}/file` | Anexa arquivo a um documento criado só com metadados; multipart campo `file`. |
| `GET /inventory/entries/{entryId}/documents/{documentId}/file` | Baixa o binário do documento. |
| `DELETE /inventory/entries/{entryId}/documents/{documentId}` | Remove documento e arquivo associado. |
| `GET /research-groups/{groupId}/inventory/exits` | Histórico de saídas; filtros `laboratoryId`, `type`, `inventoryItemId`, `dateFrom`, `dateTo`. |
| `POST /research-groups/{groupId}/inventory/exits` | Registra saída; `CreateInventoryExitRequest`. |
| `GET /inventory/exits/{exitId}` | Detalhe da saída. |
| `POST /inventory/exits/{exitId}/reverse` | Estorna saída; corpo `{ "reason": "..." }`. |
| `GET /research-groups/{groupId}/inventory/transfers` | Histórico de transferências; filtros `sourceLaboratoryId`, `destinationLaboratoryId`, `inventoryItemId`, `dateFrom`, `dateTo`. |
| `POST /research-groups/{groupId}/inventory/transfers` | Registra transferência; `CreateInventoryTransferRequest`. |
| `GET /inventory/transfers/{transferId}` | Detalhe da transferência. |
| `POST /inventory/transfers/{transferId}/reverse` | Estorna transferência; corpo `{ "reason": "..." }`. |
| `GET /research-groups/{groupId}/inventory/stock` | Saldo consolidado do grupo; `laboratoryId` opcional restringe a um laboratório. |
| `GET /research-groups/{groupId}/inventory/movements` | Histórico unificado; filtros `laboratoryId`, `inventoryItemId`, `movementType`, `reason`, `status`, `dateFrom`, `dateTo`. |

Entrada: `laboratoryId`, `source` (`PURCHASE` ou `DONATION`), `sourceName`, `receivedAt` e `items` são o núcleo do corpo; `purchaseType` (`FUNDING` ou `OTHER`) é exigido para compras. Cada linha tem `inventoryItemId`, `quantity`, `historicalUnitValue` e pode ter `batchNumber`, `manufacturer`, `expirationDate`. `notes` é opcional.

Saída: `laboratoryId`, `type` (`CONSUMPTION`, `DISPOSAL`, `LOSS`), `occurredAt`, `items` com `inventoryItemId` e `quantity`; `notes` opcional. Transferência: `sourceLaboratoryId`, `destinationLaboratoryId`, `transferredAt`, `items` no mesmo formato e `notes` opcional. As operações validam pertencimento ao grupo, quantidade e saldo; o custo de saída/transferência é calculado pelo backend. Estornos preservam histórico. Consulte os use cases para as regras completas.

`GET .../stock` retorna `{ researchGroupId, laboratoryId, items, totalValue }`; cada item contém `inventoryItemId`, `itemName`, `itemType`, `unitOfMeasure`, `quantity`, `totalValue`. Os históricos retornam registros com status `CONFIRMED`/`REVERSED`, datas, laboratórios, motivo de estorno e linhas. `movements` é somente leitura; `movementType` aceita `ENTRY`, `EXIT`, `TRANSFER`; `reason` aceita `PURCHASE`, `DONATION`, `CONSUMPTION`, `DISPOSAL`, `LOSS`, `INTERNAL_TRANSFER`.

## Limites atuais

Autenticação e autorização por cargos já existem (ver seção acima). Ainda não há endpoints de empréstimos, devoluções, edição direta de saldo ou vínculo de saídas a projetos. Documentos de estoque só podem ser associados a entradas (`movement_type = ENTRY`). Não deduza implementação apenas porque uma funcionalidade aparece nos planos em `../docs/`.
