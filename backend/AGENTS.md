# myLab Backend: contrato implementado

API Spring Boot 4 / Java 25, com arquitetura hexagonal (`domain`, `application`, adaptadores REST/JPA), MariaDB e migrações Flyway. Use `../docs/myLab.md`, `../docs/estoque-v1-plano.md` e `../docs/estoque-saidas-transferencias-plano.md` para contexto de negócio. Esses documentos são planos; o catálogo abaixo foi conferido nos controllers de `src/main/java/com/mylab/backend/**/infrastructure/adapters/in/rest/` e descreve as rotas implementadas.

## Convenções HTTP

- Prefixo `/api/v1`. IDs são UUID; datas de negócio são `YYYY-MM-DD`; corpos de escrita usam JSON, salvo upload de documento.
- `GET` de coleção retorna lista JSON, exceto estoque, que retorna objeto agregado. `POST` de criação retorna `201 Created`, cabeçalho `Location` e corpo vazio. `PUT`, `PATCH`, `DELETE` e `POST .../reverse` retornam `204 No Content`.
- Erros tratados usam `ApiErrorResponse`: `timestamp`, `status`, `error`, `message`, `path`, `fieldErrors`. Validação e dados inválidos retornam 400; recurso inexistente, 404; conflitos de dados podem retornar 409. Consulte os exception handlers para casos específicos.
- Em rotas aninhadas, o ID do recurso pai define o escopo. Use os nomes exatos dos parâmetros de consulta indicados abaixo. Os DTOs em `infrastructure/adapters/in/rest/dto` e records em `application/dto` são a referência para campos e validação.

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
| `GET /research-groups/{researchGroupId}/people` | Lista pessoas do grupo. |
| `POST /research-groups/{researchGroupId}/people` | Cadastra pessoa no contexto do grupo; `CreatePersonRequest`. |
| `GET /people/{id}` | Obtém pessoa. |
| `PUT /people/{id}` | Atualiza pessoa; `UpdatePersonRequest`. |
| `DELETE /people/{id}` | Remove pessoa. |
| `GET /research-groups/{researchGroupId}/members` | Lista vínculos do grupo. |
| `POST /research-groups/{researchGroupId}/members` | Cria ou reativa vínculo; `CreateGroupMemberRequest`. |
| `PATCH /research-groups/{researchGroupId}/members/{personId}` | Atualiza vínculo pelo ID da pessoa no grupo; `UpdateGroupMemberRequest`. |
| `GET /people/{personId}/members` | Lista vínculos da pessoa. |
| `GET /members/{id}` | Obtém vínculo pelo ID próprio. |

Pessoa: `name` obrigatório; `socialName`, `email`, `phone`, `cpf`, `academicDegree` e `areasOfExpertise` opcionais. A criação também aceita `researchLineIds`. Vínculo: criação exige `personId` e aceita `researchLineIds`; PATCH aceita `active` e `researchLineIds`. `GroupMemberResponse` traz `id`, `personId`, `researchGroupId`, `active`, linhas e timestamps. Não existe `DELETE /members`.

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

Laboratório: `name` obrigatório, `description`, `status` e `address` opcionais na criação; atualização exige `status`. Status: `ACTIVE`, `INACTIVE`, `MAINTENANCE`. Projeto: criação exige `researchLineId`, `name`, `objective`, `startDate`; aceita `description`, `status`, `endDate`, `knowledgeAreas`. Atualização exige `name`, `objective`, `status`, `startDate`; não altera `researchLineId`. Status: `EM_ANDAMENTO`, `CONCLUIDO`, `CANCELADO`, `SUSPENSO`. O upload está limitado a 20 MB pela configuração Spring; os arquivos de projeto usam armazenamento local. Não há rota própria para listar documentos: os metadados vêm em `ProjectResponse.documents`.

## Catálogo de itens de estoque

| Método e rota | Função |
| --- | --- |
| `GET /research-groups/{groupId}/inventory/items` | Lista itens do catálogo do grupo. |
| `POST /research-groups/{groupId}/inventory/items` | Cria item; `CreateInventoryItemRequest`. |
| `GET /inventory/items/{id}` | Obtém item. |
| `PUT /inventory/items/{id}` | Atualiza item; `UpdateInventoryItemRequest`. |
| `DELETE /inventory/items/{id}` | Exclui ou arquiva o item conforme seu histórico. |

Criação exige `name`, `itemType`, `unitOfMeasure`, `referenceUnitValue`; aceita `description`. Atualização permite `name`, `description` e `referenceUnitValue`. `InventoryItemResponse` inclui `active`. Tipos: `CONSUMABLE`, `PERMANENT`; unidades: `UN`, `CX`, `KIT`, `M`, `KG`, `L`. Quantidades fracionárias só para `M`, `KG`, `L`.

## Entradas, saídas, transferências e saldo

| Método e rota | Função |
| --- | --- |
| `GET /research-groups/{groupId}/inventory/entries` | Histórico de entradas; filtros `laboratoryId`, `source`, `inventoryItemId`, `dateFrom`, `dateTo`. |
| `POST /research-groups/{groupId}/inventory/entries` | Registra entrada; `CreateInventoryEntryRequest`. |
| `GET /inventory/entries/{entryId}` | Detalhe da entrada. |
| `POST /inventory/entries/{entryId}/reverse` | Estorna entrada; corpo `{ "reason": "..." }`. |
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

Não há endpoints de login, permissões, documentos de entrada de estoque, empréstimos, devoluções, edição direta de saldo ou vínculo de saídas a projetos. Não deduza implementação apenas porque uma funcionalidade aparece nos planos em `../docs/`.
