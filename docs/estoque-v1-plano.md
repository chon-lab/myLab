# Estoque v1 — catálogo e entradas rastreáveis

## Resumo

Implementar o módulo de estoque focado em cadastro de itens e entradas. Ele controlará saldo e valor por laboratório, procedência, documentos opcionais e lotes/validade opcionais. Saídas, empréstimos, projetos, usuários e permissões ficam para a próxima etapa.

## Modelo e regras

- Criar `inventory_item`, vinculado ao grupo de pesquisa: nome, descrição, tipo obrigatório (`CONSUMABLE` ou `DURABLE`), unidade padronizada (`UN`, `CX`, `KIT`, `M`, `KG`, `L` etc.) e valor unitário de referência em BRL.
- Criar uma entrada com cabeçalho em `inventory_entry`: grupo, laboratório de destino, origem (`PURCHASE`, `DONATION`, `FUNDING`), nome obrigatório da entidade de origem, data de recebimento, observação e status (`CONFIRMED`, `REVERSED`).
- Criar linhas em `inventory_entry_item`, permitindo uma única entrada para vários itens de uma nota: item, quantidade positiva, valor unitário histórico obrigatório, lote/fabricante/validade opcionais.
- O valor do estoque será calculado pelas linhas confirmadas: `quantidade disponível × valor unitário histórico`. Em doações, o valor unitário será uma avaliação estimada; não poderá ser omitido.
- Criar `inventory_entry_document`, com zero ou mais documentos por entrada: número, emissor, data e arquivo opcionais. Metadados do arquivo incluem nome original, tipo, tamanho, checksum e chave de armazenamento.
- Validar que item e laboratório pertencem ao grupo informado; o laboratório é obrigatório. Não permitir valor ou quantidade zero/negativos.
- Correções serão feitas por estorno: a entrada permanece no histórico, recebe motivo/data de estorno e deixa de compor saldo e valor. Não haverá exclusão física.
- Após uma entrada confirmada, unidade e tipo do item ficam protegidos para preservar o histórico; nome, descrição e valor de referência continuam atualizáveis.

## API e armazenamento

- Expor CRUD do catálogo em `/api/v1/research-groups/{groupId}/inventory/items`, com arquivamento em vez de exclusão quando houver movimentação.
- Expor criação, consulta e estorno de entradas em `/api/v1/research-groups/{groupId}/inventory/entries`; a criação receberá cabeçalho e lista de linhas.
- Expor consulta de saldo em `/api/v1/research-groups/{groupId}/inventory/stock`: sem `laboratoryId`, consolidar por item em todo o grupo; com `laboratoryId`, consolidar por item naquele laboratório. Retornar o valor total de cada item e o total monetário do escopo consultado. O histórico de entradas será filtrável por laboratório, origem, item e período.
- Expor upload e consulta de documentos por entrada via `multipart/form-data`.
- Adicionar MinIO ao ambiente Docker e criar um adaptador de armazenamento compatível com S3. O MariaDB guardará apenas metadados e a chave do objeto, nunca Base64 ou binários de nota.

## Fluxo da aplicação

O módulo será dividido em três telas, seguindo a ordem do processo:

```text
Cadastro de itens
    └── cria os tipos de item no catálogo

Registro de entrada
    └── seleciona itens ativos do catálogo
         └── informa quantidade e valor histórico da entrada

Consulta do estoque
    └── exibe os saldos consolidados por item e laboratório
```

### Cadastro de itens

Antes de registrar um recebimento, o usuário cria cada tipo de item pelo CRUD de `inventory_item`, informando nome, descrição, tipo, unidade de medida e valor unitário de referência. Esse valor é uma estimativa ou valor atual e poderá ser usado como sugestão na tela de entrada.

### Registro de entrada

Na tela de entrada, o usuário informa laboratório, origem, fornecedor/doador, data de recebimento e observações. Em seguida, adiciona linhas em uma tabela dinâmica. O campo de item será um `select`, autocomplete ou busca que consulta somente itens ativos previamente cadastrados no catálogo.

O valor de referência poderá preencher o campo de preço, mas o usuário poderá informar o valor histórico efetivamente pago ou estimado para aquela entrada. Uma entrada pode conter vários tipos de item e será enviada em um único `POST`, com uma linha para cada tipo selecionado.

Exemplo de entrada:

```text
Mouse sem fio  | quantidade: 5  | valor unitário: R$ 75,00
Monitor 24"    | quantidade: 10 | valor unitário: R$ 850,00
Teclado USB    | quantidade: 10 | valor unitário: R$ 45,00
```

O backend cria uma linha em `inventory_entry` e uma linha em `inventory_entry_item` para cada item diferente. Dez unidades do mesmo item continuam sendo uma única linha, com `quantity = 10`; não é criada uma linha por unidade física.

### Consulta do estoque

A tela de estoque exibirá o saldo por item no escopo escolhido. Sem filtro de laboratório, cada item será agregado entre os laboratórios do grupo; com um laboratório selecionado, o saldo será restrito a ele. O valor total do escopo poderá ser exibido no rodapé da tabela. A tela não repetirá cada recebimento; o histórico ficará separado para auditoria e detalhamento.

O cadastro do item representa o tipo permanente do produto, enquanto o valor da entrada representa o preço histórico daquele recebimento. Dessa forma, o mesmo item pode ser recebido diversas vezes, com origens, datas e valores diferentes.

## Implementação backend

- Seguir a estrutura hexagonal atual: domínio de estoque, portas de entrada/saída, casos de uso, adaptadores JPA/REST e migrações Flyway.
- Usar `BigDecimal` para quantidade e valores monetários; quantidades decimais serão aceitas apenas para unidades fracionáveis.
- Criar consultas agregadas para saldo e valuation, derivadas das entradas confirmadas; não manter um saldo editável separado.
- Configurar erros REST consistentes para item, laboratório ou grupo inexistente, item arquivado, dados inválidos e entrada já estornada.

## Testes e aceite

- Testar criação de itens consumíveis e duráveis, unidades inteiras e fracionáveis, e atualização segura do catálogo.
- Testar entrada com várias linhas, compra/doação/fomento, cálculo de saldo e valor, lote/validade opcionais e validação de escopo entre grupo, item e laboratório.
- Testar estorno sem apagar histórico e remoção correta do saldo e valor agregados.
- Testar documento somente com metadados, com PDF/imagem no MinIO e falhas de upload.
- Validar as migrações em MariaDB e cobrir os endpoints com testes de controller e casos de uso.

## Premissas

- A moeda inicial é BRL.
- A validade será apenas informativa nesta versão; itens vencidos não serão baixados automaticamente.
- O catálogo é compartilhado dentro do grupo, enquanto o saldo é apurado por laboratório.
- Como não há autenticação nem projetos no backend atual, a v1 não registrará o usuário que lançou a entrada nem associará movimentações a projetos.
